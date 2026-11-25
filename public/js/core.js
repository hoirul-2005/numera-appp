/* NUMERA – core: namespace, util, penyimpanan (localStorage + IndexedDB) */
(function () {
  'use strict';
  const N = (window.NUMERA = { views: {} });

  N.$ = (s, r = document) => r.querySelector(s);
  N.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  N.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  N.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  N.sameId = (a, b) => String(a ?? '') === String(b ?? '');
  N.isAdminRole = (role) => role === 'guru' || role === 'admin';
  N.fmtDate = (t) => new Date(t).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  N.fmtSize = (b) => (b == null ? '-' : b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : b < 1073741824 ? (b / 1048576).toFixed(1) + ' MB' : (b / 1073741824).toFixed(2) + ' GB');
  N.shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  N.KKM = 75; // Kriteria Ketuntasan Minimal
  N.EVAL_COUNT = 5;
  const LEARNING_DEFAULTS = {
    appName: 'NUMERA', mediaLabel: 'Media Belajar', homeSlogan: 'Jelajahi pecahan senilai lewat cerita, permainan, dan kegiatan interaktif bersama NUMERA.', subjectName: 'Matematika', gradeName: 'Kelas IV', kkm: 75, evalCount: 5,
    themes: [
      { id: 'Pizza', name: 'Pizza', icon: '🍕', plural: 'pizza', title: 'Berbagi Pizza' },
      { id: 'Balon', name: 'Balon', icon: '🎈', plural: 'balon', title: 'Berbagi Balon' },
      { id: 'Buah', name: 'Buah', icon: '🍎', plural: 'buah apel', title: 'Berbagi Buah' },
      { id: 'Kartu', name: 'Kartu', icon: '🃏', plural: 'kartu', title: 'Berbagi Kartu' }
    ],
    operations: [
      { id: 'tambah', label: 'Tambah', sign: '+', icon: '➕', a: 3, b: 2, story: 'Gabungkan 3 benda dan 2 benda. Semuanya ada 5!' },
      { id: 'kurang', label: 'Kurang', sign: '−', icon: '➖', a: 5, b: 2, story: 'Ada 5 benda. Diambil 2. Sisanya 3!' },
      { id: 'kali', label: 'Kali', sign: '×', icon: '✖️', a: 3, b: 2, story: 'Ada 3 kelompok. Tiap kelompok berisi 2 benda. Semuanya ada 6!' },
      { id: 'bagi', label: 'Bagi', sign: '÷', icon: '➗', a: 6, b: 2, story: 'Ada 6 benda untuk 2 anak. Setiap anak mendapat 3!' }
    ]
  };
  N.storyDefaults = {
    title: 'Ayo, Berbagi {item}!',
    step1Label: 'Lihat bendanya',
    step1Text: 'Ada {count} {item}. Ayo kita bagikan sama rata kepada {children} anak!',
    step2Label: 'Bagikan sama rata',
    step2Text: '{count} {item} dibagikan sama rata kepada {children} anak. Setiap anak mendapat {answer} {item}.',
    step3Label: 'Coba jawab sendiri',
    step3Text: 'Sekarang kamu tahu cara membaginya. Berapa {item} untuk setiap anak?',
    successTitle: 'Yeay, kamu berhasil!',
    successText: 'Hebat! {count} {item} dibagikan kepada {children} anak. Setiap anak mendapat {answer} {item}.',
    successEncouragement: 'Terus berlatih, kamu pasti makin pintar!'
  };

  /* ---------- Penyimpanan terstruktur (localStorage) ---------- */
  const P = 'numera.';
  N.db = {
    get(k, d) { try { const v = localStorage.getItem(P + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(P + k, JSON.stringify(v)); return true; } catch (e) { console.error(e); return false; } },
    remove(k) { localStorage.removeItem(P + k); }
  };
  N.learningConfig = () => {
    const saved = N.db.get('learningConfig', {});
    return { ...LEARNING_DEFAULTS, ...saved,
      themes: Array.isArray(saved.themes) && saved.themes.length ? saved.themes : LEARNING_DEFAULTS.themes,
      operations: Array.isArray(saved.operations) && saved.operations.length ? saved.operations : LEARNING_DEFAULTS.operations };
  };
  N.storyContent = () => ({ ...N.storyDefaults, ...N.db.get('storyContent', {}) });
  N.storyLibrary = () => {
    const saved = N.db.get('storyLibrary', null);
    if (Array.isArray(saved) && saved.length) return saved.map((story) => ({ ...N.storyDefaults, ...story }));
    return [{ id: 'cerita-awal', ...N.storyDefaults, ...N.db.get('storyContent', {}) }];
  };
  N.applyLearningConfig = () => {
    const config = N.learningConfig();
    const kkm = Number(config.kkm), evalCount = Number(config.evalCount);
    N.KKM = Number.isFinite(kkm) ? Math.max(0, Math.min(100, kkm)) : 75;
    N.EVAL_COUNT = Number.isFinite(evalCount) ? Math.max(1, Math.min(100, evalCount)) : 5;
    return config;
  };
  N.learningTheme = (id) => N.learningConfig().themes.find((theme) => theme.id === id) || N.learningConfig().themes[0];

  /* ---------- Penyimpanan berkas besar (IndexedDB) ---------- */
  N.media = {
    _db: null,
    open() {
      if (!this._db) {
        this._db = new Promise((res, rej) => {
          const r = indexedDB.open('numera-media', 1);
          r.onupgradeneeded = () => r.result.createObjectStore('blobs');
          r.onsuccess = () => res(r.result);
          r.onerror = () => rej(r.error);
        });
      }
      return this._db;
    },
    async _tx(mode, fn) {
      const db = await this.open();
      return new Promise((res, rej) => {
        const t = db.transaction('blobs', mode);
        const req = fn(t.objectStore('blobs'));
        t.oncomplete = () => res(req && req.result);
        t.onerror = () => rej(t.error);
        t.onabort = () => rej(t.error);
      });
    },
    put(id, blob) { return this._tx('readwrite', (s) => s.put(blob, id)); },
    get(id) { return this._tx('readonly', (s) => s.get(id)); },
    del(id) { return this._tx('readwrite', (s) => s.delete(id)); }
  };

  /* ---------- Log audit ---------- */
  N.audit = (action, detail) => {
    const log = N.db.get('audit', []);
    const u = N.auth && N.auth.current ? N.auth.current() : null;
    log.unshift({ t: Date.now(), user: u ? u.username : '-', role: u ? u.role : '-', action, detail: detail || '' });
    N.db.set('audit', log.slice(0, 500));
  };
})();
