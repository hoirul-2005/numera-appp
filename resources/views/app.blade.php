<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Media pembelajaran matematika interaktif: Pecahan Senilai untuk kelas IV SD/MI">
    <title>{{ config('app.name', 'NUMERA') }} – Pecahan Senilai</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
    <link rel="stylesheet" href="{{ asset('css/visual-compat.css') }}">
</head>
<body>
    <header id="hdr"></header>
    <main id="main" tabindex="-1"></main>
    <footer class="foot"><div class="wrap"><span>NUMERA · MEDIA BELAJAR MASA KINI</span><a href="#/beranda">Kembali ke beranda ↑</a></div></footer>
    <div id="toasts" aria-live="polite"></div>
    <div id="modal-root"></div>
    <canvas id="confetti" aria-hidden="true"></canvas>

    <script src="{{ asset('js/core.js') }}"></script>
    <script src="{{ asset('js/data.js') }}"></script>
    <script src="{{ asset('js/security.js') }}"></script>
    <script src="{{ asset('js/export.js') }}"></script>
    <script src="{{ asset('js/ui.js') }}"></script>
    <script src="{{ asset('js/views/home.js') }}"></script>
    <script src="{{ asset('js/views/story.js') }}"></script>
    <script src="{{ asset('js/views/media.js') }}"></script>
    <script src="{{ asset('js/views/materi.js') }}"></script>
    <script src="{{ asset('js/views/belajar.js') }}"></script>
    <script src="{{ asset('js/views/video.js') }}"></script>
    <script src="{{ asset('js/views/hitung.js') }}"></script>
    <script src="{{ asset('js/views/quiz.js') }}"></script>
    <script src="{{ asset('js/views/history.js') }}"></script>
    <script src="{{ asset('js/views/auth.js') }}"></script>
    <script src="{{ asset('js/views/admin.js') }}"></script>
    <script src="{{ asset('js/app.js') }}"></script>
</body>
</html>
