# NUMERA — Media Belajar

NUMERA kini memakai Laravel sebagai aplikasi web dan Blade sebagai template halaman. CSS dan JavaScript interaktif tetap digunakan sebagai aset publik agar tampilan dan kegiatan belajar yang sudah ada tetap sama.

## Kebutuhan

- PHP 8.2 atau lebih baru
- Composer 2
- Ekstensi PHP umum untuk Laravel (ctype, curl, fileinfo, mbstring, openssl, PDO, tokenizer, xml)
- Apache dengan `mod_rewrite` aktif saat dijalankan melalui XAMPP

## Menjalankan dengan XAMPP

1. Dari folder proyek, jalankan `composer install`.
2. Salin `.env.example` menjadi `.env` jika berkas `.env` belum tersedia.
3. Jalankan `php artisan key:generate` jika `APP_KEY` masih kosong.
4. Arahkan browser ke `http://localhost/media_belajar/`.

Untuk server lain, jadikan folder `public/` sebagai document root sesuai praktik Laravel. Berkas `index.php` dan `.htaccess` di akar proyek hanya menjadi pintu masuk praktis untuk instalasi NUMERA di subfolder htdocs XAMPP.

## Struktur aplikasi

- `routes/web.php` — rute Laravel.
- `resources/views/app.blade.php` — kerangka halaman Blade.
- `public/css` dan `public/js` — stylesheet dan JavaScript interaktif NUMERA.
- `app/Providers` — provider aplikasi Laravel.
- `config` dan `bootstrap` — konfigurasi serta bootstrap Laravel.

Interaksi belajar, navigasi berbasis hash, dan penyimpanan konten yang sudah ada masih dijalankan di browser. Rute Laravel saat ini menyajikan kerangka Blade; pemindahan penyimpanan dan autentikasi dari browser ke database/server merupakan pekerjaan backend tersendiri.
