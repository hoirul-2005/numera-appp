/* NUMERA – Cerita pecahan dengan pilihan tema per pengguna */
(function () {
  'use strict';
  const N = window.NUMERA;
  const themes = () => N.learningConfig().themes;
  const themeInfo = (id) => { const theme = N.learningTheme(id); return { icon: theme.icon, plural: theme.plural || theme.name, title: theme.title || `Berbagi ${theme.name}`, name: theme.name }; };

  function picture(themeName, numerator, denominator, label) {
    return N.themePicture(themeName, numerator, denominator, 170, false, label);
  }

  function fractionVisual(themeName, numerator, denominator, name) {
    const theme = themeInfo(themeName);
    return `<div class="pz story-fraction">${picture(themeName, numerator, denominator, `${numerator} dari ${denominator} ${theme.plural}`)}<b>${name}: ${N.frac(numerator, denominator, 'sm')}</b><span>${numerator} dari ${denominator} ${theme.plural}</span></div>`;
  }

  const operations = () => N.learningConfig().operations;

  function storySteps(themeName, operation = 'bagi') {
    const theme = themeInfo(themeName);
    const math = operations().find((op) => op.id === operation) || operations().find((op) => op.id === 'bagi');
    const answer = math.id === 'tambah' ? math.a + math.b : math.id === 'kurang' ? math.a - math.b : math.id === 'kali' ? math.a * math.b : math.a / math.b;
    return [
      { text: math.story, vis: () => `<div class="story-math-scene"><span>${N.esc(theme.icon)}</span><b>${math.id === 'kali' ? `${math.a} kelompok × ${math.b} benda` : math.id === 'bagi' ? `${math.a} benda dibagi ${math.b} anak` : `${math.a} ${N.esc(math.sign)} ${math.b}`}</b><span>${N.esc(theme.icon)}</span></div>` },
      { text: `Kita hitung bersama: ${math.a} ${math.sign} ${math.b}.`, vis: () => `<div class="story-math-equation">${math.a} <span>${N.esc(math.sign)}</span> ${math.b} <span>= ?</span></div>` },
      { text: 'Pilih jawaban yang benar, ya!', vis: () => `<div class="story-math-equation">${math.a} ${N.esc(math.sign)} ${math.b} = ?</div>`, quiz: true, choices: [answer, answer + 1, Math.max(0, answer - 1)].sort(() => Math.random() - .5), answer: String(answer) }
    ];
  }

  N.views.story = {
    render() {
      const user = N.auth.current();
      const userId = user ? String(user.id || user.username || user.role).replace(/[^\w-]/g, '_') : 'guest';
      const saved = N.db.get(`storyTheme_${userId}`, 'Pizza');
      const activeTheme = themes().some((theme) => theme.id === saved) ? saved : themes()[0].id;
      const config = N.learningConfig();
      return `<section class="story-page">
        <h1 id="story-title">📖 Ayo, ${themeInfo(activeTheme).title}!</h1>
        <form class="story-theme-form" id="story-theme-form">
          <div><label for="story-theme">Pilih tema cerita</label><p>${N.esc(config.gradeName)} · Pilihan tersimpan di akun atau perangkat ini.</p></div>
          <div class="story-theme-controls"><select id="story-theme" name="theme">${themes().map((theme) => `<option value="${N.esc(theme.id)}" ${theme.id === activeTheme ? 'selected' : ''}>${N.esc(theme.icon)} ${N.esc(theme.name)}</option>`).join('')}</select><button class="btn" type="submit">Gunakan tema</button></div>
        </form>
        <section class="story-addition-builder" aria-labelledby="addition-title">
          <span class="eyebrow">➕ Coba buat sendiri</span><h2 id="addition-title">Kalau ditambah, jadi berapa?</h2>
          <p>Atur dua angka. Cerita dan hasilnya akan muncul langsung!</p>
          <div class="story-addition-fields">
            <label>Aku punya <input id="story-add-a" type="number" min="0" max="50" value="3" inputmode="numeric"></label>
            <span class="story-addition-plus" aria-hidden="true">+</span>
            <label>Lalu mendapat <input id="story-add-b" type="number" min="0" max="50" value="2" inputmode="numeric"></label>
          </div>
          <div class="story-addition-result" id="story-addition-result" aria-live="polite"></div>
        </section>
        <div class="story-operation-picker"><b>Pilih petualangan hitung:</b><div class="operation-tabs" role="group" aria-label="Pilih petualangan berhitung">${operations().map((op) => `<button type="button" class="operation-tab ${op.id === 'bagi' ? 'active' : ''}" data-story-operation="${op.id}" aria-pressed="${op.id === 'bagi'}">${N.esc(op.icon)} ${N.esc(op.label)}</button>`).join('')}</div></div>
        <div class="stage" id="stage"></div><div class="dots" id="dots"></div>
        <div class="row center story-navigation"><button class="btn" id="prev" type="button">⬅️ Sebelumnya</button><button class="btn" id="next" type="button">Lanjut ➡️</button></div>
      </section>`;
    },
    mount(root) {
      const user = N.auth.current();
      const userId = user ? String(user.id || user.username || user.role).replace(/[^\w-]/g, '_') : 'guest';
      const storageKey = `storyTheme_${userId}`;
      const form = N.$('#story-theme-form', root);
      const selector = N.$('#story-theme', root);
      const title = N.$('#story-title', root);
      const stage = N.$('#stage', root), dots = N.$('#dots', root);
      const prev = N.$('#prev', root), next = N.$('#next', root);
      let themeName = selector.value, operation = 'bagi', steps = storySteps(themeName, operation), i = 0, solved = false;
      const addA = N.$('#story-add-a', root), addB = N.$('#story-add-b', root);
      const addResult = N.$('#story-addition-result', root);
      function drawAddition() {
        const a = Math.max(0, Math.min(50, Number(addA.value) || 0));
        const b = Math.max(0, Math.min(50, Number(addB.value) || 0));
        addA.value = a; addB.value = b;
        const info = themeInfo(themeName), icon = info.icon;
        addResult.innerHTML = `<div class="story-addition-equation"><span>${a}</span><b>+</b><span>${b}</span><b>=</b><strong>${a + b}</strong></div><p>Aku punya ${a} ${N.esc(info.plural)}. Lalu mendapat ${b} lagi. Sekarang aku punya <strong>${a + b} ${N.esc(info.plural)}!</strong></p><div class="story-addition-pictures" aria-label="${a + b} ${N.esc(info.plural)}">${N.esc(icon).repeat(Math.min(a + b, 30))}${a + b > 30 ? ` <small>dan ${a + b - 30} lagi</small>` : ''}</div>`;
      }
      [addA, addB].forEach((input) => input.addEventListener('input', drawAddition));

      function conclusion() {
        const op = operations().find((item) => item.id === operation);
        const result = op.id === 'tambah' ? op.a + op.b : op.id === 'kurang' ? op.a - op.b : op.id === 'kali' ? op.a * op.b : op.a / op.b;
        const m = N.modal(`<div class="center"><h2>🎉 Hebat, kamu berhasil!</h2><div class="story-math-equation">${op.a} ${N.esc(op.sign)} ${op.b} = ${result}</div><p>Kamu sudah menyelesaikan petualangan ${N.esc(op.label.toLowerCase())}!</p><div class="row" style="justify-content:center"><a class="btn" href="#/materi" data-close>Pelajari Materi 📘</a><button class="btn" type="button" data-close>Tutup</button></div></div>`);
        N.$$('[data-close]', m.el).forEach((button) => button.addEventListener('click', m.close));
        N.sfx.win(); N.confetti();
      }

      function draw() {
        const current = steps[i];
        stage.innerHTML = `<div class="center">${current.vis()}</div><div class="speech">${current.text}</div>` +
          (current.quiz ? `<div class="row story-choices">${(current.choices || ['Rani', 'Budi', 'Sama banyak']).map((choice) => `<button type="button" class="btn choice" data-c="${choice}">${choice}</button>`).join('')}</div><p class="center" id="hint" aria-live="polite"></p>` : '');
        dots.innerHTML = steps.map((_, index) => `<i class="${index <= i ? 'on' : ''}"></i>`).join('');
        prev.disabled = i === 0;
        next.disabled = i === steps.length - 1 && !solved;
        next.textContent = i === steps.length - 1 ? 'Selesai ✅' : 'Lanjut ➡️';
        N.$$('.choice', stage).forEach((button) => button.addEventListener('click', () => {
          if (button.dataset.c === (current.answer || 'Sama banyak')) {
            button.classList.add('right'); solved = true; next.disabled = false; conclusion();
          } else {
            button.classList.add('wrong'); N.sfx.bad();
            N.$('#hint', stage).textContent = operation === 'bagi' ? 'Coba bandingkan lagi gambar Rani dan Budi. 🤔' : 'Coba hitung lagi dengan pelan-pelan. 🤔';
          }
        }));
      }

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (selector.value === themeName) {
          N.db.set(storageKey, themeName);
          N.toast(`Tema ${themeName} tersimpan untuk akunmu!`);
          return;
        }
        themeName = selector.value;
        N.db.set(storageKey, themeName);
        steps = storySteps(themeName, operation); i = 0; solved = false;
        title.textContent = `📖 Ayo, ${themeInfo(themeName).title}!`;
        draw(); drawAddition();
        N.toast(`Tema ${themeName} siap digunakan!`);
      });
      N.$$('[data-story-operation]', root).forEach((button) => button.addEventListener('click', () => {
        operation = button.dataset.storyOperation; steps = storySteps(themeName, operation); i = 0; solved = false;
        N.$$('[data-story-operation]', root).forEach((tab) => { const active = tab === button; tab.classList.toggle('active', active); tab.setAttribute('aria-pressed', String(active)); });
        draw(); N.sfx.click();
      }));
      drawAddition();
      prev.addEventListener('click', () => { if (i > 0) { i--; N.sfx.click(); draw(); } });
      next.addEventListener('click', () => {
        N.sfx.click();
        if (i < steps.length - 1) { i++; draw(); } else location.hash = '#/materi';
      });
      draw();
    }
  };
})();
