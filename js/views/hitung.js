/* NUMERA – Cara Menghitung Pecahan Senilai */
(function () {
  'use strict';
  const N = window.NUMERA;
  const EXAMPLES = [{ n: 1, d: 2, k: 2 }, { n: 2, d: 3, k: 3 }];

  N.views.hitung = {
    render() {
      return `<section class="math-page">
        <header class="math-intro">
          <span class="eyebrow">🧮 Belajar pelan-pelan</span>
          <h1>Bagaimana Cara Menentukan Pecahan Senilai?</h1>
          <p>Pecahan senilai dapat dicari dengan mengalikan pembilang dan penyebut dengan bilangan yang sama. Ikuti contoh langkah demi langkah di bawah ini.</p>
        </header>

        <section class="fraction-anatomy" aria-labelledby="fraction-anatomy-title">
          <div><span class="eyebrow">Kenali bagian pecahan</span><h2 id="fraction-anatomy-title">Anatomi Pecahan</h2><p>Contoh pecahan <b>1/2</b>: angka atas disebut pembilang, angka bawah disebut penyebut.</p></div>
          <div class="anatomy-card"><div class="anatomy-fraction"><b class="anatomy-numerator">1</b><i></i><b class="anatomy-denominator">2</b></div><div class="anatomy-key"><div><span class="anatomy-badge numerator-badge">1</span><span><b>Pembilang</b><small>Angka di atas</small></span></div><div><span class="anatomy-badge denominator-badge">2</span><span><b>Penyebut</b><small>Angka di bawah</small></span></div></div></div>
        </section>

        <section class="equiv-stepper" aria-labelledby="equiv-stepper-title">
          <span class="eyebrow">✨ Simulasi langkah demi langkah</span><h2 id="equiv-stepper-title">Ayo Cari Pecahan Senilai!</h2>
          <div class="equiv-example-tabs" role="tablist" aria-label="Pilih contoh pecahan"><button type="button" class="equiv-example-tab active" id="equiv-tab-0" data-example="0" role="tab" aria-controls="equiv-step-card" aria-selected="true">Contoh 1 · 1/2 × 2</button><button type="button" class="equiv-example-tab" id="equiv-tab-1" data-example="1" role="tab" aria-controls="equiv-step-card" aria-selected="false">Contoh 2 · 2/3 × 3</button></div>
          <div class="equiv-step-card" id="equiv-step-card" role="tabpanel" aria-labelledby="equiv-tab-0"><div class="math-progress"><span id="equiv-step-count" aria-live="polite"></span><div class="math-progress-track"><span id="equiv-step-progress"></span></div></div><div class="equiv-step-visual" id="equiv-step-visual" aria-live="polite"></div><p class="equiv-step-explanation" id="equiv-step-explanation" aria-live="polite"></p><div class="math-actions"><button type="button" class="math-reset" id="equiv-reset">↺ Ulangi contoh</button><button type="button" class="btn" id="equiv-next">Langkah berikutnya →</button></div></div>
        </section>

        <aside class="fraction-reminder"><span aria-hidden="true">💡</span><div><b>Jangan lupa!</b><p>Pembilang dan penyebut harus dikalikan dengan bilangan yang sama agar nilai pecahannya tetap sama.</p></div></aside>

        <section class="quick-math" aria-label="Kalkulator berhitung sederhana">
          <h2>🌟 Coba hitungan lainnya</h2>
          <div class="quick-math-fields">
            <label>Angka pertama<select id="quick-a" aria-label="Pilih angka pertama">${Array.from({ length: 12 }, (_, i) => i + 1).map((n) => `<option value="${n}" ${n === 6 ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
            <label>Cara menghitung<select id="quick-op" aria-label="Pilih cara menghitung"><option value="+">➕ Ditambah</option><option value="-">➖ Dikurangi</option><option value="×">✖️ Dikali</option><option value="÷">➗ Dibagi</option></select></label>
            <label>Angka kedua<select id="quick-b" aria-label="Pilih angka kedua">${Array.from({ length: 12 }, (_, i) => i + 1).map((n) => `<option value="${n}" ${n === 2 ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
          </div>
          <div class="quick-math-answer" id="quick-answer" aria-live="polite"></div>
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
      let exampleIndex = 0, step = 0;
      const MAX = 3;
      const visual = N.$('#equiv-step-visual', root), explanation = N.$('#equiv-step-explanation', root), next = N.$('#equiv-next', root);

      function draw() {
        const { n, d, k } = EXAMPLES[exampleIndex], resultN = n * k, resultD = d * k;
        const topRow = `<div class="equiv-operation-row"><span class="equiv-role numerator-role">Pembilang</span><b class="equiv-number numerator-number">${n}</b><span class="equiv-times">× ${k}</span><span class="equiv-arrow">→</span><b class="equiv-number numerator-number">${resultN}</b>${step === MAX ? `<span class="equiv-factor">× ${k}</span>` : ''}</div>`;
        const bottomRow = `<div class="equiv-operation-row"><span class="equiv-role denominator-role">Penyebut</span><b class="equiv-number denominator-number">${d}</b><span class="equiv-times">× ${k}</span><span class="equiv-arrow">→</span><b class="equiv-number denominator-number">${resultD}</b>${step === MAX ? `<span class="equiv-factor">× ${k}</span>` : ''}</div>`;
        visual.innerHTML = `<div class="equiv-working"><div class="equiv-start"><span>Pecahan awal</span><div class="equiv-fraction"><b class="numerator-number">${n}</b><i></i><b class="denominator-number">${d}</b></div></div>${step >= 1 ? `<div class="equiv-operations">${topRow}${step >= 2 ? bottomRow : ''}</div>` : ''}${step === MAX ? `<div class="equiv-final"><span>Hasil pecahan senilai</span><strong>${n}/${d} = ${resultN}/${resultD}</strong></div>` : ''}</div>`;
        const explanations = [
          `Langkah 1: Tulis pecahan awal <b>${n}/${d}</b>. Angka atas adalah pembilang, angka bawah adalah penyebut.`,
          `Langkah 2: Kalikan pembilang (angka kuning) dengan ${k}: <b>${n} × ${k} = ${resultN}</b>.`,
          `Langkah 3: Kalikan penyebut (angka biru) dengan ${k}: <b>${d} × ${k} = ${resultD}</b>. Gunakan bilangan pengali yang sama.`,
          `Langkah 4: Kedua bagian dikalikan ${k}. Jadi, <b>${n}/${d} = ${resultN}/${resultD}</b>. Nilai pecahannya tetap sama!`
        ];
        explanation.innerHTML = `<span class="equiv-step-emoji" aria-hidden="true">${['👀', '🟡', '🔵', '🎉'][step]}</span><span>${explanations[step]}</span>`;
        N.$('#equiv-step-count', root).textContent = `Langkah ${step + 1} dari 4`;
        N.$('#equiv-step-progress', root).style.width = `${((step + 1) / 4) * 100}%`;
        next.disabled = step === MAX;
        next.textContent = step === MAX ? 'Contoh selesai ✓' : 'Langkah berikutnya →';
      }

      next.addEventListener('click', () => {
        if (step < MAX) { step++; draw(); step === MAX ? (N.sfx.ok(), N.confetti(70)) : N.sfx.click(); }
      });
      N.$('#equiv-reset', root).addEventListener('click', () => { step = 0; draw(); N.sfx.click(); });
      N.$$('.equiv-example-tab', root).forEach((button) => button.addEventListener('click', () => {
        exampleIndex = Number(button.dataset.example); step = 0;
        N.$$('.equiv-example-tab', root).forEach((tab) => { const active = tab === button; tab.classList.toggle('active', active); tab.setAttribute('aria-selected', String(active)); });
        N.$('#equiv-step-card', root).setAttribute('aria-labelledby', button.id);
        draw(); N.sfx.click();
      }));
      draw();
    }
  };
})();
