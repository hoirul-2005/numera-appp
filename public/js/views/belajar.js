/* NUMERA – Satu halaman belajar dengan tab cerita dan materi. */
(function () {
  'use strict';
  const N = window.NUMERA;

  function requestedTab() {
    const path = location.hash.replace(/^#\/?/, '').split('?')[0];
    return path === 'materi' ? 'materi' : 'story';
  }

  async function showTab(root, tab) {
    const storyTab = N.$('#learn-story-tab', root), materialTab = N.$('#learn-material-tab', root);
    storyTab.classList.toggle('active', tab === 'story');
    materialTab.classList.toggle('active', tab === 'materi');
    storyTab.setAttribute('aria-selected', String(tab === 'story'));
    materialTab.setAttribute('aria-selected', String(tab === 'materi'));
    const page = N.$('#learn-content', root), view = tab === 'story' ? N.views.story : N.views.materi;
    page.innerHTML = await view.render();
    if (view.mount) view.mount(page);
    root.dataset.activeLearnTab = tab;
  }

  N.views.belajar = {
    async render() {
      const tab = requestedTab();
      const view = tab === 'story' ? N.views.story : N.views.materi;
      return `<section class="learn-hub">
        <header class="learn-hub-intro"><span class="eyebrow">🌈 Ruang Belajar</span><h1>Belajar Matematika</h1><p>Mulai dengan cerita, lalu lanjutkan ke materi. Pilih cara belajar yang kamu suka!</p></header>
        <div class="learn-tabs" role="tablist" aria-label="Pilih cara belajar">
          <button type="button" id="learn-story-tab" class="learn-tab ${tab === 'story' ? 'active' : ''}" role="tab" aria-selected="${tab === 'story'}">📖 Belajar lewat Cerita</button>
          <button type="button" id="learn-material-tab" class="learn-tab ${tab === 'materi' ? 'active' : ''}" role="tab" aria-selected="${tab === 'materi'}">📘 Lihat Materi</button>
        </div>
        <div id="learn-content" class="learn-content" role="tabpanel">${await view.render()}</div>
      </section>`;
    },
    mount(root) {
      N.$('#learn-story-tab', root).addEventListener('click', () => showTab(root, 'story'));
      N.$('#learn-material-tab', root).addEventListener('click', () => showTab(root, 'materi'));
      const view = requestedTab() === 'story' ? N.views.story : N.views.materi;
      if (view.mount) view.mount(N.$('#learn-content', root));
    }
  };
})();
