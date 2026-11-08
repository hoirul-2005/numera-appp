/* NUMERA – Cara Menghitung Pecahan Senilai (simulasi bertahap) */
(function () {
  'use strict';
  const N = window.NUMERA;
  const BASES = [[1, 2], [1, 3], [2, 3], [3, 4], [2, 5]];

  N.views.hitung = {
    render() {
      return `<h2>🧮 Cara Menghitung Pecahan Senilai</h2>
      <div class="card y"><p style="margin:0"><b>Rumus:</b> kalikan <span class="legend" style="display:inline-flex;margin:0"><span class="l-n">pembilang</span></span> dan <span class="legend" style="display:inline-flex;margin:0"><span class="l-d">penyebut</span></span> dengan <b>bilangan yang sama</b>.</p></div>
      <div class="card" style="margin-top:16px"><div class="row"><b>Pecahan awal:</b><div class="chips" id="bchips">${BASES.map(([n, d], i) => `<button class="chip ${i === 0 ? 'on' : ''}" data-i="${i}">${n}/${d}</button>`).join('')}</div></div>
        <div class="row" style="margin-top:10px"><b>Dikali:</b><div class="chips" id="kchips">${[2, 3, 4, 5].map((k, i) => `<button class="chip ${i === 0 ? 'on' : ''}" data-k="${k}">${k}</button>`).join('')}</div></div></div>
      <div class="card b" style="margin-top:16px;padding-top:60px;padding-bottom:60px"><div class="sim" id="sim"></div></div>
      <div class="card g explain" id="exp" aria-live="polite" style="margin-top:16px"></div>
      <div class="row" style="margin-top:16px;justify-content:center"><button class="btn" id="rst">🔄 Ulangi</button><button class="btn btn-y btn-big" id="nxt">Langkah berikutnya ➡️</button></div>`;
    },
    mount(root) {
      let bi = 0, k = 2, step = 0;
      const MAX = 4;
      const sim = N.$('#sim', root), exp = N.$('#exp', root), nxt = N.$('#nxt', root);
      function draw() {
        const [n, d] = BASES[bi];
        const S = (s) => (step >= s ? 'show' : '');
        sim.innerHTML = `
          <div class="step show">${N.frac(n, d, 'xl')}</div>
          <div class="op step ${S(1)}">×</div>
          <div class="step ${S(1)}">${N.frac(k, k, 'xl')}</div>
          <div class="op step ${S(2)}">=</div>
          <div class="step ${S(2)}">${N.frac(`${n}×${k}`, `${d}×${k}`, 'xl')}</div>
          <div class="op step ${S(3)}">=</div>
          <div class="step ${S(3)}">${N.frac(n * k, d * k, 'xl')}<span class="arrowv up">⬆ ${n} × ${k} = ${n * k}</span><span class="arrowv dn">⬇ ${d} × ${k} = ${d * k}</span></div>`;
        const text = [
          `Kita mulai dari pecahan <b>${n}/${d}</b>. Pembilangnya <span class="l-n" style="padding:2px 10px;border-radius:99px">${n}</span> dan penyebutnya <span class="l-d" style="padding:2px 10px;border-radius:99px">${d}</span>.`,
          `Kalikan dengan <b>${k}/${k}</b>. Pecahan ${k}/${k} nilainya 1, jadi nilai pecahan tidak berubah!`,
          `Kalikan pembilang dengan ${k} dan penyebut dengan ${k}.`,
          `<span class="l-n" style="padding:2px 10px;border-radius:99px">${n} × ${k} = ${n * k}</span> dan <span class="l-d" style="padding:2px 10px;border-radius:99px">${d} × ${k} = ${d * k}</span>.`,
          `🎉 Jadi <b>${n}/${d} = ${n * k}/${d * k}</b>. Lihat pizzanya: arsirannya sama besar!<div class="eq" style="margin-top:8px">${N.pizza(n, d, 110)}<span>=</span>${N.pizza(n * k, d * k, 110)}</div>`
        ];
        exp.innerHTML = text[step];
        nxt.disabled = step >= MAX;
      }
      nxt.addEventListener('click', () => { if (step < MAX) { step++; draw(); step >= MAX ? (N.sfx.ok(), N.confetti(70)) : N.sfx.click(); } });
      N.$('#rst', root).addEventListener('click', () => { step = 0; draw(); });
      N.$$('#bchips .chip', root).forEach((c) => c.addEventListener('click', () => { bi = +c.dataset.i; step = 0; N.$$('#bchips .chip', root).forEach((x) => x.classList.toggle('on', x === c)); draw(); }));
      N.$$('#kchips .chip', root).forEach((c) => c.addEventListener('click', () => { k = +c.dataset.k; step = 0; N.$$('#kchips .chip', root).forEach((x) => x.classList.toggle('on', x === c)); draw(); }));
      draw();
    }
  };
})();
