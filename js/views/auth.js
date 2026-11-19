/* NUMERA – Login (dengan MFA untuk guru) & Daftar siswa */
(function () {
  'use strict';
  const N = window.NUMERA;

  const goAfter = () => { const r = sessionStorage.getItem('numera.redirect'); sessionStorage.removeItem('numera.redirect'); const u = N.auth.current(); location.hash = r || (u && N.isAdminRole(u.role) ? '#/admin' : '#/beranda'); };

  N.views.login = {
    render() {
      if (N.auth.current()) return `<section class="login-page"><div class="login-card login-already"><span class="login-lock" aria-hidden="true">✅</span><h2>Kamu sudah masuk</h2><p>Sesi pengelola sedang aktif.</p><a class="btn btn-y" href="#/beranda">Ke Beranda</a></div></section>`;
      const mfa = N.auth.mfaPending();
      if (mfa) return `<section class="login-page login-mfa"><div class="login-card"><div class="login-card-heading"><span class="login-lock" aria-hidden="true">🔐</span><div><h2>Verifikasi 2 langkah</h2><p>Langkah terakhir untuk masuk ke dashboard admin.</p></div></div>
        <div class="login-demo-code"><b>🔎 Kode demo</b><p>Masukkan kode 6 digit ini untuk melanjutkan.</p><strong id="demo">${N.auth.mfaDemoCode()}</strong><small>Kode berubah dalam <span id="rem">${N.sec.totpRemaining()}</span> detik.</small></div>
        <form id="f" class="login-form" autocomplete="off"><label for="c">Kode verifikasi</label><input id="c" inputmode="numeric" pattern="\\d{6}" maxlength="6" placeholder="000000" required autofocus>
        <div id="e" aria-live="polite"></div><div class="login-actions"><button class="btn btn-y">Verifikasi & Masuk</button><button type="button" class="btn login-cancel" id="cancel">Kembali</button></div></form></div></section>`;
      return `<section class="login-page"><div class="login-shell"><aside class="login-welcome"><span class="eyebrow">🧑‍🏫 Area Pengelola</span><div class="login-mascot" aria-hidden="true">📚</div><h1>Halo, Guru!</h1><p>Masuk untuk mengatur materi, soal, tema, dan video pembelajaran.</p><div class="login-benefits"><span>📘 Kelola materi</span><span>🧩 Atur bank soal</span><span>🎬 Tambah video</span></div></aside>
        <div class="login-card"><div class="login-card-heading"><span class="login-lock" aria-hidden="true">🔐</span><div><h2>Login Admin</h2><p>Masukkan akun pengelola untuk melanjutkan.</p></div></div>
        <form id="f" class="login-form" autocomplete="on"><label for="u">Username admin</label><input id="u" required maxlength="30" autocomplete="username" placeholder="Contoh: guru"><label for="p">Password</label><input id="p" type="password" required autocomplete="current-password" placeholder="Masukkan password">
        <div id="e" aria-live="polite"></div><div class="login-actions"><button class="btn btn-y">Masuk ke Dashboard</button></div></form>
        <div class="login-student-note"><span aria-hidden="true">🌟</span><p><b>Siswa tidak perlu login.</b><br>Langsung pilih Belajar, Ayo Berlatih, atau Evaluasi dari menu.</p><a href="#/beranda">Ke Beranda</a></div></div></div></section>`;
    },

    mount(root) {
      const f = N.$('#f', root); if (!f) return;
      const e = N.$('#e', root), showErr = (m) => { e.innerHTML = `<div class="err" role="alert">${N.esc(m)}</div>`; };
      if (N.auth.mfaPending()) {
        const t = setInterval(() => { const d = N.$('#demo'); if (!d) return clearInterval(t); d.textContent = N.auth.mfaDemoCode() || ''; N.$('#rem').textContent = N.sec.totpRemaining(); }, 1000);
        N.$('#cancel', root).addEventListener('click', () => { N.auth.cancelMfa(); N.render(); });
        f.addEventListener('submit', async (ev) => {
          ev.preventDefault();
          const r = await N.auth.verifyMfa(N.$('#c', root).value);
          if (r.ok) { N.toast('Selamat datang, Guru! 👩‍🏫'); goAfter(); } else if (r.expired) { N.toast(r.error, 'bad'); N.render(); } else showErr(r.error);
        });
        return;
      }
      if (N.auth.current()) return;
      f.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const btn = N.$('button.btn-y', f); btn.disabled = true;
        const r = await N.auth.login(N.$('#u', root).value, N.$('#p', root).value);
        btn.disabled = false;
        if (r.error) { showErr(r.error); N.$('#p', root).value = ''; N.sfx.bad(); }
        else if (r.mfa) N.render();
        else { N.toast('Berhasil masuk! 🎉'); goAfter(); }
      });
    }
  };

  N.views.daftar = {
    render() {
      return `<div class="card formbox"><h2>🎒 Daftar Siswa Baru</h2><form id="f" autocomplete="off">
        <label for="n">Nama lengkap</label><input id="n" required maxlength="40">
        <label for="u">Username</label><input id="u" required maxlength="20" placeholder="huruf kecil/angka/_">
        <label for="p">Password</label><input id="p" type="password" required minlength="8" autocomplete="new-password" placeholder="min. 8 karakter, huruf + angka">
        <label for="p2">Ulangi password</label><input id="p2" type="password" required autocomplete="new-password">
        <div id="e" aria-live="polite"></div><div class="row" style="margin-top:14px"><button class="btn btn-g">Daftar</button><a class="btn" href="#/login">Sudah punya akun</a></div></form></div>`;
    },
    mount(root) {
      const f = N.$('#f', root), e = N.$('#e', root);
      f.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        if (N.$('#p', root).value !== N.$('#p2', root).value) { e.innerHTML = '<div class="err">Password tidak sama.</div>'; return; }
        const r = await N.auth.register(N.$('#n', root).value, N.$('#u', root).value, N.$('#p', root).value);
        if (r.error) e.innerHTML = `<div class="err" role="alert">${N.esc(r.error)}</div>`;
        else { N.toast('Pendaftaran berhasil! Silakan masuk.'); location.hash = '#/login'; }
      });
    }
  };
})();
