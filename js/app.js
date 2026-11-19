/* NUMERA – router, navigasi, kontrol akses (RBAC), inisialisasi */
(function () {
  'use strict';
  const N = window.NUMERA;

  const ROUTES = {
    beranda: { view: 'home' }, belajar: { view: 'belajar' }, cerita: { view: 'belajar' }, materi: { view: 'belajar' }, video: { view: 'video' }, hitung: { view: 'hitung' },
    latihan: { view: 'latihan' }, evaluasi: { view: 'evaluasi' }, riwayat: { view: 'riwayat' },
    admin: { view: 'admin', auth: 'guru' }, login: { view: 'login' }, daftar: { view: 'daftar' }
  };
  const NAV = [['beranda', '🏠 Beranda'], ['belajar', '📚 Belajar'], ['video', '🎬 Video Pembelajaran'], ['hitung', '🧮 Cara Menghitung'], ['latihan', '🎯 Ayo Berlatih'], ['evaluasi', '🏆 Evaluasi'], ['riwayat', '📜 Riwayat']];

  const routeName = () => { const r = (location.hash.replace(/^#\/?/, '').split('?')[0] || 'beranda'); return ROUTES[r] ? r : 'beranda'; };

  function header(name) {
    const u = N.auth.current();
    const config = N.learningConfig(), appName = config.appName;
    const links = NAV.map(([k, l]) => { const active = k === 'belajar' ? ['belajar', 'cerita', 'materi'].includes(name) : name === k; return `<a href="#/${k}" class="${active ? 'active' : ''}" ${active ? 'aria-current="page"' : ''}>${l}</a>`; }).join('');
    const extra = `${u && N.isAdminRole(u.role) ? `<a href="#/admin" class="btn white ${name === 'admin' ? 'active' : ''}">🧑‍🏫 Admin</a>` : ''}${u ? `<button class="link" id="lo" title="Keluar">🚪 Keluar</button>` : `<a href="#/login" class="btn ${name === 'login' || name === 'daftar' ? 'active' : ''}">🔑 Login Admin</a>`}`;
    N.$('#hdr').innerHTML = `<div class="top"><div class="wrap"><a class="brand" href="#/beranda"><span class="brand-cube">½</span>${N.esc(appName)}</a><button class="mobile-menu" id="menu-toggle" type="button" aria-expanded="false" aria-controls="nv">☰ Menu</button>
      <nav class="nav" id="nv" aria-label="Menu utama">${links}${extra}<button class="font-control" id="font-down" type="button" aria-label="Kecilkan ukuran teks" title="Kecilkan teks">A−</button><button class="font-control" id="font-up" type="button" aria-label="Besarkan ukuran teks" title="Besarkan teks">A+</button></nav></div></div>`;
    const footerBrand = N.$('.foot .wrap span');
    if (footerBrand) footerBrand.textContent = `${appName} · ${config.mediaLabel.toUpperCase()} ${config.subjectName.toUpperCase()}`;
    N.$('#menu-toggle').addEventListener('click', (event) => {
      const open = N.$('#nv').classList.toggle('open');
      event.currentTarget.setAttribute('aria-expanded', String(open));
    });
    const scaleSteps = ['small', 'normal', 'large'];
    const applyFontScale = (scale) => { document.body.dataset.fontScale = scale; N.db.set('fontScale', scale); };
    const savedScale = N.db.get('fontScale', 'normal');
    applyFontScale(scaleSteps.includes(savedScale) ? savedScale : 'normal');
    N.$('#font-down').addEventListener('click', () => {
      const current = scaleSteps.indexOf(document.body.dataset.fontScale || 'normal');
      applyFontScale(scaleSteps[Math.max(0, current - 1)]);
    });
    N.$('#font-up').addEventListener('click', () => {
      const current = scaleSteps.indexOf(document.body.dataset.fontScale || 'normal');
      applyFontScale(scaleSteps[Math.min(scaleSteps.length - 1, current + 1)]);
    });
    const lo = N.$('#lo'); if (lo) lo.addEventListener('click', () => { N.auth.logout(); N.toast('Sampai jumpa! 👋'); location.hash = '#/beranda'; N.render(); });
  }

  N.render = async function () {
    let name = routeName(); const def = ROUTES[name], u = N.auth.current();
    // Hanya halaman admin yang memerlukan sesi admin/guru.
    if (def.auth === 'guru' && !(u && N.isAdminRole(u.role))) {
      if (!u) { sessionStorage.setItem('numera.redirect', '#/admin'); location.hash = '#/login'; return; }
      N.toast('Halaman ini hanya untuk admin.', 'bad'); N.audit('akses_ditolak', name); location.hash = '#/beranda'; return;
    }
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    document.title = N.learningConfig().appName + ' – ' + name[0].toUpperCase() + name.slice(1);
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
    } catch (e) { console.error(e); }
    window.addEventListener('hashchange', N.render);
    if (!location.hash) location.hash = '#/beranda'; else N.render();
  }
  init();
})();
