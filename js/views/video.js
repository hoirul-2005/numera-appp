/* NUMERA – Video Pembelajaran (mode proyektor) */
(function () {
  'use strict';
  const N = window.NUMERA;
  N.views.video = {
    render() {
      const vids = N.db.get('files', []).filter((f) => N.mediaUI.kindOf(f) === 'video');
      return `<h2>🎬 Video Pembelajaran</h2>
      <div class="info">📽️ <b>Mode Proyektor:</b> buka video lalu tekan <b>"Putar di Proyektor"</b>. Kontrol besar (putar, jeda, volume, geser) akan tampil jelas di layar penuh. Pintasan: <b>Spasi</b> putar/jeda, <b>← →</b> mundur/maju 10 detik.</div>
      ${N.mediaUI.list(vids, 'video')}`;
    },
    mount(root) {
      N.mediaUI.mount(root, N.db.get('files', []));
    }
  };
})();
