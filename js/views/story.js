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
        <h1 id="story-title">📖 ${N.esc(storyLine(activeStory.title, { item: themeInfo(activeTheme).plural }))}</h1>
        <form class="story-theme-form" id="story-theme-form">
          <div><label for="story-choice">Pilih cerita dan tema</label><p>${N.esc(config.gradeName)} · Pilihan tersimpan di akun atau perangkat ini.</p></div>
          <div class="story-theme-controls"><select id="story-choice" name="storyChoice" aria-label="Pilih cerita">${stories.map((story) => `<option value="${N.esc(story.id)}" ${N.sameId(story.id, activeStory.id) ? 'selected' : ''}>📖 ${N.esc(story.title)}</option>`).join('')}</select><select id="story-theme" name="theme" aria-label="Pilih tema gambar">${themes().map((theme) => `<option value="${N.esc(theme.id)}" ${theme.id === activeTheme ? 'selected' : ''}>${N.esc(theme.icon)} ${N.esc(theme.name)}</option>`).join('')}</select><button class="btn" type="submit">Mulai cerita</button></div>
        </form>
        <div class="story-walkthrough"><div class="stage" id="stage"></div><div class="dots" id="dots"></div>
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
      let themeName = selector.value, operation = 'bagi';
      let selectedStory = N.storyLibrary().find((story) => N.sameId(story.id, storySelector.value)) || N.storyLibrary()[0];
      let steps = storySteps(themeName, operation, selectedStory), i = 0, solved = false;

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
        steps = storySteps(themeName, operation, selectedStory); i = 0; solved = false;
        title.textContent = `📖 ${storyLine(selectedStory.title, { item: themeInfo(themeName).plural })}`;
        draw();
        N.toast('Cerita dan tema siap digunakan!');
      });
      prev.addEventListener('click', () => { if (i > 0) { i--; N.sfx.click(); draw(); } });
      next.addEventListener('click', () => {
        N.sfx.click();
        if (i < steps.length - 1) { i++; draw(); } else location.hash = '#/materi';
      });
      draw();
    }
  };
})();
