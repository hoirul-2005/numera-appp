/* NUMERA – Materi pecahan senilai dengan visual tema pilihan */
(function () {
  'use strict';
  const N = window.NUMERA;
  const themes = () => N.learningConfig().themes.map((theme) => [theme.id, theme.icon, theme.name]);
  const operations = () => N.learningConfig().operations;

  function themeStorageKey() {
    const user = N.auth.current();
    const id = user ? String(user.id || user.username || user.role).replace(/[^\w-]/g, '_') : 'guest';
    return `storyTheme_${id}`;
  }

  N.views.materi = {
    render() {
      const mats = N.db.get('materi', []);
      const savedTheme = N.db.get(themeStorageKey(), 'Pizza');
      const activeTheme = themes().some(([id]) => id === savedTheme) ? savedTheme : themes()[0][0];
      const config = N.learningConfig();
      const examples = [[1, 2], [2, 4], [3, 6]];
      return `<section class="material-page">
        <header class="material-intro"><span class="eyebrow">📘 Misi ${N.esc(config.subjectName)} ${N.esc(config.gradeName)}</span><h1>${N.esc(config.subjectName)} Seru!</h1>
          <p>Kita belajar langkah demi langkah. Pilih tanda hitung, lihat gambarnya, lalu coba contoh pecahan.</p></header>

        <section class="operation-learning" aria-labelledby="operation-title">
          <span class="eyebrow">Langkah 1 · 🧩 Pilih operasi</span><h2 id="operation-title">Lihat contoh berhitung</h2>
          <p>Pilih tanda hitung. Gambar di bawah akan menunjukkan cara menghitungnya.</p>
          <div class="operation-tabs" role="group" aria-label="Pilih operasi matematika">${operations().map((op, i) => `<button type="button" class="operation-tab ${i === 0 ? 'active' : ''}" data-operation="${op.id}" aria-pressed="${i === 0}">${N.esc(op.icon)} ${N.esc(op.label)}</button>`).join('')}</div>
          <article class="operation-lesson" id="operation-lesson" aria-live="polite"></article>
        </section>

        <div class="material-rule"><span aria-hidden="true">💡</span><p><b>Ingat cara membaca pecahan:</b> angka atas menunjukkan bagian yang diwarnai. Angka bawah menunjukkan jumlah semua potongan. Contoh <b>2/4</b>: 2 potongan diwarnai dari 4 potongan.</p></div>

        <form class="story-theme-form material-theme-form" id="material-theme-form">
          <div><span class="eyebrow">Langkah 2 · 🎨 Pilih gambar</span><label for="material-theme">Pilih tema yang kamu suka</label><p>Gambar pilihanmu akan dipakai pada contoh pecahan.</p></div>
          <div class="story-theme-controls"><select id="material-theme" name="theme">${themes().map(([id, icon, name]) => `<option value="${N.esc(id)}" ${id === activeTheme ? 'selected' : ''}>${N.esc(icon)} ${N.esc(name)}</option>`).join('')}</select><button class="btn" type="submit">Gunakan tema</button></div>
        </form>

        <section class="material-examples"><span class="eyebrow">Langkah 3 · 🍕 Amati gambar</span><h2>Pecahan Senilai</h2><p class="material-hint">Pecahan senilai terlihat berbeda, tetapi menunjukkan bagian yang sama banyak. Bagian berwarna adalah bagian yang kita ambil.</p>
          <div class="material-example-grid" id="material-examples">${examples.map(([n, d]) => `<article class="material-example">${N.themePicture(activeTheme, n, d, 250, false, `${n} dari ${d} potongan diwarnai`)}<strong>${N.frac(n, d, 'xl')}</strong><p><b>${n} potongan diwarnai</b><br>dari ${d} potongan semuanya</p></article>`).join('')}</div>
          <div class="material-equality">${N.frac(1, 2)}<span>=</span>${N.frac(2, 4)}<span>=</span>${N.frac(3, 6)}<b>Semua menunjukkan setengah!</b></div>
        </section>

        <section class="material-practice">
          <div><span class="eyebrow">Langkah 4 · 🎯 Coba sendiri</span><h2>Warnai setengah gambar</h2><p>Pilih jumlah potongan. Lalu sentuh potongan satu per satu sampai setengahnya berwarna.</p></div>
          <div class="math-options" id="dchips" role="group" aria-label="Jumlah bagian">${[2, 4, 6, 8].map((d, i) => `<button type="button" class="math-option ${i === 1 ? 'on' : ''}" data-d="${d}" aria-pressed="${i === 1}">${d} bagian</button>`).join('')}</div>
          <div class="material-interactive"><div id="ipz"></div><div><strong id="ifr"></strong><p id="imsg" aria-live="polite"></p></div></div>
        </section>

        ${mats.length ? `<section class="material-notes"><h2>🧑‍🏫 Catatan dari Guru</h2><div class="material-note-grid">${mats.map((m) => `<article class="material-note"><h3>${N.esc(m.title)}</h3><p>${N.esc(m.body)}</p></article>`).join('')}</div></section>` : ''}
      </section>`;
    },
    mount(root) {
      let theme = N.$('#material-theme', root).value, d = 4, sel = new Set();
      let operation = operations()[0];
      const drawOperation = () => {
        const icon = N.esc(themes().find(([id]) => id === theme)?.[1] || '🍎');
        const answer = operation.id === 'tambah' ? operation.a + operation.b : operation.id === 'kurang' ? operation.a - operation.b : operation.id === 'kali' ? operation.a * operation.b : operation.a / operation.b;
        const items = (count) => `${Array.from({ length: Math.min(count, 12) }, () => `<span aria-hidden="true">${icon}</span>`).join('')}${count > 12 ? `<b class="operation-more">+${count - 12}</b>` : ''}`;
        const groups = operation.id === 'kali'
          ? `<div class="operation-groups">${Array.from({ length: Math.min(operation.a, 8) }, (_, i) => `<div class="operation-group"><small>Kelompok ${i + 1}</small><span>${items(operation.b)}</span></div>`).join('')}${operation.a > 8 ? `<p class="operation-more-groups">dan ${operation.a - 8} kelompok lagi</p>` : ''}</div>`
          : operation.id === 'bagi'
            ? `<div class="operation-groups">${Array.from({ length: Math.min(operation.b, 8) }, (_, i) => `<div class="operation-group"><small>Anak ${i + 1} mendapat</small><span>${items(operation.a / operation.b)}</span></div>`).join('')}${operation.b > 8 ? `<p class="operation-more-groups">dan ${operation.b - 8} anak lagi mendapat bagian yang sama</p>` : ''}</div>`
            : `<div class="operation-groups operation-counting">${items(operation.a)}<b class="operation-sign">${operation.id === 'tambah' ? '+' : '−'}</b><span class="${operation.id === 'kurang' ? 'operation-removed' : ''}">${items(operation.b)}</span></div>`;
        const tip = operation.id === 'tambah' ? `Gabungkan ${operation.a} benda dan ${operation.b} benda.` : operation.id === 'kurang' ? `Mulai dari ${operation.a}, lalu ambil ${operation.b} benda.` : operation.id === 'kali' ? `${operation.a} kelompok, setiap kelompok berisi ${operation.b} benda.` : `Bagikan ${operation.a} benda sama banyak kepada ${operation.b} anak.`;
        N.$('#operation-lesson', root).innerHTML = `<div class="operation-equation" aria-label="${operation.a} ${N.esc(operation.sign)} ${operation.b} sama dengan ${answer}"><span>${operation.a}</span><span class="operation-symbol">${N.esc(operation.sign)}</span><span>${operation.b}</span><span>=</span><strong>${answer}</strong></div><p class="operation-caption">${N.esc(tip)}</p>${groups}<p class="operation-story">${N.esc(operation.icon)} ${N.esc(operation.story)}</p><p class="operation-tip"><b>Ingat:</b> ${operation.id === 'tambah' ? 'tanda + artinya benda digabung.' : operation.id === 'kurang' ? 'tanda − artinya benda diambil.' : operation.id === 'kali' ? 'tanda × artinya kelompok yang sama dijumlahkan berulang.' : 'tanda ÷ artinya benda dibagi sama banyak.'} Jawabannya <strong>${answer}</strong>.</p>`;
      };
      N.$$('.operation-tab', root).forEach((button) => button.addEventListener('click', () => {
        operation = operations().find((op) => op.id === button.dataset.operation) || operations()[0];
        N.$$('.operation-tab', root).forEach((tab) => { const active = tab === button; tab.classList.toggle('active', active); tab.setAttribute('aria-pressed', String(active)); });
        drawOperation(); N.sfx.click();
      }));
      const drawExamples = () => {
        N.$('#material-examples', root).innerHTML = [[1, 2], [2, 4], [3, 6]].map(([n, den]) => `<article class="material-example">${N.themePicture(theme, n, den, 250, false, `${n} dari ${den} potongan diwarnai`)}<strong>${N.frac(n, den, 'xl')}</strong><p><b>${n} potongan diwarnai</b><br>dari ${den} potongan semuanya</p></article>`).join('');
      };
      const drawInteractive = () => {
        const area = N.$('#ipz', root);
        area.innerHTML = N.themePicture(theme, sel, d, 280, true, `${sel.size} dari ${d} bagian dipilih`);
        N.$('#ifr', root).innerHTML = N.frac(sel.size, d, 'xl');
        const msg = N.$('#imsg', root);
        if (sel.size && sel.size * 2 === d) {
          msg.className = 'material-feedback ok';
          msg.textContent = `✅ Hebat! ${sel.size}/${d} sama dengan 1/2.`;
        } else {
          msg.className = 'material-feedback';
          msg.textContent = sel.size ? `${sel.size}/${d} belum sama dengan 1/2. Coba lagi!` : 'Pilih bagian pada gambar untuk mulai.';
        }
        const togglePiece = (piece) => {
          const index = Number(piece.dataset.i);
          sel.has(index) ? sel.delete(index) : sel.add(index);
          N.sfx.click(); drawInteractive();
          if (sel.size && sel.size * 2 === d) { N.sfx.ok(); N.confetti(60); }
        };
        N.$$('[data-i]', area).forEach((piece) => {
          piece.addEventListener('click', () => togglePiece(piece));
          if (piece.matches('.pizza .slice')) piece.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); togglePiece(piece); }
          });
        });
      };

      N.$('#material-theme-form', root).addEventListener('submit', (event) => {
        event.preventDefault();
        theme = N.$('#material-theme', root).value;
        N.db.set(themeStorageKey(), theme);
        sel = new Set(); drawExamples(); drawInteractive(); drawOperation();
        N.toast(`Tema ${theme} dipakai untuk materi dan cerita.`);
      });
      N.$$('#dchips .math-option', root).forEach((button) => button.addEventListener('click', () => {
        d = Number(button.dataset.d); sel = new Set();
        N.$$('#dchips .math-option', root).forEach((option) => {
          const active = option === button;
          option.classList.toggle('on', active);
          option.setAttribute('aria-pressed', String(active));
        });
        drawInteractive();
      }));
      drawOperation(); drawInteractive();
    }
  };
})();
