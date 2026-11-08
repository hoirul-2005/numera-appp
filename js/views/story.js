/* NUMERA – Cerita: Ayo, Berbagi Pizza! */
(function () {
  'use strict';
  const N = window.NUMERA;

  const steps = [
    { text: 'Rani dan Budi mendapat dua pizza yang sama besar. Mereka ingin berbagi dan memakannya!', vis: () => `<div class="eq"><div class="pz">${N.pizza(0, 1, 170)}<b>Pizza Rani</b></div><div class="pz">${N.pizza(0, 1, 170)}<b>Pizza Budi</b></div></div>` },
    { text: 'Rani memotong pizzanya menjadi 2 bagian sama besar, lalu memakan 1 bagian. Rani makan ½ pizza.', vis: () => `<div class="eq"><div class="pz">${N.pizza(1, 2, 190)}<b>Rani: ${N.frac(1, 2)}</b></div></div>` },
    { text: 'Budi memotong pizzanya menjadi 4 bagian sama besar, lalu memakan 2 bagian. Budi makan 2/4 pizza.', vis: () => `<div class="eq"><div class="pz">${N.pizza(2, 4, 190)}<b>Budi: ${N.frac(2, 4)}</b></div></div>` },
    { text: 'Hmm, coba lihat keduanya! Siapa yang makan pizza lebih banyak?', vis: () => `<div class="eq"><div class="pz">${N.pizza(1, 2, 150)}<b>Rani ${N.frac(1, 2, 'sm')}</b></div><span>❓</span><div class="pz">${N.pizza(2, 4, 150)}<b>Budi ${N.frac(2, 4, 'sm')}</b></div></div>`, quiz: true }
  ];

  N.views.story = {
    render() {
      return `<h2>🍕 Ayo, Berbagi Pizza!</h2><div class="stage" id="stage"></div>
      <div class="dots" id="dots"></div>
      <div class="row center" style="justify-content:center"><button class="btn" id="prev">⬅️ Sebelumnya</button><button class="btn btn-y" id="next">Lanjut ➡️</button></div>`;
    },
    mount(root) {
      let i = 0, solved = false;
      const stage = N.$('#stage', root), dots = N.$('#dots', root), prev = N.$('#prev', root), next = N.$('#next', root);

      function conclusion() {
        const m = N.modal(`<div class="center"><h2>🎉 Kesimpulan</h2>
          <div class="eq">${N.pizza(1, 2, 140)}<span>=</span>${N.pizza(2, 4, 140)}</div>
          <p class="eq">${N.frac(1, 2, 'xl')}<span>=</span>${N.frac(2, 4, 'xl')}</p>
          <p style="font-size:1.25rem">Bagian yang dimakan Rani dan Budi <b>sama banyak</b>. Pecahan ½ dan 2/4 disebut <b>pecahan senilai</b>.</p>
          <div class="row" style="justify-content:center"><a class="btn btn-g" href="#/materi" data-close>Pelajari Materi 📘</a><button class="btn" data-close>Tutup</button></div></div>`);
        N.$$('[data-close]', m.el).forEach((b) => b.addEventListener('click', m.close));
        N.sfx.win(); N.confetti();
      }

      function draw() {
        const s = steps[i];
        stage.innerHTML = `<div class="center">${s.vis()}</div><div class="speech">${s.text}</div>` +
          (s.quiz ? `<div class="row" style="justify-content:center;margin-top:10px">${['Rani', 'Budi', 'Sama banyak'].map((c) => `<button class="btn choice" data-c="${c}">${c}</button>`).join('')}</div><p class="center" id="hint"></p>` : '');
        dots.innerHTML = steps.map((_, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('');
        prev.disabled = i === 0;
        next.disabled = i === steps.length - 1 && !solved;
        next.textContent = i === steps.length - 1 ? 'Selesai ✅' : 'Lanjut ➡️';
        N.$$('.choice', stage).forEach((b) => b.addEventListener('click', () => {
          if (b.dataset.c === 'Sama banyak') {
            b.classList.add('right'); solved = true; next.disabled = false; conclusion();
          } else {
            b.classList.add('wrong'); N.sfx.bad();
            N.$('#hint', stage).textContent = 'Coba lihat lagi arsirannya. Bandingkan luas kedua pizza! 🤔';
          }
        }));
      }
      prev.addEventListener('click', () => { if (i > 0) { i--; N.sfx.click(); draw(); } });
      next.addEventListener('click', () => {
        N.sfx.click();
        if (i < steps.length - 1) { i++; draw(); } else location.hash = '#/materi';
      });
      draw();
    }
  };
})();
