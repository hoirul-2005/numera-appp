/* NUMERA – Media Explorer (daftar file/video, pratinjau, pemutar mode proyektor) */
(function () {
  'use strict';
  const N = window.NUMERA;

  const VIDEO_EXT = /\.(mp4|webm|mkv|avi|mov|m4v|ogv|ogg|3gp|flv|wmv|mpg|mpeg|ts)(\?|#|$)/i;
  const YT = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i;
  const kindOf = (it) => {
    if (it.url && YT.test(it.url)) return 'video';
    const name = it.name || it.url || '', mime = it.mime || '';
    if (mime.startsWith('video/') || VIDEO_EXT.test(name)) return 'video';
    if (mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(name)) return 'image';
    if (mime === 'application/pdf' || /\.pdf$/i.test(name)) return 'pdf';
    if (mime.startsWith('text/') || /\.(txt|md|csv)$/i.test(name)) return 'text';
    return 'other';
  };
  const ICON = { video: '🎬', image: '🖼️', pdf: '📕', text: '📝', other: '📎' };
  const LABEL = { video: 'Video', image: 'Gambar', pdf: 'PDF', text: 'Teks', other: 'Dokumen' };
  N.mediaKind = kindOf;

  const blobUrl = async (it) => {
    if (it.url) return it.url;
    const b = await N.media.get(it.mediaId);
    if (!b) throw new Error('Berkas tidak ditemukan di penyimpanan peramban.');
    return URL.createObjectURL(b);
  };
  const fmt = (s) => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  async function buildPlayer(it, box, cleanup) {
    const yt = it.url && it.url.match(YT);
    if (yt) {
      box.innerHTML = `<div class="vp" id="vp"><iframe src="https://www.youtube.com/embed/${yt[1]}?rel=0" title="${N.esc(it.title)}" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
        <div class="pctl"><button class="btn btn-y" data-p="fs">📽️ Putar di Proyektor (Layar Penuh)</button><span class="muted" style="color:#ccc">Video YouTube memakai kontrol bawaan YouTube.</span></div></div>`;
      N.$('[data-p=fs]', box).addEventListener('click', () => toggleFs(N.$('#vp', box)));
      return;
    }
    let src;
    try { src = await blobUrl(it); } catch (e) { box.innerHTML = `<div class="err">${N.esc(e.message)}</div>`; return; }
    if (!it.url) cleanup.push(() => URL.revokeObjectURL(src));
    box.innerHTML = `<div class="vp" id="vp"><video id="vid" src="${N.esc(src)}" playsinline preload="metadata"></video>
      <div class="pctl">
        <button class="btn btn-y" data-p="play" aria-label="Putar atau jeda">▶️ Putar</button>
        <button class="btn" data-p="back" aria-label="Mundur 10 detik">⏪ 10</button>
        <button class="btn" data-p="fwd" aria-label="Maju 10 detik">10 ⏩</button>
        <input class="seek" type="range" min="0" max="1000" value="0" aria-label="Posisi video" data-p="seek">
        <span class="time" id="tm">0:00 / 0:00</span>
        <button class="btn" data-p="mute" aria-label="Bisukan">🔊</button>
        <input class="vol" type="range" min="0" max="100" value="100" aria-label="Volume" data-p="vol">
        <select data-p="rate" aria-label="Kecepatan" style="width:auto"><option value="0.5">0.5×</option><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select>
        <button class="btn btn-o" data-p="fs">📽️ Putar di Proyektor</button>
      </div></div>
      <div class="err hidden" id="verr">Peramban ini belum bisa memutar format <b>${N.esc((it.name || '').split('.').pop() || 'ini')}</b> secara langsung (misalnya .avi atau .mkv tertentu). Unduh lalu putar dengan aplikasi pemutar video (mis. VLC), atau unggah versi .mp4.
        <div style="margin-top:8px"><button class="btn btn-sm btn-b" data-p="dl">⬇️ Unduh Video</button></div></div>`;
    const v = N.$('#vid', box), vp = N.$('#vp', box), q = (k) => N.$(`[data-p=${k}]`, box);
    const sync = () => { const d = v.duration || 0; q('seek').value = d ? (v.currentTime / d) * 1000 : 0; N.$('#tm', box).textContent = fmt(v.currentTime) + ' / ' + fmt(d); };
    const setPlay = () => { q('play').textContent = v.paused ? '▶️ Putar' : '⏸️ Jeda'; };
    q('play').addEventListener('click', () => { v.paused ? v.play().catch(() => {}) : v.pause(); });
    v.addEventListener('click', () => { v.paused ? v.play().catch(() => {}) : v.pause(); });
    v.addEventListener('play', setPlay); v.addEventListener('pause', setPlay);
    v.addEventListener('timeupdate', sync); v.addEventListener('loadedmetadata', sync);
    v.addEventListener('error', () => { N.$('#verr', box).classList.remove('hidden'); });
    q('back').addEventListener('click', () => { v.currentTime = Math.max(0, v.currentTime - 10); });
    q('fwd').addEventListener('click', () => { v.currentTime = Math.min(v.duration || 1e9, v.currentTime + 10); });
    q('seek').addEventListener('input', (e) => { if (v.duration) v.currentTime = (e.target.value / 1000) * v.duration; });
    q('vol').addEventListener('input', (e) => { v.volume = e.target.value / 100; v.muted = v.volume === 0; q('mute').textContent = v.muted ? '🔇' : '🔊'; });
    q('mute').addEventListener('click', () => { v.muted = !v.muted; q('mute').textContent = v.muted ? '🔇' : '🔊'; });
    q('rate').addEventListener('change', (e) => { v.playbackRate = parseFloat(e.target.value); });
    q('fs').addEventListener('click', () => toggleFs(vp));
    const dl = N.$('[data-p=dl]', box); if (dl) dl.addEventListener('click', () => download(it));
    vp.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.key === ' ') { e.preventDefault(); v.paused ? v.play() : v.pause(); }
      if (e.key === 'ArrowRight') v.currentTime += 10; if (e.key === 'ArrowLeft') v.currentTime -= 10;
    });
    vp.tabIndex = 0;
  }

  function toggleFs(el) {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (el.requestFullscreen) el.requestFullscreen().catch(() => N.toast('Layar penuh ditolak peramban.', 'bad'));
    else N.toast('Peramban tidak mendukung layar penuh.', 'bad');
  }

  async function download(it) {
    if (it.url) { window.open(it.url, '_blank', 'noopener'); return; }
    try {
      const b = await N.media.get(it.mediaId);
      if (!b) throw new Error();
      const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = it.name || it.title;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch (e) { N.toast('Berkas tidak ditemukan.', 'bad'); }
  }

  async function openPreview(it) {
    const cleanup = [];
    const k = kindOf(it);
    const m = N.modal(`<h2>${ICON[k]} ${N.esc(it.title)}</h2><p class="muted">${N.esc(it.desc || '')}</p><div id="pv"><p>Memuat…</p></div>`, { wide: true, onClose: () => { cleanup.forEach((f) => f()); if (document.fullscreenElement) document.exitFullscreen(); } });
    const box = N.$('#pv', m.el);
    if (k === 'video') return buildPlayer(it, box, cleanup);
    try {
      const src = await blobUrl(it); if (!it.url) cleanup.push(() => URL.revokeObjectURL(src));
      if (k === 'image') box.innerHTML = `<img class="preview-img" src="${N.esc(src)}" alt="${N.esc(it.title)}">`;
      else if (k === 'pdf') box.innerHTML = `<iframe class="preview-frame" src="${N.esc(src)}" title="${N.esc(it.title)}"></iframe>`;
      else if (k === 'text' && !it.url) { const t = await (await N.media.get(it.mediaId)).text(); box.innerHTML = `<pre class="preview-txt">${N.esc(t.slice(0, 20000))}</pre>`; }
      else box.innerHTML = `<div class="info">Pratinjau langsung belum tersedia untuk jenis berkas ini. Silakan unduh/buka berkasnya.</div>`;
      box.innerHTML += `<div class="row" style="margin-top:12px"><button class="btn btn-sm btn-b" id="dl">⬇️ Unduh / Buka</button></div>`;
      N.$('#dl', box).addEventListener('click', () => download(it));
    } catch (e) { box.innerHTML = `<div class="err">${N.esc(e.message || 'Gagal memuat berkas.')}</div>`; }
  }

  N.mediaUI = {
    kindOf, ICON, LABEL, download, openPreview,
    /* filter: 'all' | 'video' */
    list(items, filter = 'all') {
      const shown = items.filter((i) => filter === 'all' || kindOf(i) === filter);
      const chips = filter === 'all' ? `<div class="chips" id="mchips">${['all:Semua', 'video:Video', 'pdf:PDF', 'image:Gambar', 'text:Teks', 'other:Dokumen'].map((c, n) => { const [k, l] = c.split(':'); return `<button class="chip ${n ? '' : 'on'}" data-f="${k}">${l}</button>`; }).join('')}</div>` : '';
      return `<div class="row between" style="margin:10px 0"><input id="msearch" type="search" placeholder="🔍 Cari judul atau deskripsi…" aria-label="Cari" style="max-width:360px">${chips}</div>
        <div class="grid g3" id="mgrid">${shown.length ? shown.map((it) => { const k = kindOf(it); return `<article class="card mcard" data-k="${k}" data-t="${N.esc((it.title + ' ' + (it.desc || '')).toLowerCase())}"><div class="ic">${ICON[k]}</div><h3>${N.esc(it.title)}</h3><p class="muted" style="margin:0">${N.esc(it.desc || '')}</p><div class="row"><span class="pill">${LABEL[k]}</span><span class="muted" style="font-size:.85rem">${it.url ? 'Tautan' : N.fmtSize(it.size)}</span></div><div class="row" style="margin-top:6px"><button class="btn btn-sm ${k === 'video' ? 'btn-o' : 'btn-b'}" data-open="${it.id}">${k === 'video' ? '▶️ Putar' : '👁️ Lihat'}</button><button class="btn btn-sm" data-dl="${it.id}">⬇️</button></div></article>`; }).join('') : '<div class="card center" style="grid-column:1/-1"><div style="font-size:3rem">📂</div><p>Belum ada berkas. Guru dapat menambahkannya lewat Dashboard Guru.</p></div>'}</div>`;
    },
    mount(root, items) {
      const byId = (id) => items.find((i) => i.id === id);
      let f = 'all';
      const apply = () => {
        const q = ((N.$('#msearch', root) || {}).value || '').toLowerCase();
        N.$$('#mgrid .mcard', root).forEach((c) => { c.classList.toggle('hidden', !((f === 'all' || c.dataset.k === f) && c.dataset.t.includes(q))); });
      };
      N.$$('[data-open]', root).forEach((b) => b.addEventListener('click', () => openPreview(byId(b.dataset.open))));
      N.$$('[data-dl]', root).forEach((b) => b.addEventListener('click', () => download(byId(b.dataset.dl))));
      const s = N.$('#msearch', root); if (s) s.addEventListener('input', apply);
      N.$$('#mchips .chip', root).forEach((c) => c.addEventListener('click', () => { f = c.dataset.f; N.$$('#mchips .chip', root).forEach((x) => x.classList.toggle('on', x === c)); apply(); }));
    }
  };
})();
