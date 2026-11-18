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
      const mats = N.db.get('materi', []), files = N.db.get('files', []);
      const savedTheme = N.db.get(themeStorageKey(), 'Pizza');
      const activeTheme = themes().some(([id]) => id === savedTheme) ? savedTheme : themes()[0][0];
      const config = N.learningConfig();
      const examples = [[1, 2], [2, 4], [3, 6]];
      return `<section class="material-page">
        <header class="material-intro"><span class="eyebrow">📘 Misi ${N.esc(config.subjectName)} ${N.esc(config.gradeName)}</span><h1>${N.esc(config.subjectName)} Seru!</h1>
          <p>Pilih tambah, kurang, kali, atau bagi. Kita belajar dengan cerita dan gambar yang mudah diikuti.</p></header>

        <section class="operation-learning" aria-labelledby="operation-title">
          <span class="eyebrow">🧩 Pilih misi matematika</span><h2 id="operation-title">Belajar berhitung sambil bermain</h2>
          <p>Pilih tanda hitung yang ingin kamu pelajari.</p>
          <div class="operation-tabs" role="group" aria-label="Pilih operasi matematika">${operations().map((op, i) => `<button type="button" class="operation-tab ${i === 0 ? 'active' : ''}" data-operation="${op.id}" aria-pressed="${i === 0}">${N.esc(op.icon)} ${N.esc(op.label)}</button>`).join('')}</div>
          <article class="operation-lesson" id="operation-lesson" aria-live="polite"></article>
        </section>

        <div class="material-rule"><span aria-hidden="true">💡</span><p><b>Materi pecahan:</b> angka atas menunjukkan bagian yang kita ambil. Angka bawah menunjukkan jumlah semua bagian.</p></div>

        <form class="story-theme-form material-theme-form" id="material-theme-form">
          <div><label for="material-theme">Pilih gambar yang kamu suka</label><p>Gambar tema ini akan dipakai di contoh dan latihan pecahan.</p></div>
          <div class="story-theme-controls"><select id="material-theme" name="theme">${themes().map(([id, icon, name]) => `<option value="${N.esc(id)}" ${id === activeTheme ? 'selected' : ''}>${N.esc(icon)} ${N.esc(name)}</option>`).join('')}</select><button class="btn" type="submit">Gunakan tema</button></div>
        </form>

        <section class="material-examples"><span class="eyebrow">🍕 Misi Pecahan</span><h2>Pecahan Senilai</h2><p class="material-hint">Pecahan senilai punya nilai yang sama. Lihat bagian yang diarsir pada gambar.</p>
          <div class="material-example-grid" id="material-examples">${examples.map(([n, d]) => `<article class="material-example">${N.themePicture(activeTheme, n, d, 220, false, `${n} dari ${d} bagian`)}<strong>${N.frac(n, d, 'xl')}</strong><p>${n} dari ${d} bagian</p></article>`).join('')}</div>
          <div class="material-equality">${N.frac(1, 2)}<span>=</span>${N.frac(2, 4)}<span>=</span>${N.frac(3, 6)}<b>Nilainya sama!</b></div>
        </section>

        <section class="material-practice">
          <div><span class="eyebrow">🎯 Coba sendiri</span><h2>Buat pecahan yang senilai dengan 1/2</h2><p>Pilih jumlah bagian, lalu sentuh gambar untuk mewarnai bagian. Coba warnai setengahnya!</p></div>
          <div class="math-options" id="dchips" role="group" aria-label="Jumlah bagian">${[2, 4, 6, 8].map((d, i) => `<button type="button" class="math-option ${i === 1 ? 'on' : ''}" data-d="${d}" aria-pressed="${i === 1}">${d} bagian</button>`).join('')}</div>
          <div class="material-interactive"><div id="ipz"></div><div><strong id="ifr"></strong><p id="imsg" aria-live="polite"></p></div></div>
        </section>

        ${mats.length ? `<section class="material-notes"><h2>🧑‍🏫 Catatan dari Guru</h2><div class="material-note-grid">${mats.map((m) => `<article class="material-note"><h3>${N.esc(m.title)}</h3><p>${N.esc(m.body)}</p></article>`).join('')}</div></section>` : ''}
        <section class="material-library"><h2>📂 Perpustakaan File & Video</h2><div id="lib">${N.mediaUI.list(files)}</div></section>
      </section>`;
    },
    mount(root) {
      const files = N.db.get('files', []);
      N.mediaUI.mount(N.$('#lib', root), files);
      let theme = N.$('#material-theme', root).value, d = 4, sel = new Set();
      let operation = operations()[0];
      const drawOperation = () => {
        const icon = themes().find(([id]) => id === theme)?.[1] || '🍎';
        const answer = operation.id === 'tambah' ? operation.a + operation.b : operation.id === 'kurang' ? operation.a - operation.b : operation.id === 'kali' ? operation.a * operation.b : operation.a / operation.b;
        const groups = operation.id === 'kali'
          ? `<div class="operation-groups">${Array.from({ length: operation.a }, () => `<span class="operation-group">${Array.from({ length: operation.b }, () => icon).join(' ')}</span>`).join('')}</div>`
          : operation.id === 'bagi'
            ? `<div class="operation-groups">${Array.from({ length: operation.b }, () => `<span class="operation-group">${Array.from({ length: operation.a / operation.b }, () => icon).join(' ')}</span>`).join('')}</div>`
            : `<div class="operation-groups">${Array.from({ length: operation.a }, () => `<span>${icon}</span>`).join('')}${operation.id === 'tambah' ? '<b>+</b>' : '<b class="taken">−</b>'}${Array.from({ length: operation.b }, () => `<span class="${operation.id === 'kurang' ? 'taken' : ''}">${icon}</span>`).join('')}</div>`;
        N.$('#operation-lesson', root).innerHTML = `<div class="operation-equation"><span>${operation.a}</span><span class="operation-symbol">${N.esc(operation.sign)}</span><span>${operation.b}</span><span>=</span><strong>${answer}</strong></div>${groups}<p class="operation-story">${N.esc(operation.icon)} ${N.esc(operation.story)}</p><p class="operation-tip">Ingat: ${operation.id === 'tambah' ? 'menggabungkan membuat jumlah bertambah.' : operation.id === 'kurang' ? 'mengambil sebagian membuat jumlah berkurang.' : operation.id === 'kali' ? 'perkalian adalah penjumlahan berulang.' : 'pembagian membagi sama banyak.'}</p>`;
      };
      N.$$('.operation-tab', root).forEach((button) => button.addEventListener('click', () => {
        operation = operations().find((op) => op.id === button.dataset.operation) || operations()[0];
        N.$$('.operation-tab', root).forEach((tab) => { const active = tab === button; tab.classList.toggle('active', active); tab.setAttribute('aria-pressed', String(active)); });
        drawOperation(); N.sfx.click();
      }));
      const drawExamples = () => {
        N.$('#material-examples', root).innerHTML = [[1, 2], [2, 4], [3, 6]].map(([n, den]) => `<article class="material-example">${N.themePicture(theme, n, den, 220, false, `${n} dari ${den} bagian`)}<strong>${N.frac(n, den, 'xl')}</strong><p>${n} dari ${den} bagian</p></article>`).join('');
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
