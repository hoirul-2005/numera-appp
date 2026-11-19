/* NUMERA – Materi pecahan senilai dengan visual tema pilihan */
(function () {
  'use strict';
  const N = window.NUMERA;
  const themes = () => N.learningConfig().themes.map((theme) => [theme.id, theme.icon, theme.name]);

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
          <p>Amati gambar pecahan, pahami bagian yang diarsir, lalu coba sendiri dengan tema pilihanmu.</p></header>

        <section class="material-definition" aria-labelledby="fraction-definition-title"><span aria-hidden="true">📚</span><div><span class="eyebrow">Konsep penting</span><h2 id="fraction-definition-title">Apa itu Pecahan Senilai?</h2><p>Pecahan senilai adalah pecahan-pecahan yang memiliki nilai atau besar bagian yang sama, meskipun ditulis dengan pembilang dan penyebut yang berbeda.</p></div></section>

        <div class="material-rule"><span aria-hidden="true">💡</span><p><b>Ingat cara membaca pecahan:</b> angka atas menunjukkan bagian yang diwarnai. Angka bawah menunjukkan jumlah semua potongan. Contoh <b>2/4</b>: 2 potongan diwarnai dari 4 potongan.</p></div>

        <form class="story-theme-form material-theme-form" id="material-theme-form">
          <div><span class="eyebrow">🎨 Pilih gambar</span><label for="material-theme">Pilih tema yang kamu suka</label><p>Tema pilihanmu dipakai pada kegiatan latihan.</p></div>
          <div class="story-theme-controls"><select id="material-theme" name="theme">${themes().map(([id, icon, name]) => `<option value="${N.esc(id)}" ${id === activeTheme ? 'selected' : ''}>${N.esc(icon)} ${N.esc(name)}</option>`).join('')}</select><button class="btn" type="submit">Gunakan tema</button></div>
        </form>

        <section class="material-examples"><span class="eyebrow">🍕 Amati gambar</span><h2>Contoh Pecahan Senilai</h2><p class="material-hint">Ketiga gambar berukuran sama. Tekan gambar untuk melihat berapa bagian yang diarsir.</p>
          <div class="material-example-grid" id="material-examples">${examples.map(([n, d], index) => `<article class="material-example ${index === 0 ? 'selected' : ''}"><button type="button" class="material-example-select" data-example="${index}" aria-pressed="${index === 0}">${N.pizza(n, d, 210)}<strong>${N.frac(n, d, 'xl')}</strong></button><p><b>${n} bagian diarsir</b><br>dari ${d} bagian seluruhnya</p></article>`).join('')}</div>
          <p class="material-example-explanation" id="material-example-explanation" aria-live="polite">Lingkaran dibagi menjadi 2 bagian sama besar. 1 bagian diarsir, jadi pecahannya 1/2.</p>
          <div class="material-alignment-guide" aria-hidden="true"><i></i><i></i><i></i></div>
          <div class="material-equality">${N.frac(1, 2)}<span>=</span>${N.frac(2, 4)}<span>=</span>${N.frac(3, 6)}<b>Luas yang diarsir sama besar!</b></div>
          <aside class="material-important"><b>💡 Pesan Penting</b><p>Ingat! Pecahan senilai memiliki nilai yang sama meskipun angka pembilang dan penyebutnya berbeda.</p></aside>
        </section>

        <section class="material-practice">
          <div><span class="eyebrow">🎯 Coba sendiri</span><h2>Warnai setengah gambar</h2><p>Pilih jumlah potongan. Lalu sentuh potongan satu per satu sampai setengahnya berwarna.</p></div>
          <div class="math-options" id="dchips" role="group" aria-label="Jumlah bagian">${[2, 4, 6, 8].map((d, i) => `<button type="button" class="math-option ${i === 1 ? 'on' : ''}" data-d="${d}" aria-pressed="${i === 1}">${d} bagian</button>`).join('')}</div>
          <div class="material-interactive"><div id="ipz"></div><div><strong id="ifr"></strong><p id="imsg" aria-live="polite"></p></div></div>
        </section>

        ${mats.length ? `<section class="material-notes"><h2>🧑‍🏫 Catatan dari Guru</h2><div class="material-note-grid">${mats.map((m) => `<article class="material-note"><h3>${N.esc(m.title)}</h3><p>${N.esc(m.body)}</p></article>`).join('')}</div></section>` : ''}
      </section>`;
    },
    mount(root) {
      let theme = N.$('#material-theme', root).value, d = 4, sel = new Set();
      let selectedExample = 0;
      const drawExamples = () => {
        const parts = [[1, 2], [2, 4], [3, 6]];
        N.$('#material-examples', root).innerHTML = parts.map(([n, den], index) => `<article class="material-example ${selectedExample === index ? 'selected' : ''}"><button type="button" class="material-example-select" data-example="${index}" aria-pressed="${selectedExample === index}">${N.pizza(n, den, 210)}<strong>${N.frac(n, den, 'xl')}</strong></button><p><b>${n} bagian diarsir</b><br>dari ${den} bagian seluruhnya</p></article>`).join('');
        const [numerator, denominator] = parts[selectedExample];
        N.$('#material-example-explanation', root).textContent = `Lingkaran dibagi menjadi ${denominator} bagian sama besar. ${numerator} bagian diarsir, jadi pecahannya ${numerator}/${denominator}.`;
        N.$$('.material-example-select', root).forEach((button) => button.addEventListener('click', () => {
          selectedExample = Number(button.dataset.example); N.sfx.click(); drawExamples();
        }));
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
        sel = new Set(); drawExamples(); drawInteractive();
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
      drawExamples(); drawInteractive();
    }
  };
})();
