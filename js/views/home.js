/* NUMERA – Beranda */
(function () {
  'use strict';
  const N = window.NUMERA;
  N.views.home = {
    render() {
      const feats = [
        ['#/cerita', '🍕', 'Cerita Pizza', 'Rani dan Budi berbagi pizza', 'y'],
        ['#/materi', '📘', 'Materi', 'Kenali pecahan senilai', 'b'],
        ['#/video', '🎬', 'Video Pembelajaran', 'Tonton bersama satu kelas', 'o'],
        ['#/hitung', '🧮', 'Cara Menghitung', 'Kalikan pembilang & penyebut', 'g'],
        ['#/latihan', '🎯', 'Ayo Berlatih', 'Latihan soal seru (perlu login)', 'y'],
        ['#/evaluasi', '🏆', 'Evaluasi', '5 soal, nilai otomatis (perlu login)', 'b']
      ];
      return `<section class="hero">
        <div class="floaters">${N.numchar(1, 1)}${N.numchar('½', 2, .3)}${N.numchar(2, 3, .6)}${N.numchar('¼', 4, .9)}${N.numchar(3, 5, 1.2)}</div>
        <h1>Selamat Datang di NUMERA!</h1>
        <p class="sub">Belajar Matematika Jadi Lebih Seru</p>
        <a class="btn btn-big btn-y" href="#/cerita">🚀 Mulai Belajar</a>
        <div class="eq" style="margin-top:28px">${N.pizza(1, 2, 110)}<span>=</span>${N.pizza(2, 4, 110)}<span>=</span>${N.pizza(3, 6, 110)}</div>
        <p class="muted">Pecahan senilai: tampak beda, nilainya sama!</p>
      </section>
      <section class="grid g3" style="margin-top:20px">
        ${feats.map((f) => `<a class="card ${f[4]} feat" href="${f[0]}"><div class="ic">${f[1]}</div><h3>${f[2]}</h3><p>${f[3]}</p></a>`).join('')}
      </section>`;
    }
  };
})();
