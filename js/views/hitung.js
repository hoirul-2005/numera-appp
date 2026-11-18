/* NUMERA – Cara Menghitung Pecahan Senilai */
(function () {
  'use strict';
  const N = window.NUMERA;
  const BASES = [[1, 2], [1, 3], [2, 3], [3, 4], [2, 5]];

  N.views.hitung = {
    render() {
      return `<section class="math-page">
        <header class="math-intro">
          <span class="eyebrow">🧮 Belajar pelan-pelan</span>
          <h1>Ayo Berhitung!</h1>
          <p>Pilih tiga hal di bawah ini: angka pertama, cara menghitung, dan angka kedua. Nanti kita lihat langkahnya bersama.</p>
        </header>

        <section class="quick-math" aria-label="Kalkulator berhitung sederhana">
          <h2>🌟 Pilih hitunganmu</h2>
          <div class="quick-math-fields">
            <label>Angka pertama<select id="quick-a" aria-label="Pilih angka pertama">${Array.from({ length: 12 }, (_, i) => i + 1).map((n) => `<option value="${n}" ${n === 6 ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
            <label>Cara menghitung<select id="quick-op" aria-label="Pilih cara menghitung"><option value="+">➕ Ditambah</option><option value="-">➖ Dikurangi</option><option value="×">✖️ Dikali</option><option value="÷">➗ Dibagi</option></select></label>
            <label>Angka kedua<select id="quick-b" aria-label="Pilih angka kedua">${Array.from({ length: 12 }, (_, i) => i + 1).map((n) => `<option value="${n}" ${n === 2 ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
          </div>
          <div class="quick-math-answer" id="quick-answer" aria-live="polite"></div>
        </section>

        <section class="fraction-lesson-intro"><span class="eyebrow">🍕 Misi pecahan</span><h2>Cara Menghitung Pecahan Senilai</h2><p>Pecahan senilai terlihat berbeda, tetapi nilainya sama. Kalikan angka atas dan bawah dengan angka yang sama.</p></section>

        <section class="math-picker" aria-label="Pilih pecahan dan angka pengali">
          <div class="math-picker-group">
            <h2>1. Pilih pecahan awal</h2>
            <div class="math-options" id="bchips" role="group" aria-label="Pecahan awal">${BASES.map(([n, d], i) => `<button type="button" class="math-option ${i === 0 ? 'on' : ''}" data-i="${i}" aria-pressed="${i === 0}">${n}/${d}</button>`).join('')}</div>
          </div>
          <div class="math-picker-group">
            <h2>2. Pilih angka pengali</h2>
            <div class="math-options" id="kchips" role="group" aria-label="Angka pengali">${[2, 3, 4, 5].map((k, i) => `<button type="button" class="math-option ${i === 0 ? 'on' : ''}" data-k="${k}" aria-pressed="${i === 0}">× ${k}</button>`).join('')}</div>
          </div>
        </section>

        <section class="math-board" aria-label="Langkah menghitung">
          <div class="math-progress"><span id="step-count">Langkah 1 dari 5</span><div class="math-progress-track"><span id="step-progress"></span></div></div>
          <div class="math-equation" id="sim" aria-live="polite"></div>
          <div class="math-explain" id="exp" aria-live="polite"></div>
          <div class="math-actions"><button type="button" class="math-reset" id="rst">↺ Ulangi dari awal</button><button type="button" class="btn" id="nxt">Langkah berikutnya →</button></div>
        </section>
      </section>`;
    },
    mount(root) {
      const quickA = N.$('#quick-a', root), quickB = N.$('#quick-b', root), quickOp = N.$('#quick-op', root);
      const quickAnswer = N.$('#quick-answer', root);
      function drawQuickMath() {
        const a = Number(quickA.value), b = Number(quickB.value), op = quickOp.value;
        let result, steps;
        if (op === '+') { result = a + b; steps = `Mulai dari ${a}, lalu hitung maju ${b} langkah: ${result}.`; }
        else if (op === '-') { result = a - b; steps = `Mulai dari ${a}, lalu mundur ${b} langkah: ${result}.`; }
        else if (op === '×') { result = a * b; steps = `Penjumlahan berulang: ${Array.from({ length: b }, () => a).join(' + ')} = ${result}.`; }
        else {
          const remainder = a % b;
          result = Math.floor(a / b);
          steps = remainder ? `${a} dibagi menjadi kelompok berisi ${b}: ada ${result} kelompok dan sisa ${remainder}.` : `Bagikan ${a} benda sama banyak ke ${b} kelompok. Tiap kelompok mendapat ${result}.`;
        }
        quickAnswer.innerHTML = `<div class="quick-equation"><span>${a}</span><b>${op}</b><span>${b}</span><b>=</b><strong>${result}${op === '÷' && a % b ? ` sisa ${a % b}` : ''}</strong></div><p>${steps}</p><div class="quick-objects" aria-hidden="true">${'⭐'.repeat(Math.min(Math.max(op === '÷' ? result : result, 0), 20))}</div>`;
      }
      [quickA, quickB, quickOp].forEach((field) => field.addEventListener('change', drawQuickMath));
      drawQuickMath();
      let bi = 0, k = 2, step = 0;
      const MAX = 4;
      const sim = N.$('#sim', root), exp = N.$('#exp', root), nxt = N.$('#nxt', root);

      function draw() {
        const [n, d] = BASES[bi];
        const final = step === MAX;
        const factor = N.frac(k, k, 'math-frac');
        const original = `<span class="math-term"><span class="math-caption">Pecahan awal</span>${N.frac(n, d, 'math-frac')}</span>`;
        const multiplied = `<span class="math-term"><span class="math-caption">Kalikan atas dan bawah</span>${N.frac(`${n} × ${k}`, `${d} × ${k}`, 'math-frac')}</span>`;
        const result = `<span class="math-term math-result"><span class="math-caption">Pecahan baru</span>${N.frac(n * k, d * k, 'math-frac')}</span>`;

        if (final) {
          sim.innerHTML = `<div class="math-pizza-pair"><div class="math-pizza-item">${N.pizza(n, d, 112)}<b>${n}/${d}</b><span>pizza pertama</span></div><span class="math-equals">=</span><div class="math-pizza-item">${N.pizza(n * k, d * k, 112)}<b>${n * k}/${d * k}</b><span>pizza kedua</span></div></div>`;
        } else {
          const parts = [original];
          if (step >= 1) parts.push(`<span class="math-symbol">×</span><span class="math-term"><span class="math-caption">Nilainya sama dengan 1</span>${factor}</span>`);
          if (step >= 2) parts.push(`<span class="math-symbol">=</span>${multiplied}`);
          if (step >= 3) parts.push(`<span class="math-symbol">=</span>${result}`);
          sim.innerHTML = parts.join('');
        }

        const explanations = [
          `Kita mulai dari <b>${n}/${d}</b>. Angka ${n} ada di atas. Angka ${d} ada di bawah.`,
          `Sekarang kalikan dengan <b>${k}/${k}</b>. Hasil ${k} dibagi ${k} adalah 1, jadi nilainya tetap sama.`,
          `Kalikan kedua angka atas dengan ${k}. Kalikan kedua angka bawah dengan ${k} juga.`,
          `Angka atas: <b>${n} × ${k} = ${n * k}</b>. Angka bawah: <b>${d} × ${k} = ${d * k}</b>.`,
          `Hebat! <b>${n}/${d} sama dengan ${n * k}/${d * k}</b>. Lihat, bagian pizza yang diarsir sama besar!`
        ];
        exp.innerHTML = `<span class="math-bubble" aria-hidden="true">${final ? '🎉' : ['👀', '✖️', '🧮', '✅'][step]}</span><p>${explanations[step]}</p>`;
        N.$('#step-count', root).textContent = `Langkah ${step + 1} dari 5`;
        N.$('#step-progress', root).style.width = `${((step + 1) / 5) * 100}%`;
        nxt.disabled = final;
        nxt.textContent = final ? 'Selesai ✓' : 'Langkah berikutnya →';
      }

      nxt.addEventListener('click', () => {
        if (step < MAX) {
          step++;
          draw();
          step === MAX ? (N.sfx.ok(), N.confetti(70)) : N.sfx.click();
        }
      });
      N.$('#rst', root).addEventListener('click', () => { step = 0; draw(); });
      N.$$('#bchips .math-option', root).forEach((button) => button.addEventListener('click', () => {
        bi = Number(button.dataset.i);
        step = 0;
        N.$$('#bchips .math-option', root).forEach((option) => {
          const active = option === button;
          option.classList.toggle('on', active);
          option.setAttribute('aria-pressed', String(active));
        });
        draw();
      }));
      N.$$('#kchips .math-option', root).forEach((button) => button.addEventListener('click', () => {
        k = Number(button.dataset.k);
        step = 0;
        N.$$('#kchips .math-option', root).forEach((option) => {
          const active = option === button;
          option.classList.toggle('on', active);
          option.setAttribute('aria-pressed', String(active));
        });
        draw();
      }));
      draw();
    }
  };
})();
