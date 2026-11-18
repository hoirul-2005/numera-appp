/* NUMERA – keamanan: hashing, rate limit, MFA (simulasi TOTP), sesi, RBAC */
(function () {
  'use strict';
  const N = window.NUMERA;
  const MAX_FAILS = 5, LOCK_MS = 15 * 60 * 1000, IDLE_MS = 60 * 60 * 1000, MFA_MS = 5 * 60 * 1000;

  /* hash non-kriptografis cadangan (hanya jika WebCrypto tidak tersedia) */
  const cyrb = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  };
  const hex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  const randHex = (n = 16) => { const a = new Uint8Array(n); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => (a[i] = Math.floor(Math.random() * 256))); return hex(a); };

  const sec = (N.sec = {
    /* Simulasi bcrypt/Argon2: PBKDF2-SHA256 100.000 iterasi + salt unik per pengguna */
    async hash(pw, salt) {
      if (window.crypto && crypto.subtle) {
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
        const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' }, key, 256);
        return 'pbkdf2$' + hex(bits);
      }
      let h = pw + ':' + salt;
      for (let i = 0; i < 3000; i++) h = cyrb(h, i).toString(16);
      return 'fallback$' + h;
    },
    async verify(pw, user) {
      const h = await sec.hash(pw, user.salt);
      if (h.length !== user.hash.length) return false;
      let d = 0; for (let i = 0; i < h.length; i++) d |= h.charCodeAt(i) ^ user.hash.charCodeAt(i);
      return d === 0; // perbandingan waktu-konstan
    },
    /* Kode MFA 6 digit berbasis waktu (30 detik) – simulasi TOTP */
    totp(secret, offset = 0) {
      const w = Math.floor(Date.now() / 30000) + offset;
      return String(cyrb(secret + ':' + w) % 1000000).padStart(6, '0');
    },
    totpRemaining() { return 30 - (Math.floor(Date.now() / 1000) % 30); },
    validPassword(pw) { return typeof pw === 'string' && pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw); }
  });

  /* ---------- Seed akun demo ---------- */
  sec.seedUsers = async function () {
    const users = N.db.get('users', []);
    if (users.length) return;
    const mk = async (name, username, pw, role) => {
      const salt = randHex(16);
      return { id: N.uid(), name, username, role, salt, hash: await sec.hash(pw, salt), mfaSecret: role === 'guru' ? randHex(10) : null, created: Date.now() };
    };
    N.db.set('users', [await mk('Bu Guru', 'guru', 'Guru#2026', 'guru'), await mk('Siswa Contoh', 'siswa', 'Siswa#123', 'siswa')]);
  };

  /* ---------- Auth & sesi ----------
     Catatan: JavaScript murni tidak dapat membuat cookie HttpOnly (hanya server yang bisa).
     Di sini token sesi disimpan di sessionStorage (tidak dibagikan antar tab/tertutup saat browser ditutup),
     kedaluwarsa otomatis setelah 60 menit tidak aktif. Saat memakai backend nyata, ganti dengan Set-Cookie: HttpOnly; Secure; SameSite=Strict. */
  const SKEY = 'numera.session', MKEY = 'numera.mfa';
  const readS = (k) => { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } };

  N.auth = {
    current() {
      const s = readS(SKEY);
      if (!s) return null;
      if (Date.now() - s.last > IDLE_MS) { sessionStorage.removeItem(SKEY); return null; }
      const u = (N.db.get('users', []) || []).find((x) => x.id === s.userId);
      if (!u) { sessionStorage.removeItem(SKEY); return null; }
      s.last = Date.now(); sessionStorage.setItem(SKEY, JSON.stringify(s));
      return { id: u.id, name: u.name, username: u.username, role: u.role === 'admin' ? 'admin' : u.role };
    },
    _start(u) { sessionStorage.setItem(SKEY, JSON.stringify({ token: randHex(24), userId: u.id, last: Date.now() })); sessionStorage.removeItem(MKEY); },
    isGuru() { const u = this.current(); return !!u && N.isAdminRole(u.role); },
    logout() { N.audit('logout'); sessionStorage.removeItem(SKEY); sessionStorage.removeItem(MKEY); },

    async login(username, pw) {
      const uname = String(username || '').trim().toLowerCase();
      const locks = N.db.get('lock', {});
      const L = locks[uname] || { fails: 0, until: 0 };
      if (L.until > Date.now()) return { error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${Math.ceil((L.until - Date.now()) / 60000)} menit.` };
      const user = (N.db.get('users', []) || []).find((x) => x.username === uname);
      // selalu lakukan hashing agar waktu respons seragam (mencegah user enumeration)
      const ok = user ? await sec.verify(pw, user) : (await sec.hash(String(pw), 'dummy-salt'), false);
      if (!ok) {
        L.fails = (L.fails || 0) + 1;
        if (L.fails >= MAX_FAILS) { L.until = Date.now() + LOCK_MS; L.fails = 0; locks[uname] = L; N.db.set('lock', locks); N.audit('akun_dikunci', uname); return { error: 'Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit.' }; }
        locks[uname] = L; N.db.set('lock', locks);
        return { error: 'Username atau password salah.' }; // pesan seragam
      }
      delete locks[uname]; N.db.set('lock', locks);
      if (N.isAdminRole(user.role)) {
        sessionStorage.setItem(MKEY, JSON.stringify({ userId: user.id, exp: Date.now() + MFA_MS, tries: 0 }));
        return { mfa: true };
      }
      this._start(user); N.audit('login', user.username);
      return { ok: true };
    },

    mfaPending() { const m = readS(MKEY); return m && m.exp > Date.now() ? m : null; },
    mfaDemoCode() { const m = this.mfaPending(); if (!m) return null; const u = N.db.get('users', []).find((x) => x.id === m.userId); return u ? sec.totp(u.mfaSecret) : null; },
    cancelMfa() { sessionStorage.removeItem(MKEY); },
    async verifyMfa(code) {
      const m = this.mfaPending();
      if (!m) return { error: 'Sesi verifikasi berakhir. Silakan login ulang.', expired: true };
      const u = N.db.get('users', []).find((x) => x.id === m.userId);
      const c = String(code || '').trim();
      const valid = u && [-1, 0, 1].some((o) => sec.totp(u.mfaSecret, o) === c);
      if (!valid) {
        m.tries++;
        if (m.tries >= MAX_FAILS) { sessionStorage.removeItem(MKEY); return { error: 'Terlalu banyak kode salah. Silakan login ulang.', expired: true }; }
        sessionStorage.setItem(MKEY, JSON.stringify(m));
        return { error: 'Kode verifikasi tidak valid.' };
      }
      this._start(u); N.audit('login_mfa', u.username);
      return { ok: true };
    },

    async register(name, username, pw, role = 'siswa') {
      const requestedRole = role === 'admin' ? 'admin' : role === 'guru' ? 'guru' : 'siswa';
      const current = this.current();
      if (N.isAdminRole(requestedRole) && !(current && N.isAdminRole(current.role))) return { error: 'Hanya admin/guru yang bisa menambahkan akun admin atau guru.' };

      const uname = String(username || '').trim().toLowerCase();
      name = String(name || '').trim();
      if (name.length < 2 || name.length > 40) return { error: 'Nama harus 2–40 karakter.' };
      if (!/^[a-z0-9_]{3,20}$/.test(uname)) return { error: 'Username 3–20 karakter: huruf kecil, angka, atau garis bawah.' };
      if (!sec.validPassword(pw)) return { error: 'Password minimal 8 karakter dan mengandung huruf serta angka.' };
      const users = N.db.get('users', []);
      if (users.some((u) => u.username === uname)) return { error: 'Username sudah dipakai, coba yang lain.' };
      const salt = randHex(16);
      users.push({ id: N.uid(), name, username: uname, role: requestedRole, salt, hash: await sec.hash(pw, salt), mfaSecret: N.isAdminRole(requestedRole) ? randHex(10) : null, created: Date.now() });
      N.db.set('users', users);
      return { ok: true, role: requestedRole };
    }
  };
})();
