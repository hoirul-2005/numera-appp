/* NUMERA – router, navigasi, kontrol akses (RBAC), inisialisasi */
(function () {
  'use strict';
  const N = window.NUMERA;

  const ROUTES = {
    beranda: { view: 'home' }, cerita: { view: 'story' }, materi: { view: 'materi' }, video: { view: 'video' }, hitung: { view: 'hitung' },
    latihan: { view: 'latihan', auth: 'login' }, evaluasi: { view: 'evaluasi', auth: 'login' }, riwayat: { view: 'riwayat', auth: 'login' },
    admin: { view: 'admin', auth: 'guru' }, login: { view: 'login' }, daftar: { view: 'daftar' }
  };
  const NAV = [['beranda', '🏠 Beranda'], ['cerita', '🍕 Cerita'], ['materi', '📘 Materi'], ['video', '🎬 Video Pembelajaran'], ['hitung', '🧮 Cara Menghitung'], ['latihan', '🎯 Ayo Berlatih'], ['evaluasi', '🏆 Evaluasi']];

  const routeName = () => { const r = (location.hash.replace(/^#\/?/, '').split('?')[0] || 'beranda'); return ROUTES[r] ? r : 'beranda'; };

  function header(name) {
    const u = N.auth.current();
    const links = NAV.map(([k, l]) => `<a href="#/${k}" class="${name === k ? 'active' : ''}" ${name === k ? 'aria-current="page"' : ''}>${l}</a>`).join('');
    const extra = u
      ? `${u.role === 'siswa' ? `<a href="#/riwayat" class="${name === 'riwayat' ? 'active' : ''}">📜 Riwayat</a>` : `<a href="#/admin" class="${name === 'admin' ? 'active' : ''}">🧑‍🏫 Dashboard Admin</a><a href="#/riwayat" class="${name === 'riwayat' ? 'active' : ''}">📜 Riwayat</a>`}<button class="link" id="lo" title="Keluar">🚪 Keluar (${N.esc(u.name.split(' ')[0])})</button>`
      : `<a href="#/login" class="${name === 'login' || name === 'daftar' ? 'active' : ''}">🔑 Login Admin</a>`;
    N.$('#hdr').innerHTML = `<div class="hbar"><a class="brand" href="#/beranda"><span class="logo">½</span>NUMERA</a><button class="burger" id="bg" aria-label="Menu" aria-expanded="false">☰</button>
      <nav id="nv" aria-label="Menu utama">${links}${extra}<button class="link" id="snd" title="Suara" aria-label="Aktif/nonaktifkan suara">${N.muted() ? '🔇' : '🔊'}</button><button class="link" id="big" title="Perbesar teks untuk proyektor" aria-label="Mode teks besar">🔎 A+</button></nav></div>`;
    N.$('#bg').addEventListener('click', (e) => { const o = N.$('#nv').classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); });
    N.$('#snd').addEventListener('click', (e) => { N.setMuted(!N.muted()); e.currentTarget.textContent = N.muted() ? '🔇' : '🔊'; N.sfx.click(); });
    N.$('#big').addEventListener('click', () => { document.body.classList.toggle('big'); N.db.set('bigtext', document.body.classList.contains('big')); });
    const lo = N.$('#lo'); if (lo) lo.addEventListener('click', () => { N.auth.logout(); N.toast('Sampai jumpa! 👋'); location.hash = '#/beranda'; N.render(); });
  }

  N.render = async function () {
    let name = routeName(); const def = ROUTES[name], u = N.auth.current();
    // ---- RBAC guard ----
    if (def.auth === 'login' && !u) { sessionStorage.setItem('numera.redirect', '#/' + name); N.toast('Silakan masuk dulu untuk membuka menu ini 🔐', 'bad'); location.hash = '#/login'; return; }
    if (def.auth === 'guru' && !(u && N.isAdminRole(u.role))) {
      if (!u) { sessionStorage.setItem('numera.redirect', '#/admin'); location.hash = '#/login'; return; }
      N.toast('Halaman ini hanya untuk admin.', 'bad'); N.audit('akses_ditolak', name); location.hash = '#/beranda'; return;
    }
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    document.title = 'NUMERA – ' + name[0].toUpperCase() + name.slice(1);
    header(name);
    const main = N.$('#main'), v = N.views[def.view];
    main.innerHTML = await v.render();
    if (v.mount) v.mount(main);
    window.scrollTo(0, 0);
  };

  async function init() {
    try {
      N.seedContent();
      if (N.sec && typeof N.sec.seedUsers === 'function') {
        await N.sec.seedUsers();
      } else {
        const all = N.db.get('users', []);
        if (!all.length) {
          const mk = async (name, username, pw, role) => {
            const salt = (window.crypto && crypto.getRandomValues) ? Array.from(new Uint8Array(16)).map((n) => n.toString(16).padStart(2, '0')).join('') : String(Date.now()) + Math.random();
            const hash = await N.sec.hash(pw, salt);
            return { id: N.uid(), name, username, role, salt, hash, mfaSecret: role === 'guru' ? ('demo-' + String(Date.now())).slice(0, 16) : null, created: Date.now() };
          };
          N.db.set('users', [await mk('Bu Guru', 'guru', 'Guru#2026', 'guru'), await mk('Siswa Contoh', 'siswa', 'Siswa#123', 'siswa')]);
        }
      }
      if (N.db.get('bigtext', false)) document.body.classList.add('big');
    } catch (e) { console.error(e); }
    window.addEventListener('hashchange', N.render);
    if (!location.hash) location.hash = '#/beranda'; else N.render();
  }
  init();
})();
