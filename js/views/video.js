/* NUMERA – Video Pembelajaran (mode proyektor) */
(function () {
  'use strict';
  const N = window.NUMERA;
  N.views.video = {
    render() {
      const vids = N.db.get('files', []).filter((f) => N.mediaUI.kindOf(f) === 'video');
      const config = N.learningConfig();
      return `<section class="video-classroom">
        <header class="video-welcome"><div><span class="eyebrow">🍿 Bioskop Belajar · ${N.esc(config.gradeName)}</span><h1>Yuk, nonton sambil belajar!</h1><p>Pilih video, duduk nyaman, dan temukan hal baru tentang ${N.esc(config.subjectName)}.</p></div><div class="video-mascot" aria-hidden="true">🎬</div></header>
        <section class="video-howto" aria-label="Cara menonton video"><article><span>1</span><div><b>Pilih video</b><p>Temukan video yang ingin kamu tonton.</p></div></article><article><span>2</span><div><b>Tekan putar</b><p>Tonton dan dengarkan penjelasannya.</p></div></article><article><span>3</span><div><b>Ceritakan lagi</b><p>Bagikan hal baru yang kamu pelajari.</p></div></article></section>
        <section class="video-shelf"><div class="video-shelf-title"><div><span class="eyebrow">✨ Pilihan untukmu</span><h2>Video Pembelajaran</h2></div><span class="video-count">${vids.length} video</span></div>
          ${vids.length ? N.mediaUI.list(vids, 'video') : `<div class="video-empty"><span aria-hidden="true">📽️</span><h3>Belum ada video</h3><p>Video baru akan muncul di sini setelah admin menambahkannya.</p><a class="btn" href="#/belajar">📚 Sambil menunggu, ayo belajar</a></div>`}
        </section>
        <aside class="video-projection"><span aria-hidden="true">🌟</span><div><b>Nonton di layar besar?</b><p>Buka videonya, lalu tekan tombol <b>Putar di Proyektor</b> agar lebih nyaman dilihat bersama teman sekelas.</p></div></aside>
      </section>`;
    },
    mount(root) {
      N.mediaUI.mount(root, N.db.get('files', []));
    }
  };
})();
