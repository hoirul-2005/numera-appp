/* NUMERA – Materi + pizza interaktif + perpustakaan file */
(function () {
  'use strict';
  const N = window.NUMERA;

  N.views.materi = {
    render() {
      const mats = N.db.get('materi', []), files = N.db.get('files', []);
      return `<h2>📘 Materi: Pecahan Senilai</h2>
      <div class="card y stack"><h3>Apa itu pecahan senilai?</h3>
        <p><b>Pecahan senilai</b> adalah pecahan yang <b>tampak berbeda</b> tetapi <b>nilainya sama</b>. Bagian yang diarsir luasnya sama besar.</p>
        <div class="legend"><span class="l-n">Kuning = Pembilang (bagian yang diambil)</span><span class="l-d">Biru = Penyebut (jumlah bagian seluruhnya)</span></div>
      </div>
      <h3 style="margin-top:26px">Lihat arsirannya!</h3>
      <div class="grid g3">${[[1, 2], [2, 4], [3, 6]].map(([n, d]) => `<div class="card center"><div class="pz">${N.pizza(n, d, 150)}${N.frac(n, d, 'xl')}${N.bar(n, d)}</div></div>`).join('')}</div>
      <p class="eq" style="margin-top:14px">${N.frac(1, 2)}<span>=</span>${N.frac(2, 4)}<span>=</span>${N.frac(3, 6)}</p>

      <div class="card b" style="margin-top:26px"><h3>🍕 Coba sendiri! Klik potongan pizza</h3>
        <p>Pilih jumlah potongan, lalu klik potongan untuk mengarsir. Buat pecahan yang senilai dengan ${N.frac(1, 2, 'sm')}!</p>
        <div class="chips" id="dchips">${[2, 4, 6, 8].map((d, i) => `<button class="chip ${i === 1 ? 'on' : ''}" data-d="${d}">${d} potong</button>`).join('')}</div>
        <div class="pz" style="margin-top:14px"><div id="ipz"></div><div id="ifr" class="eq"></div><div id="imsg" class="fb" aria-live="polite"></div></div>
      </div>

      ${mats.length ? `<h3 style="margin-top:26px">Catatan dari Guru</h3><div class="grid g2">${mats.map((m) => `<div class="card o"><h3>${N.esc(m.title)}</h3><p style="white-space:pre-wrap">${N.esc(m.body)}</p></div>`).join('')}</div>` : ''}

      <h2 style="margin-top:34px">📂 Perpustakaan File & Video</h2>
      <div id="lib">${N.mediaUI.list(files)}</div>`;
    },
    mount(root) {
      const files = N.db.get('files', []);
      N.mediaUI.mount(N.$('#lib', root), files);
      let d = 4, sel = new Set();
      const draw = () => {
        N.$('#ipz', root).innerHTML = N.pizza(sel, d, 190, true);
        const n = sel.size;
        N.$('#ifr', root).innerHTML = N.frac(n, d);
        const msg = N.$('#imsg', root);
        if (n && n * 2 === d) { msg.className = 'fb ok'; msg.textContent = `✅ Hebat! ${n}/${d} senilai dengan 1/2.`; }
        else { msg.className = 'fb'; msg.textContent = n ? `${n}/${d} belum senilai dengan 1/2. Coba lagi!` : 'Klik potongan pizza untuk mengarsirnya.'; }
        N.$$('.slice', N.$('#ipz', root)).forEach((s) => s.addEventListener('click', () => {
          const i = +s.dataset.i; sel.has(i) ? sel.delete(i) : sel.add(i); N.sfx.click(); draw();
          if (sel.size * 2 === d && sel.size) { N.sfx.ok(); N.confetti(60); }
        }));
      };
      N.$$('#dchips .chip', root).forEach((c) => c.addEventListener('click', () => { d = +c.dataset.d; sel = new Set(); N.$$('#dchips .chip', root).forEach((x) => x.classList.toggle('on', x === c)); draw(); }));
      draw();
    }
  };
})();
