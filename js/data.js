/* NUMERA – data awal (seed) materi & bank soal */
(function () {
  'use strict';
  const N = window.NUMERA;

  const Q = (kind, q, options, answer, explain, pizza) => ({ id: N.uid(), kind, q, options, answer, explain, pizza: pizza || null });

  N.seedContent = function () {
    if (!N.db.get('materi')) {
      N.db.set('materi', [
        { id: N.uid(), title: 'Apa itu Pecahan Senilai?', body: 'Pecahan senilai adalah pecahan-pecahan yang tampak berbeda, tetapi nilainya sama. Contohnya 1/2 = 2/4 = 3/6. Jika digambar, bagian yang diarsir luasnya sama besar.', added: Date.now() },
        { id: N.uid(), title: 'Cara Membuat Pecahan Senilai', body: 'Kalikan pembilang dan penyebut dengan bilangan yang sama (bukan nol). Contoh: 1/2 × 3/3 = 3/6. Kita juga bisa membagi pembilang dan penyebut dengan bilangan yang sama untuk menyederhanakan.', added: Date.now() }
      ]);
    }
    if (!N.db.get('files')) N.db.set('files', []);
    if (!N.db.get('questions')) {
      N.db.set('questions', [
        Q('latihan', 'Pecahan yang senilai dengan 1/2 adalah ...', ['2/3', '2/4', '3/4', '1/4'], 1, '1/2 × 2/2 = 2/4. Pembilang dan penyebut dikali 2.', [2, 4]),
        Q('latihan', '1/2 = ?/6. Angka yang tepat untuk ? adalah ...', ['2', '3', '4', '6'], 1, '2 × 3 = 6, maka 1 × 3 = 3. Jadi 1/2 = 3/6.'),
        Q('latihan', '2/4 senilai dengan pecahan ...', ['1/2', '1/3', '2/3', '3/4'], 0, '2/4 dibagi 2/2 menjadi 1/2.', [2, 4]),
        Q('latihan', '3/6 = 1/?. Angka yang tepat untuk ? adalah ...', ['2', '3', '4', '6'], 0, '3 dan 6 sama-sama dibagi 3, hasilnya 1/2.', [3, 6]),
        Q('latihan', 'Pecahan berikut yang TIDAK senilai dengan 1/3 adalah ...', ['2/6', '3/9', '2/5', '4/12'], 2, '1/3 = 2/6 = 3/9 = 4/12. Sedangkan 2/5 nilainya berbeda.'),
        Q('latihan', '1/4 × 3/3 menghasilkan pecahan ...', ['3/12', '3/7', '1/12', '4/12'], 0, '1 × 3 = 3 dan 4 × 3 = 12, sehingga 3/12.', [1, 4]),
        Q('evaluasi', '2/3 = ?/9. Angka yang tepat untuk ? adalah ...', ['3', '5', '6', '9'], 2, '3 × 3 = 9, maka 2 × 3 = 6.'),
        Q('evaluasi', 'Pecahan 4/8 senilai dengan ...', ['1/2', '1/4', '2/3', '3/4'], 0, '4/8 dibagi 4/4 menjadi 1/2.', [4, 8]),
        Q('evaluasi', 'Rani makan 1/2 pizza dan Budi makan 2/4 pizza yang sama besar. Siapa yang makan lebih banyak?', ['Rani', 'Budi', 'Sama banyak', 'Tidak bisa dibandingkan'], 2, '1/2 dan 2/4 adalah pecahan senilai, jadi sama banyak.'),
        Q('evaluasi', 'Bentuk paling sederhana dari 5/10 adalah ...', ['1/2', '1/5', '2/5', '5/2'], 0, '5/10 dibagi 5/5 menjadi 1/2.'),
        Q('evaluasi', 'Pecahan yang senilai dengan 3/4 adalah ...', ['4/6', '6/8', '5/6', '3/8'], 1, '3/4 × 2/2 = 6/8.', [3, 4]),
        Q('evaluasi', '6/12 = ?/2. Angka yang tepat untuk ? adalah ...', ['1', '2', '3', '6'], 0, '6 dan 12 dibagi 6, hasilnya 1/2.'),
        Q('evaluasi', 'Pecahan yang TIDAK senilai dengan 2/5 adalah ...', ['4/10', '6/15', '8/20', '4/15'], 3, '4/15 bukan hasil kali 2/5 dengan bilangan yang sama.'),
        Q('evaluasi', '3/5 = ?/20. Angka yang tepat untuk ? adalah ...', ['8', '10', '12', '15'], 2, '5 × 4 = 20, maka 3 × 4 = 12.')
      ]);
    }
  };
})();
