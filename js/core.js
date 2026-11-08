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

  /* ---------- Penyimpanan terstruktur (localStorage) ---------- */
  const P = 'numera.';
  N.db = {
    get(k, d) { try { const v = localStorage.getItem(P + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(P + k, JSON.stringify(v)); return true; } catch (e) { console.error(e); return false; } },
    remove(k) { localStorage.removeItem(P + k); }
  };

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
