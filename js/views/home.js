/* NUMERA – Beranda */
(function () {
  'use strict';
  const N = window.NUMERA;
  N.views.home = {
    render() {
      const config = N.learningConfig();
      const theme = config.themes[0];
      const features = [
        ['#/cerita', theme.icon, `Cerita ${theme.name}`, `Rani dan Budi berbagi ${theme.plural || theme.name.toLowerCase()}`, 'k1'],
        ['#/materi', '📘', `Materi ${config.subjectName}`, 'Lihat contoh dan belajar langkah demi langkah', 'k2'],
        ['#/video', '🎬', 'Video Pembelajaran', 'Tonton bersama satu kelas', 'k3'],
        ['#/hitung', '🧮', 'Cara Menghitung', 'Pahami langkah berhitung dengan contoh', 'k4']
      ];
      return `<section class="hero">
        <div class="cloud c1" aria-hidden="true"></div><div class="cloud c2" aria-hidden="true"></div><div class="cloud c3" aria-hidden="true"></div>
        <div class="sun" aria-hidden="true"><div class="rays"></div><div class="disc"></div></div>
        <div class="rainbow" aria-hidden="true"></div>
        <div class="confetti" aria-hidden="true">
          <i class="bit star" style="--c:#ffd23f;--d:-1s;left:8%;top:18%"></i><i class="bit dot" style="--c:#ff8d7f;--d:-.4s;left:44%;top:12%"></i>
          <i class="bit dot" style="--c:#7a47f5;--d:-2s;left:54%;top:68%"></i><i class="bit tri" style="--c:#3ddc97;--d:-1.5s;left:82%;top:40%"></i>
        </div>
        <div class="kawaii" aria-hidden="true"></div>
        <div class="wrap">
          <div class="hero-copy">
            <span class="eyebrow">✨ ${N.esc(config.mediaLabel)} ${N.esc(config.subjectName)} ${N.esc(config.gradeName)}</span>
            <h1>Belajar ${N.esc(config.subjectName)} <span class="pop">Jadi Seru!</span></h1>
            <p class="lead">${N.esc(config.homeSlogan)}</p>
            <div class="hero-actions"><a class="btn" href="#/cerita">🚀 Mulai Belajar</a><a class="btn white" href="#dunia">Jelajahi Materi</a></div>
          </div>
          <div class="stage" aria-label="Kubus warna-warni dengan planet yang mengorbit">
            <div class="world"><div class="cube"><div class="face f1">½</div><div class="face f2">¼</div><div class="face f3">⅓</div><div class="face f4">¾</div><div class="face f5">⅔</div><div class="face f6">⅛</div></div>
              <div class="ring"><div class="orbit"><i class="orb o1"></i><i class="orb o2"></i><i class="orb o3"></i></div></div>
            </div><div class="floor"></div>
          </div>
        </div>
        <div class="hills" aria-hidden="true"><i class="flower" style="left:18%;bottom:42px;--p:#fff;--d:-1s"></i><i class="flower" style="left:32%;bottom:28px;--p:#ff8d7f;--d:-2s"></i><i class="flower" style="right:22%;bottom:36px;--p:#fff;--d:-.5s"></i></div>
      </section>
      <div class="wave w-grass" aria-hidden="true"><svg viewBox="0 0 1440 48" preserveAspectRatio="none"><path d="M0,20 C180,55 320,0 520,20 C760,48 920,4 1120,20 C1280,34 1360,4 1440,18 L1440,48 L0,48Z"/></svg></div>
      <section class="section" id="dunia">
        <div class="wrap"><div class="section-head"><h2>Jelajahi Dunia Pecahan</h2><p>Pilih kegiatan yang kamu suka dan temukan cara seru memahami pecahan senilai.</p></div>
          <div class="cards">${features.map(([href, icon, title, desc, color]) => `<a class="card ${color}" href="${href}"><span class="glyph">${N.esc(icon)}</span><h3>${N.esc(title)}</h3><p>${N.esc(desc)}</p><span class="tag">Ayo jelajahi →</span></a>`).join('')}</div>
        </div>
      </section>
      <section class="section" aria-label="Contoh gambar pecahan senilai"><div class="wrap">
        <div class="section-head"><h2>Lihat Pecahan dengan ${N.esc(theme.name)}</h2><p>Jumlah bagiannya berbeda, tetapi bagian yang diarsir menunjukkan nilai yang sama.</p></div>
        <div class="cards">
          <article class="card k1"><span class="glyph">${N.themePicture(theme.id, 1, 2, 72, false, `1 dari 2 ${theme.plural} diarsir`)}</span><h3>Satu per dua</h3><p>Satu dari dua bagian ${N.esc(theme.plural || theme.name.toLowerCase())}.</p></article>
          <article class="card k2"><span class="glyph">${N.themePicture(theme.id, 2, 4, 72, false, `2 dari 4 ${theme.plural} diarsir`)}</span><h3>Dua per empat</h3><p>Dua dari empat bagian ${N.esc(theme.plural || theme.name.toLowerCase())}.</p></article>
          <article class="card k3"><span class="glyph">${N.themePicture(theme.id, 3, 6, 72, false, `3 dari 6 ${theme.plural} diarsir`)}</span><h3>Tiga per enam</h3><p>Tiga dari enam bagian ${N.esc(theme.plural || theme.name.toLowerCase())}.</p></article>
        </div>
      </div></section>
      <div class="wave w-sky" aria-hidden="true"><svg viewBox="0 0 1440 48" preserveAspectRatio="none"><path d="M0,18 C180,50 320,0 520,18 C760,46 920,4 1120,18 C1280,34 1360,3 1440,18 L1440,48 L0,48Z"/></svg></div>
      <section class="section steps-band"><div class="wrap"><div class="section-head"><h2>Mulai Belajar dalam 3 Langkah</h2><p>Siapkan dirimu, lalu mulai petualangan matematika!</p></div>
        <ol class="steps"><li><h3>Pilih kegiatan</h3><p>Buka cerita atau materi yang ingin kamu pelajari.</p></li><li><h3>Amati pecahan</h3><p>Ikuti contoh dan bandingkan bagian-bagiannya.</p></li><li><h3>Coba sendiri</h3><p>Latihan soal dan rayakan setiap kemajuanmu.</p></li></ol>
      </div></section>
      <div class="wave w-grape" aria-hidden="true"><svg viewBox="0 0 1440 48" preserveAspectRatio="none"><path d="M0,20 C180,55 320,0 520,20 C760,48 920,4 1120,20 C1280,34 1360,4 1440,18 L1440,48 L0,48Z"/></svg></div>
      <section class="cta"><div class="wrap"><div><h2>Siap untuk Petualangan Pecahan?</h2><p>Belajar, bermain, dan temukan bahwa matematika bisa menyenangkan.</p><a class="btn white" href="#/cerita">Mulai Petualangan ✨</a></div>
        <div class="blocks" aria-hidden="true"><div class="block b1">½</div><div class="block b2">¼</div><div class="block b3">⅔</div></div>
      </div></section>`;
    }
  };
})();
