# NUMERA (Pecahan Senilai)

Media pembelajaran matematika interaktif untuk siswa kelas IV SD/MI. HTML5 + CSS3 + JavaScript ES6+ murni, **tanpa backend, tanpa build**.

## Cara menjalankan
1. Ekstrak ZIP, lalu **klik dua kali `index.html`** (atau buka lewat server statis apa pun, mis. `python3 -m http.server`).
2. Butuh internet hanya untuk font Google (Fredoka/Nunito) dan video YouTube; selain itu berjalan offline.

## Akun demo (hapus/ubah pada penggunaan nyata)
| Peran | Username | Password | Catatan |
|-------|----------|----------|---------|
| Siswa | `siswa`  | `Siswa#123` | Siswa baru juga bisa mendaftar sendiri |
| Guru  | `guru`   | `Guru#2026` | Wajib verifikasi 2 langkah (MFA). Pada mode demo, kode 6 digit ditampilkan di layar |

## Fitur
- **Beranda, Cerita "Ayo, Berbagi Pizza!"** (pertanyaan pemantik + pop-up kesimpulan), **Materi** (arsiran 1/2, 2/4, 3/6 + pizza interaktif), **Cara Menghitung** (simulasi bertahap, pembilang kuning, penyebut biru, panah animasi).
- **Perpustakaan File & Video** (Materi) dan **Video Pembelajaran**: pratinjau PDF/gambar/teks, pemutar video dengan **Mode Proyektor** (layar penuh, tombol besar: putar/jeda, mundur/maju 10 dtk, geser, volume, kecepatan). Pintasan: Spasi, ← →.
- **Ayo Berlatih** & **Evaluasi** (login wajib): umpan balik suara + konfeti. Evaluasi 5 soal, `Nilai = (Benar / 5) * 100`, tuntas bila nilai ≥ 75 (ubah `N.KKM` di `js/core.js`).
- **Riwayat kuis**: lihat, hapus, ekspor CSV / Excel / PDF (siswa: milik sendiri; guru: semua).
- **Dashboard Guru**: ringkasan, CMS Materi, File & Video (unggah **format apa pun** atau tautan/YouTube), Bank Soal (tambah/edit/hapus), Rekap Nilai + ekspor (CSV/Excel/PDF), Riwayat, Audit Log.
- Tombol **🔊** (suara) dan **🔎 A+** (teks besar untuk proyektor) di header.

## Keamanan (simulasi sisi klien)
- Password di-hash **PBKDF2-SHA256 (100.000 iterasi) + salt unik** (simulasi bcrypt/Argon2).
- **Rate limit**: 5 kali gagal → akun terkunci 15 menit. **Pesan error seragam** ("Username atau password salah.").
- **MFA** khusus guru (kode 6 digit berbasis waktu, simulasi TOTP).
- **RBAC**: rute dijaga (`js/app.js`); siswa tidak bisa membuka Dashboard Guru atau menghapus riwayat orang lain.
- **Sesi**: token acak, kedaluwarsa setelah 60 menit tidak aktif. *Catatan jujur:* JavaScript di browser **tidak dapat membuat cookie HttpOnly** (hanya server yang bisa), jadi sesi disimpan di `sessionStorage`. Saat memakai backend nyata, ganti dengan `Set-Cookie: HttpOnly; Secure; SameSite=Strict` dan verifikasi di server.
- **Audit log** aktivitas guru/akses ditolak; ekspor CSV dilindungi dari formula injection; semua input di-escape (anti-XSS).
- Karena semuanya di sisi klien, ini **bukan pengganti keamanan server**.

## Struktur
```
index.html
css/style.css
js/core.js       namespace, util, localStorage (N.db), IndexedDB (N.media), audit
js/data.js       data awal materi & bank soal
js/security.js   hash, rate limit, MFA, sesi, register
js/export.js     CSV / Excel / PDF (cetak)
js/ui.js         toast, modal, suara, konfeti, pizza SVG, pecahan berwarna
js/views/*.js    halaman (home, story, materi, video, hitung, quiz, history, auth, admin, media)
js/app.js        router + guard RBAC + inisialisasi
```

## Catatan
- Data tersimpan **per browser/perangkat** (localStorage + IndexedDB). Untuk berbagi antar perangkat dibutuhkan backend.
- Video yang diunggah disimpan di IndexedDB; peramban memutar mp4/webm/mov dengan baik, sedangkan .mkv/.avi tertentu mungkin tidak didukung peramban (aplikasi menampilkan tombol unduh).
- Reset semua data: hapus data situs di pengaturan browser.
