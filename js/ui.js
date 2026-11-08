/* NUMERA – UI helper: toast, modal, konfeti, suara, pizza SVG, pecahan berwarna */
(function () {
  'use strict';
  const N = window.NUMERA;

  /* ---------- Toast ---------- */
  N.toast = (msg, type = 'ok') => {
    const el = document.createElement('div');
    el.className = 'toast ' + type; el.textContent = msg;
    N.$('#toasts').appendChild(el);
    setTimeout(() => el.classList.add('out'), 3200);
    setTimeout(() => el.remove(), 3700);
  };

  /* ---------- Modal ---------- */
  N.modal = (html, opts = {}) => {
    const root = N.$('#modal-root');
    const back = document.createElement('div');
    back.className = 'backdrop';
    back.innerHTML = `<div class="modal ${opts.wide ? 'wide' : ''}" role="dialog" aria-modal="true"><button class="x" aria-label="Tutup">✖</button><div class="mbody">${html}</div></div>`;
    root.appendChild(back);
    const prev = document.activeElement;
    const close = () => { document.removeEventListener('keydown', onKey); back.remove(); if (opts.onClose) opts.onClose(); if (prev && prev.focus) prev.focus(); };
    const onKey = (e) => { if (e.key === 'Escape' && root.lastElementChild === back) close(); };
    document.addEventListener('keydown', onKey);
    N.$('.x', back).addEventListener('click', close);
    back.addEventListener('mousedown', (e) => { if (e.target === back && !opts.sticky) close(); });
    const f = N.$('input,select,textarea,button:not(.x)', back); if (f) setTimeout(() => f.focus(), 30);
    return { el: N.$('.mbody', back), close };
  };
  N.confirm = (msg, okLabel = 'Ya, hapus') => new Promise((res) => {
    let done = false;
    const finish = (v) => { if (done) return; done = true; res(v); };
    const m = N.modal(`<h3>Konfirmasi</h3><p>${N.esc(msg)}</p><div class="row end"><button class="btn btn-sm" data-r="0">Batal</button><button class="btn btn-sm btn-r" data-r="1">${N.esc(okLabel)}</button></div>`, { onClose: () => { if (!done) finish(false); } });
    N.$$('[data-r]', m.el).forEach((b) => b.addEventListener('click', () => { const v = b.dataset.r === '1'; finish(v); m.close(); }));
  });

  /* ---------- Suara (WebAudio, tanpa berkas) ---------- */
  let actx = null;
  N.muted = () => N.db.get('muted', false);
  N.setMuted = (v) => N.db.set('muted', !!v);
  const tone = (f, d, t = 0, type = 'sine', v = 0.18) => {
    if (N.muted()) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain(), s = actx.currentTime + t;
      o.type = type; o.frequency.value = f; o.connect(g); g.connect(actx.destination);
      g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(v, s + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, s + d);
      o.start(s); o.stop(s + d + 0.05);
    } catch (e) { /* audio tidak tersedia */ }
  };
  N.sfx = {
    click() { tone(660, 0.06, 0, 'triangle', 0.1); },
    ok() { tone(523, 0.12); tone(659, 0.12, 0.12); tone(784, 0.28, 0.24); },
    bad() { tone(220, 0.22, 0, 'sawtooth', 0.1); tone(165, 0.32, 0.2, 'sawtooth', 0.1); },
    win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, i * 0.14)); tone(1319, 0.5, 0.6); }
  };

  /* ---------- Konfeti ---------- */
  N.confetti = (n = 140) => {
    const c = N.$('#confetti'), x = c.getContext('2d');
    c.width = innerWidth; c.height = innerHeight; c.style.display = 'block';
    const cols = ['#FFD93D', '#4DB6FF', '#6BCB77', '#FF9F43', '#FF6B6B', '#B388FF'];
    const ps = Array.from({ length: n }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * c.height * 0.4, w: 6 + Math.random() * 8, h: 8 + Math.random() * 10, vx: -2 + Math.random() * 4, vy: 3 + Math.random() * 5, r: Math.random() * 6, vr: -0.2 + Math.random() * 0.4, c: cols[(Math.random() * cols.length) | 0] }));
    const t0 = performance.now();
    (function frame(t) {
      x.clearRect(0, 0, c.width, c.height);
      ps.forEach((p) => { p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); x.restore(); });
      if (t - t0 < 2600) requestAnimationFrame(frame); else { x.clearRect(0, 0, c.width, c.height); c.style.display = 'none'; }
    })(t0);
  };

  /* ---------- Visual pecahan ---------- */
  // pizza(n | Set, d, size, interaktif)
  N.pizza = (sh, d, size = 150, inter = false) => {
    const set = sh instanceof Set ? sh : new Set(Array.from({ length: sh }, (_, i) => i));
    const c = size / 2, r = size / 2 - 8;
    const pt = (a, rad) => { const t = (a * Math.PI) / 180; return [(c + rad * Math.cos(t)).toFixed(2), (c + rad * Math.sin(t)).toFixed(2)]; };
    let s = `<svg class="pizza ${inter ? 'inter' : ''}" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Pizza dibagi ${d} bagian, ${set.size} diarsir"><circle cx="${c}" cy="${c}" r="${r + 5}" fill="#E8A44A"/>`;
    for (let i = 0; i < d; i++) {
      const on = set.has(i), cls = `slice ${on ? 'on' : ''}`;
      if (d === 1) s += `<circle class="${cls}" data-i="0" cx="${c}" cy="${c}" r="${r}"/>`;
      else {
        const a0 = -90 + (i * 360) / d, a1 = -90 + ((i + 1) * 360) / d, [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r);
        s += `<path class="${cls}" data-i="${i}" d="M${c} ${c}L${x0} ${y0}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}Z"/>`;
      }
      if (on) { const [px, py] = pt(d === 1 ? 0 : -90 + ((i + 0.5) * 360) / d, d === 1 ? 0 : r * 0.6); s += `<circle cx="${px}" cy="${py}" r="${size / 24}" fill="#E4572E" pointer-events="none"/>`; }
    }
    return s + '</svg>';
  };
  // pecahan berwarna: pembilang kuning, penyebut biru
  N.frac = (n, d, cls = '') => `<span class="frac ${cls}" aria-label="${n} per ${d}"><b class="n">${n}</b><b class="d">${d}</b></span>`;
  N.bar = (n, d) => `<div class="fbar" aria-label="${n} dari ${d} bagian">${Array.from({ length: d }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>`;
  N.numchar = (num, color, delay = 0) => `<div class="numchar c${color}" style="animation-delay:${delay}s" aria-hidden="true"><span>${num}</span><i class="face">◕‿◕</i></div>`;
})();
