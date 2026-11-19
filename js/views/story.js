/* NUMERA – Cerita pecahan dengan pilihan tema per pengguna */
(function () {
  'use strict';
  const N = window.NUMERA;
  const themes = () => N.learningConfig().themes;
  const themeInfo = (id) => { const theme = N.learningTheme(id); return { icon: theme.icon, plural: theme.plural || theme.name, title: theme.title || `Berbagi ${theme.name}`, name: theme.name }; };

  function itemPicture(theme, count, label) {
    const shown = Math.min(count, 15);
    return `<div class="story-large-illustration" role="img" aria-label="${N.esc(label)}"><div class="story-large-items">${Array.from({ length: shown }, () => `<span aria-hidden="true">${N.esc(theme.icon)}</span>`).join('')}${count > shown ? `<b>+${count - shown}</b>` : ''}</div><strong>${N.esc(label)}</strong></div>`;
  }

  function sharePicture(theme, childCount, eachCount) {
    const groups = Math.min(childCount, 6);
    return `<div class="story-share-illustration" role="img" aria-label="${childCount} anak mendapat ${eachCount} ${N.esc(theme.plural)} masing-masing">${Array.from({ length: groups }, () => `<div class="story-share-group"><span class="story-child" aria-hidden="true">🧒</span><div class="story-share-items">${Array.from({ length: Math.min(eachCount, 5) }, () => `<span aria-hidden="true">${N.esc(theme.icon)}</span>`).join('')}${eachCount > 5 ? `<b>+${eachCount - 5}</b>` : ''}</div><strong>${eachCount} untuk 1 anak</strong></div>`).join('')}${childCount > groups ? `<p class="story-more-groups">dan ${childCount - groups} anak lainnya mendapat bagian yang sama</p>` : ''}</div>`;
  }

  const operations = () => N.learningConfig().operations;
  const storyLine = (template, values) => String(template || '').replace(/\{(count|item|children|answer)\}/g, (_, key) => String(values[key] ?? ''));
  const storyDisplayTitle = (story, theme) => storyLine(story.title, { item: themeInfo(theme).name });

  function storySteps(themeName, operation = 'bagi', content = N.storyContent()) {
    const theme = themeInfo(themeName);
    const math = operations().find((op) => op.id === operation) || operations().find((op) => op.id === 'bagi');
    const answer = math.id === 'tambah' ? math.a + math.b : math.id === 'kurang' ? math.a - math.b : math.id === 'kali' ? math.a * math.b : math.a / math.b;
    const values = { count: math.a, item: theme.plural, children: math.b, answer };
    return [
      { label: content.step1Label, text: storyLine(content.step1Text, values), vis: () => itemPicture(theme, math.a, `${math.a} ${theme.plural}`) },
      { label: content.step2Label, text: storyLine(content.step2Text, values), vis: () => `<div class="story-sharing-step"><div class="story-sharing-equation">${math.a} <span>÷</span> ${math.b} <span>=</span> <b>${answer}</b></div>${sharePicture(theme, math.b, answer)}</div>` },
      { label: content.step3Label, text: storyLine(content.step3Text, values), vis: () => `<div class="story-final-picture">${sharePicture(theme, math.b, answer)}<div class="story-final-question">${math.a} ${N.esc(math.sign)} ${math.b} = ?</div></div>`, quiz: true, choices: [answer, answer + 1, Math.max(0, answer - 1)].sort(() => Math.random() - .5), answer: String(answer) }
    ];
  }

  N.views.story = {
    render() {
      const user = N.auth.current();
      const userId = user ? String(user.id || user.username || user.role).replace(/[^\w-]/g, '_') : 'guest';
      const saved = N.db.get(`storyTheme_${userId}`, 'Pizza');
      const activeTheme = themes().some((theme) => theme.id === saved) ? saved : themes()[0].id;
      const stories = N.storyLibrary();
      const selectedStoryId = N.db.get(`storyChoice_${userId}`, stories[0].id);
      const activeStory = stories.find((story) => N.sameId(story.id, selectedStoryId)) || stories[0];
      const config = N.learningConfig();
      return `<section class="story-page">
        <h1 id="story-title">📖 ${N.esc(storyDisplayTitle(activeStory, activeTheme))}</h1>
        <form class="story-theme-form" id="story-theme-form">
          <div><label for="story-choice">Pilih cerita dan tema</label><p>${N.esc(config.gradeName)} · Pilihan tersimpan di akun atau perangkat ini.</p></div>
          <div class="story-theme-controls"><select id="story-choice" name="storyChoice" aria-label="Pilih cerita">${stories.map((story) => `<option value="${N.esc(story.id)}" ${N.sameId(story.id, activeStory.id) ? 'selected' : ''}>📖 ${N.esc(storyDisplayTitle(story, activeTheme))}</option>`).join('')}</select><select id="story-theme" name="theme" aria-label="Pilih tema gambar">${themes().map((theme) => `<option value="${N.esc(theme.id)}" ${theme.id === activeTheme ? 'selected' : ''}>${N.esc(theme.icon)} ${N.esc(theme.name)}</option>`).join('')}</select><button class="btn" type="submit">Mulai cerita</button></div>
        </form>
        <section class="story-fraction-lesson" id="fraction-story" aria-label="Cerita pecahan senilai dengan pizza">
          <div class="story-dialogue"><span>📖 Cerita Rani dan Budi</span><p>Suatu hari, Rani dan Budi memiliki dua pizza yang ukurannya sama. Pizza pertama dipotong menjadi 2 bagian sama besar, dan Rani mengambil 1 bagian. Pizza kedua dipotong menjadi 4 bagian sama besar, dan Budi mengambil 2 bagian. Menurut kalian, apakah bagian pizza yang diambil Rani dan Budi sama banyak?</p></div>
          <div class="story-pizza-pair">
            <article class="story-pizza-card"><h2>🍕 Pizza Rani</h2><p>Pizza pertama · 1 dari 2 bagian</p><div class="story-pizza-visual" id="pizza-rani-visual"></div><div class="story-pizza-actions"><button class="btn btn-b" type="button" id="cut-rani">✂️ Potong jadi 2 bagian</button><button class="btn" type="button" id="take-rani" disabled>🍕 Ambil 1 bagian</button></div><strong class="story-fraction-label" id="label-rani">Belum dipotong</strong></article>
            <article class="story-pizza-card"><h2>🍕 Pizza Budi</h2><p>Pizza kedua · 2 dari 4 bagian</p><div class="story-pizza-visual" id="pizza-budi-visual"></div><div class="story-pizza-actions"><button class="btn btn-b" type="button" id="cut-budi">✂️ Potong jadi 4 bagian</button><button class="btn" type="button" id="take-budi" disabled>🍕 Ambil 2 bagian</button></div><strong class="story-fraction-label" id="label-budi">Belum dipotong</strong></article>
          </div>
          <div class="story-compare-area"><button class="btn btn-g" type="button" id="compare-pizzas" disabled>⚖️ Bandingkan Ukuran</button><div id="pizza-comparison" aria-live="polite"></div></div>
          <section class="story-discussion"><div><span class="eyebrow">💬 Diskusi Kelas</span><h2>Pertanyaan Pemantik</h2><p>Guru, tekan tombol untuk menampilkan pertanyaan satu per satu.</p></div><ol id="story-questions"></ol><button class="btn btn-b" type="button" id="next-story-question">Tampilkan Pertanyaan 1</button><button class="btn btn-g hidden" type="button" id="show-story-answer">Tampilkan Kesimpulan / Jawaban</button><div class="story-answer hidden" id="story-answer" aria-live="polite"><b>✅ Kesimpulan</b><p>1/2 dan 2/4 memiliki nilai yang sama karena menunjukkan bagian yang sama besar dari keseluruhan pizza yang ukurannya sama.</p></div></section>
        </section>
        <div class="story-walkthrough" id="general-story"><div class="stage" id="stage"></div><div class="dots" id="dots"></div>
        <div class="row center story-navigation"><button class="btn" id="prev" type="button">⬅️ Sebelumnya</button><button class="btn" id="next" type="button">Lanjut ➡️</button></div>
        </div>
      </section>`;
    },
    mount(root) {
      const user = N.auth.current();
      const userId = user ? String(user.id || user.username || user.role).replace(/[^\w-]/g, '_') : 'guest';
      const storageKey = `storyTheme_${userId}`;
      const storyStorageKey = `storyChoice_${userId}`;
      const form = N.$('#story-theme-form', root);
      const selector = N.$('#story-theme', root);
      const storySelector = N.$('#story-choice', root);
      const title = N.$('#story-title', root);
      const stage = N.$('#stage', root), dots = N.$('#dots', root);
      const prev = N.$('#prev', root), next = N.$('#next', root);
      const fractionStory = N.$('#fraction-story', root), generalStory = N.$('#general-story', root);
      let themeName = selector.value, operation = 'bagi';
      let selectedStory = N.storyLibrary().find((story) => N.sameId(story.id, storySelector.value)) || N.storyLibrary()[0];
      let steps = storySteps(themeName, operation, selectedStory), i = 0, solved = false;
      let raniCut = false, budiCut = false, raniTaken = false, budiTaken = false, compared = false, revealedQuestions = 0, answerShown = false;

      function syncStoryMode() {
        const storyTitle = storyDisplayTitle(selectedStory, themeName).toLowerCase();
        const pizzaLesson = themeInfo(themeName).name.toLowerCase() === 'pizza' && storyTitle.includes('pizza');
        fractionStory.classList.toggle('hidden', !pizzaLesson);
        generalStory.classList.toggle('hidden', pizzaLesson);
      }

      function drawFractionStory() {
        const raniVisual = N.$('#pizza-rani-visual', fractionStory);
        const budiVisual = N.$('#pizza-budi-visual', fractionStory);
        const wholePizza = (label) => `<svg class="pizza" viewBox="0 0 190 190" width="190" height="190" role="img" aria-label="${N.esc(label)}"><circle cx="95" cy="95" r="88" fill="#e8a44a"/><circle cx="95" cy="95" r="81" fill="#ffe8a3" stroke="#fff8e5" stroke-width="3"/></svg>`;
        raniVisual.innerHTML = raniCut ? N.pizza(raniTaken ? 1 : 0, 2, 190) : wholePizza('Pizza Rani masih utuh');
        budiVisual.innerHTML = budiCut ? N.pizza(budiTaken ? 2 : 0, 4, 190) : wholePizza('Pizza Budi masih utuh');
        N.$('#cut-rani', fractionStory).disabled = raniCut;
        N.$('#cut-rani', fractionStory).textContent = raniCut ? '✅ Sudah dipotong' : '✂️ Potong jadi 2 bagian';
        N.$('#cut-budi', fractionStory).disabled = budiCut;
        N.$('#cut-budi', fractionStory).textContent = budiCut ? '✅ Sudah dipotong' : '✂️ Potong jadi 4 bagian';
        N.$('#take-rani', fractionStory).disabled = !raniCut || raniTaken;
        N.$('#take-budi', fractionStory).disabled = !budiCut || budiTaken;
        N.$('#label-rani', fractionStory).textContent = raniTaken ? 'Bagian Rani: 1/2' : 'Belum mengambil bagian';
        N.$('#label-budi', fractionStory).textContent = budiTaken ? 'Bagian Budi: 2/4' : 'Belum mengambil bagian';
        const compareButton = N.$('#compare-pizzas', fractionStory);
        compareButton.disabled = !(raniTaken && budiTaken);
        N.$('#pizza-comparison', fractionStory).innerHTML = compared ? `<div class="story-comparison"><div><span>Bagian Rani</span>${N.pizza(1, 2, 142)}<b>1/2</b></div><strong class="story-comparison-equal">=</strong><div><span>Bagian Budi</span>${N.pizza(2, 4, 142)}<b>2/4</b></div><p>Lihat luas arsiran: keduanya sama besar!</p></div>` : '';
        const questions = [
          'Rani mengambil berapa bagian dari seluruh pizza?',
          'Budi mengambil berapa bagian dari seluruh pizza?',
          'Apakah 1/2 dan 2/4 menunjukkan bagian yang sama besar?'
        ];
        N.$('#story-questions', fractionStory).innerHTML = questions.slice(0, revealedQuestions).map((question) => `<li>${N.esc(question)}</li>`).join('');
        const nextQuestion = N.$('#next-story-question', fractionStory);
        nextQuestion.classList.toggle('hidden', revealedQuestions >= questions.length);
        nextQuestion.textContent = `Tampilkan Pertanyaan ${revealedQuestions + 1}`;
        N.$('#show-story-answer', fractionStory).classList.toggle('hidden', revealedQuestions < questions.length);
        N.$('#story-answer', fractionStory).classList.toggle('hidden', !answerShown);

        N.$('#cut-rani', fractionStory).onclick = () => { raniCut = true; N.sfx.click(); drawFractionStory(); };
        N.$('#cut-budi', fractionStory).onclick = () => { budiCut = true; N.sfx.click(); drawFractionStory(); };
        N.$('#take-rani', fractionStory).onclick = () => { raniTaken = true; N.sfx.click(); drawFractionStory(); };
        N.$('#take-budi', fractionStory).onclick = () => { budiTaken = true; N.sfx.click(); drawFractionStory(); };
        compareButton.onclick = () => { compared = true; N.sfx.ok(); drawFractionStory(); };
        nextQuestion.onclick = () => { revealedQuestions = Math.min(3, revealedQuestions + 1); N.sfx.click(); drawFractionStory(); };
        N.$('#show-story-answer', fractionStory).onclick = () => { answerShown = true; N.sfx.win(); N.confetti(80); drawFractionStory(); };
      }

      function conclusion() {
        const op = operations().find((item) => item.id === operation);
        const result = op.id === 'tambah' ? op.a + op.b : op.id === 'kurang' ? op.a - op.b : op.id === 'kali' ? op.a * op.b : op.a / op.b;
        const content = selectedStory, theme = themeInfo(themeName);
        const values = { count: op.a, item: theme.plural, children: op.b, answer: result };
        const message = storyLine(content.successText, values), encouragement = storyLine(content.successEncouragement, values);
        const m = N.modal(`<div class="story-success"><div class="story-success-badge" aria-hidden="true">🎉</div><span class="eyebrow">✅ Jawabanmu benar!</span><h2>${N.esc(content.successTitle)}</h2><div class="story-math-equation">${op.a} ${N.esc(op.sign)} ${op.b} = ${result}</div><p class="story-success-message">${N.esc(message)}</p><p class="story-success-encouragement">${N.esc(encouragement)}</p><div class="story-success-actions"><a class="btn" href="#/materi" data-close>Pelajari Materi 📘</a><button class="btn btn-white" type="button" data-close>Coba Lagi Nanti</button></div></div>`);
        N.$$('[data-close]', m.el).forEach((button) => button.addEventListener('click', m.close));
        N.sfx.win(); N.confetti();
      }

      function draw() {
        const current = steps[i];
        stage.innerHTML = `<div class="story-step-label"><span>Langkah ${i + 1} dari ${steps.length}</span><strong>${N.esc(current.label)}</strong></div><div class="center">${current.vis()}</div><div class="speech">${N.esc(current.text)}</div>` +
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
        themeName = selector.value;
        selectedStory = N.storyLibrary().find((story) => N.sameId(story.id, storySelector.value)) || N.storyLibrary()[0];
        N.db.set(storageKey, themeName);
        N.db.set(storyStorageKey, selectedStory.id);
        raniCut = false; budiCut = false; raniTaken = false; budiTaken = false; compared = false; revealedQuestions = 0; answerShown = false;
        steps = storySteps(themeName, operation, selectedStory); i = 0; solved = false;
        title.textContent = `📖 ${storyDisplayTitle(selectedStory, themeName)}`;
        syncStoryMode(); drawFractionStory();
        draw();
        N.toast('Cerita dan tema siap digunakan!');
      });
      prev.addEventListener('click', () => { if (i > 0) { i--; N.sfx.click(); draw(); } });
      next.addEventListener('click', () => {
        N.sfx.click();
        if (i < steps.length - 1) { i++; draw(); } else location.hash = '#/materi';
      });
      syncStoryMode(); drawFractionStory(); draw();
    }
  };
})();
