<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('numera:about', function () {
    $this->info('NUMERA media belajar berjalan dengan Laravel.');
})->purpose('Tampilkan ringkasan aplikasi NUMERA');
