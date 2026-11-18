/* NUMERA – Dashboard Guru: CMS materi, file & video, bank soal, rekap nilai, riwayat, audit */
(function () {
  'use strict';
  const N = window.NUMERA;
  const TABS = [['ringkasan', '📊 Ringkasan'], ['konfigurasi', '🎨 Tema & Kelas'], ['materi', '📘 Materi'], ['media', '🎬 File & Video'], ['soal', '❓ Bank Soal'], ['nilai', '🏅 Rekap Nilai'], ['riwayat', '📜 Riwayat Kuis'], ['audit', '🛡️ Audit Log']];
  let tab = 'ringkasan', soalFilter = 'semua';

  /* ---------- data rekap ---------- */
  function recap() {
    const students = N.db.get('users', []).filter((u) => u.role === 'siswa');
    const hist = N.db.get('history', []).filter((h) => h.type === 'Evaluasi');
    return students.map((s) => {
      const hs = hist.filter((h) => h.userId === s.id).sort((a, b) => b.t - a.t);
      const sc = hs.map((h) => h.score);
      return { s, n: hs.length, last: hs[0], best: sc.length ? Math.max(...sc) : null, avg: sc.length ? Math.round(sc.reduce((a, b) => a + b, 0) / sc.length) : null };
    });
  }
  const recapRows = () => [['Nama', 'Username', 'Jumlah Evaluasi', 'Nilai Terakhir', 'Nilai Tertinggi', 'Rata-rata', 'Status', 'Terakhir Mengerjakan']]
    .concat(recap().filter((r) => r.n).map((r) => [r.s.name, r.s.username, r.n, r.last.score, r.best, r.avg, r.last.status, N.fmtDate(r.last.t)]));

  /* ---------- panel ---------- */
  const panels = {
    ringkasan() {
      const users = N.db.get('users', []);
      const students = users.filter((u) => u.role === 'siswa').length;
      const admins = users.filter((u) => N.isAdminRole(u.role)).length;
      const hist = N.db.get('history', []), ev = hist.filter((h) => h.type === 'Evaluasi');
      const avg = ev.length ? Math.round(ev.reduce((a, h) => a + h.score, 0) / ev.length) : '-';
      const stat = (n, l, c) => `<div class="card ${c} stat"><b>${n}</b>${l}</div>`;
      return `<div class="row between" style="margin-bottom:12px"><h3>Ringkasan</h3><button type="button" class="btn btn-g" data-add-admin>➕ Tambah Admin/Guru</button></div>
      <div class="grid g4">${stat(students, 'Siswa terdaftar', 'y')}${stat(admins, 'Admin/Guru', 'b')}${stat(N.db.get('questions', []).length, 'Total soal', 'b')}${stat(N.db.get('files', []).length, 'File & video', 'g')}${stat(ev.length, 'Evaluasi dikerjakan', 'o')}${stat(avg, 'Rata-rata nilai evaluasi', 'y')}</div>
      <div class="info" style="margin-top:16px">Semua data disimpan di peramban ini (localStorage & IndexedDB). Untuk berbagi data antar perangkat dibutuhkan backend server.</div>`;
    },
    konfigurasi() {
      const c = N.learningConfig();
      const themes = c.themes.map((x) => [x.id, x.name, x.icon, x.plural, x.title].join(' | ')).join('\n');
      const operations = c.operations.map((x) => [x.id, x.label, x.sign, x.icon, x.a, x.b, x.story].join(' | ')).join('\n');
      return `<h3>🎨 Atur Tampilan dan Isi Belajar</h3><p>Perubahan di sini akan langsung dipakai pada halaman siswa.</p>
        <form id="learning-config-form" class="learning-config-form">
          <div class="learning-config-grid"><label>Nama aplikasi<input name="appName" required maxlength="40" value="${N.esc(c.appName)}"></label><label>Nama pelajaran<input name="subjectName" required maxlength="60" value="${N.esc(c.subjectName)}"></label><label>Kelas/tingkat<input name="gradeName" required maxlength="40" value="${N.esc(c.gradeName)}"></label><label>Nilai batas tuntas<input name="kkm" type="number" min="0" max="100" required value="${Number(c.kkm)}"></label><label>Jumlah soal evaluasi<input name="evalCount" type="number" min="1" max="100" required value="${Number(c.evalCount)}"></label></div>
          <label for="config-themes">Tema gambar (satu tema per baris)<small>Format: ID | Nama | Emoji | Nama benda | Judul cerita. Contoh: Kebun | Kebun | 🌻 | bunga | Berbagi Bunga</small></label><textarea id="config-themes" name="themes" rows="5" required>${N.esc(themes)}</textarea>
          <label for="config-operations">Contoh operasi berhitung (satu operasi per baris)<small>Format: ID | Nama | Tanda | Emoji | Angka pertama | Angka kedua | Cerita. ID tetap: tambah, kurang, kali, bagi.</small></label><textarea id="config-operations" name="operations" rows="5" required>${N.esc(operations)}</textarea>
          <div id="config-error" aria-live="polite"></div><button class="btn btn-g" type="submit">💾 Simpan Pengaturan</button>
        </form>`;
    },
    materi() {
      const m = N.db.get('materi', []);
      return `<div class="row between"><h3>Materi Teks</h3><button class="btn btn-g" data-add>➕ Tambah Materi</button></div>
        ${m.length ? `<div class="tw"><table><thead><tr><th>Judul</th><th>Isi</th><th>Aksi</th></tr></thead><tbody>${m.map((x) => `<tr><td><b>${N.esc(x.title)}</b></td><td>${N.esc(x.body.slice(0, 110))}${x.body.length > 110 ? '…' : ''}</td><td><div class="admin-actions"><button type="button" class="btn btn-sm btn-b" data-edit="${x.id}" aria-label="Edit ${N.esc(x.title)}">Edit</button><button type="button" class="btn btn-sm btn-r" data-del="${x.id}" aria-label="Hapus ${N.esc(x.title)}">Hapus</button></div></td></tr>`).join('')}</tbody></table></div>` : '<div class="admin-empty"><span>📘</span><h4>Materi masih kosong</h4><p>Buat materi pertama agar siswa punya bahan belajar.</p><button class="btn btn-g" data-add>➕ Tambah Materi</button></div>'}`;
    },
    media() {
      const f = N.db.get('files', []);
      return `<div class="row between"><h3>File, Dokumen & Video</h3><button class="btn btn-g" data-add>⬆️ Unggah / Tautkan</button></div>
        ${f.length ? `<div class="tw"><table><thead><tr><th>Judul</th><th>Jenis</th><th>Sumber</th><th>Ukuran</th><th>Ditambahkan</th><th>Aksi</th></tr></thead><tbody>${f.map((x) => { const k = N.mediaKind(x); return `<tr><td><b>${N.esc(x.title)}</b><br><span class="muted">${N.esc(x.desc || '')}</span></td><td>${N.mediaUI.ICON[k]} ${N.mediaUI.LABEL[k]}</td><td>${x.url ? 'Tautan' : N.esc(x.name || 'Berkas')}</td><td>${x.url ? '-' : N.fmtSize(x.size)}</td><td>${N.fmtDate(x.added)}</td><td><div class="admin-actions"><button type="button" class="btn btn-sm" data-view="${x.id}" aria-label="Lihat ${N.esc(x.title)}">Lihat</button><button type="button" class="btn btn-sm btn-b" data-edit="${x.id}" aria-label="Edit ${N.esc(x.title)}">Edit</button><button type="button" class="btn btn-sm btn-r" data-del="${x.id}" aria-label="Hapus ${N.esc(x.title)}">Hapus</button></div></td></tr>`; }).join('')}</tbody></table></div>` : '<div class="admin-empty"><span>🎬</span><h4>Belum ada video atau bahan belajar</h4><p>Tambahkan video, dokumen, atau tautan agar siswa bisa mulai belajar.</p><button class="btn btn-g" data-add>⬆️ Tambah bahan belajar</button></div>'}`;
    },
    soal() {
      const q = N.db.get('questions', []).filter((x) => soalFilter === 'semua' || x.kind === soalFilter);
      return `<div class="admin-toolbar"><div><h3>Bank Soal</h3><p>Pilih kelompok soal untuk melihat atau mengelolanya.</p></div><button class="btn btn-g" data-add>➕ Tambah Soal</button></div><div class="chips admin-filter" id="sf" aria-label="Saring soal">${['semua', 'latihan', 'evaluasi'].map((k) => `<button type="button" class="chip ${soalFilter === k ? 'on' : ''}" aria-pressed="${soalFilter === k}" data-sf="${k}">${k === 'semua' ? 'Semua soal' : k === 'latihan' ? 'Ayo Berlatih' : 'Evaluasi'}</button>`).join('')}</div>
        <div class="tw" style="margin-top:12px"><table><thead><tr><th>Jenis</th><th>Format</th><th>Soal</th><th>Jawaban benar</th><th>Aksi</th></tr></thead><tbody>${q.map((x) => `<tr><td><span class="pill">${x.kind === 'latihan' ? 'Ayo Berlatih' : 'Evaluasi'}</span></td><td>${({ essay: 'Uraian', short: 'Isian singkat', truefalse: 'Benar/Salah', multiple: 'Pilihan ganda' })[x.type] || 'Pilihan ganda'}</td><td>${N.esc(x.q)}</td><td>${x.type === 'essay' || x.type === 'short' ? N.esc(x.answer || '—') : N.esc(x.options && x.options[x.answer] || '—')}</td><td><div class="admin-actions"><button type="button" class="btn btn-sm btn-b" data-edit="${x.id}" aria-label="Edit soal: ${N.esc(x.q)}">✏️ Edit</button><button type="button" class="btn btn-sm btn-r" data-del="${x.id}" aria-label="Hapus soal: ${N.esc(x.q)}">Hapus</button></div></td></tr>`).join('') || '<tr><td colspan="5">Belum ada soal pada pilihan ini. Tekan “Tambah Soal” untuk membuat soal baru.</td></tr>'}</tbody></table></div>`;
    },
    nilai() {
      const rows = recap();
      return `<div class="row between" style="margin-bottom:12px"><h3>Rekapitulasi Nilai Evaluasi</h3>${N.exp.buttons()}</div>
        <div class="tw"><table><thead><tr><th>Nama</th><th>Username</th><th>Jml</th><th>Terakhir</th><th>Tertinggi</th><th>Rata-rata</th><th>Status</th><th>Terakhir mengerjakan</th></tr></thead><tbody>
        ${rows.map((r) => `<tr><td>${N.esc(r.s.name)}</td><td>${N.esc(r.s.username)}</td><td>${r.n}</td><td>${r.last ? r.last.score : '-'}</td><td>${r.best ?? '-'}</td><td>${r.avg ?? '-'}</td><td>${r.last ? `<span class="pill ${r.last.status === 'Tuntas' ? 'ok' : 'no'}">${r.last.status}</span>` : '<span class="muted">Belum mengerjakan</span>'}</td><td>${r.last ? N.fmtDate(r.last.t) : '-'}</td></tr>`).join('') || '<tr><td colspan="8">Belum ada siswa.</td></tr>'}</tbody></table></div>
        <p class="muted">KKM: ${N.KKM}. Hanya siswa yang telah menyelesaikan evaluasi yang ikut diekspor.</p>`;
    },
    riwayat() {
      return `<div class="row between" style="margin-bottom:12px"><h3>Riwayat Kuis Semua Siswa</h3>${N.exp.buttons()}</div>${N.hist.table(N.db.get('history', []), true)}`;
    },
    audit() {
      const a = N.db.get('audit', []).slice(0, 100);
      return `<h3>Log Audit Aktivitas (100 terakhir)</h3><div class="tw"><table><thead><tr><th>Waktu</th><th>Pengguna</th><th>Aksi</th><th>Detail</th></tr></thead><tbody>${a.map((x) => `<tr><td>${N.fmtDate(x.t)}</td><td>${N.esc(x.user)} <span class="muted">(${N.esc(x.role)})</span></td><td>${N.esc(x.action)}</td><td>${N.esc(x.detail)}</td></tr>`).join('') || '<tr><td colspan="4">Belum ada aktivitas.</td></tr>'}</tbody></table></div>`;
    }
  };

  /* ---------- form-form ---------- */
  const formMateri = (item) => {
    const m = N.modal(`<h3>${item ? 'Edit' : 'Tambah'} Materi</h3><form id="mf" class="admin-modal-form"><label for="t">Judul</label><input id="t" required maxlength="100" value="${N.esc(item ? item.title : '')}"><label for="b">Isi materi</label><textarea id="b" required maxlength="3000">${N.esc(item ? item.body : '')}</textarea><div class="row end" style="margin-top:14px"><button type="button" class="btn" data-c>Batal</button><button class="btn btn-g">Simpan</button></div></form>`);
    N.$('[data-c]', m.el).addEventListener('click', m.close);
    N.$('#mf', m.el).addEventListener('submit', (e) => {
      e.preventDefault();
      const list = N.db.get('materi', []), title = N.$('#t', m.el).value.trim(), body = N.$('#b', m.el).value.trim();
      if (item) { Object.assign(list.find((x) => x.id === item.id), { title, body }); N.audit('edit_materi', title); }
      else { list.push({ id: N.uid(), title, body, added: Date.now() }); N.audit('tambah_materi', title); }
      N.db.set('materi', list); m.close(); N.toast('Materi disimpan.'); draw();
    });
  };

  const formMedia = (item) => {
    const isLink = item && item.url;
    const m = N.modal(`<h3>${item ? 'Edit' : 'Unggah / Tautkan'} File & Video</h3><form id="mf" class="admin-modal-form">
      <label for="t">Judul</label><input id="t" required maxlength="100" value="${N.esc(item ? item.title : '')}">
      <label for="d">Deskripsi</label><input id="d" maxlength="200" value="${N.esc(item ? item.desc || '' : '')}">
      ${item ? '' : `<label>Sumber</label><div class="row"><label style="margin:0"><input type="radio" name="src" value="file" checked> Unggah berkas</label><label style="margin:0"><input type="radio" name="src" value="link"> Tautan (URL / YouTube)</label></div>`}
      <div id="sf" ${isLink ? 'class="hidden"' : ''}><label for="f">${item ? 'Ganti berkas (opsional)' : 'Berkas'} — format apa pun (.mp4, .webm, .mkv, .avi, .mov, .pdf, .docx, gambar, dll.)</label><input id="f" type="file" accept="*/*"></div>
      <div id="sl" class="${isLink || item ? (isLink ? '' : 'hidden') : 'hidden'}"><label for="u">Alamat tautan</label><input id="u" type="url" placeholder="https://…" value="${N.esc(isLink ? item.url : '')}"></div>
      <div id="me"></div><div class="row end" style="margin-top:14px"><button type="button" class="btn" data-c>Batal</button><button class="btn btn-g" id="sv">Simpan</button></div></form>`);
    const q = (s) => N.$(s, m.el);
    N.$('[data-c]', m.el).addEventListener('click', m.close);
    N.$$('[name=src]', m.el).forEach((r) => r.addEventListener('change', () => { const l = q('[name=src]:checked').value === 'link'; q('#sf').classList.toggle('hidden', l); q('#sl').classList.toggle('hidden', !l); }));
    q('#mf').addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = (t) => { q('#me').innerHTML = `<div class="err">${N.esc(t)}</div>`; };
      const title = q('#t').value.trim(), desc = q('#d').value.trim();
      const link = item ? isLink : q('[name=src]:checked').value === 'link';
      const file = q('#f').files[0], url = q('#u').value.trim();
      if (link) { if (!/^https?:\/\//i.test(url)) return err('Masukkan tautan yang diawali http:// atau https://'); }
      else if (!item && !file) return err('Pilih berkas terlebih dahulu.');
      const btn = q('#sv'); btn.disabled = true; btn.textContent = 'Menyimpan…';
      try {
        const list = N.db.get('files', []);
        if (item) {
          const it = list.find((x) => x.id === item.id); it.title = title; it.desc = desc;
          if (link) it.url = url;
          else if (file) { await N.media.put(it.mediaId, file); Object.assign(it, { name: file.name, mime: file.type, size: file.size }); }
          N.audit('edit_file', title);
        } else if (link) { list.push({ id: N.uid(), title, desc, url, added: Date.now() }); N.audit('tautkan_file', title); }
        else {
          const mediaId = N.uid(); await N.media.put(mediaId, file);
          list.push({ id: N.uid(), title, desc, mediaId, name: file.name, mime: file.type, size: file.size, added: Date.now() }); N.audit('unggah_file', `${title} (${N.fmtSize(file.size)})`);
        }
        N.db.set('files', list); m.close(); N.toast('Tersimpan.'); draw();
      } catch (ex) { btn.disabled = false; btn.textContent = 'Simpan'; err('Gagal menyimpan (penyimpanan peramban mungkin penuh): ' + (ex && ex.message || '')); }
    });
  };

  const formSoal = (item) => {
    const o = item && item.options && item.options.length ? item.options : ['', '', '', ''], L = ['A', 'B', 'C', 'D', 'E', 'F'];
    const type = item ? item.type || 'multiple' : 'multiple';
    const isText = type === 'essay' || type === 'short';
    const themes = N.learningConfig().themes || [];
    const selectedTheme = (item && item.game) || (themes[0] && themes[0].id) || '';
    const m = N.modal(`<h3>${item ? 'Edit' : 'Tambah'} Soal</h3><form id="mf" class="admin-modal-form">
      <div class="question-form-intro"><span>${item ? '✏️' : '✨'}</span><p>${item ? 'Ubah isi soal, lalu pilih jawaban yang benar dan tekan Simpan.' : 'Isi langkah demi langkah. Pilih jenis soal, tulis pertanyaan, lalu tentukan jawabannya.'}</p></div>
      <div class="question-form-grid">
      <label for="k">1. Soal ini untuk<select id="k"><option value="latihan" ${item && item.kind === 'latihan' ? 'selected' : ''}>Ayo Berlatih</option><option value="evaluasi" ${item && item.kind === 'evaluasi' ? 'selected' : ''}>Evaluasi</option></select></label>
      <label for="qt">2. Bentuk soal<select id="qt"><option value="multiple" ${type === 'multiple' ? 'selected' : ''}>Pilihan ganda</option><option value="truefalse" ${type === 'truefalse' ? 'selected' : ''}>Benar atau salah</option><option value="short" ${type === 'short' ? 'selected' : ''}>Isian singkat</option><option value="essay" ${type === 'essay' ? 'selected' : ''}>Uraian / essay</option></select></label>
      <label for="g">3. Tema gambar<select id="g">${themes.map((theme) => `<option value="${N.esc(theme.id)}" ${selectedTheme === theme.id ? 'selected' : ''}>${N.esc(theme.icon)} ${N.esc(theme.name)}</option>`).join('')}</select></label>
      </div>
      <label for="q">4. Tulis pertanyaan</label><textarea id="q" required maxlength="400" placeholder="Contoh: Ada 3 piring. Setiap piring berisi 2 kue. Berapa jumlah kue semuanya?">${N.esc(item ? item.q : '')}</textarea>
      <div id="mc" class="question-answer-box ${type === 'multiple' ? '' : 'hidden'}">
        <label for="option-count">Berapa pilihan jawaban?</label><select id="option-count">${[2, 3, 4, 5, 6].map((count) => `<option value="${count}" ${(o.length === count ? 'selected' : '')}>${count} pilihan</option>`).join('')}</select>
        <p class="question-form-help">Tuliskan jawabannya. Lalu tekan lingkaran <b>Jadikan jawaban benar</b> pada pilihan yang tepat.</p>
        <div id="option-fields">${L.slice(0, Math.max(2, o.length)).map((l, i) => `<div class="question-choice-row"><span class="question-choice-letter">${l}</span><input id="o${i}" aria-label="Teks pilihan ${l}" placeholder="Tulis pilihan ${l}" ${i < 2 ? 'required' : ''} maxlength="80" value="${N.esc(o[i] || '')}"><label class="question-correct"><input type="radio" name="ans" value="${i}" ${(Number(item ? item.answer : 0)) === i ? 'checked' : ''}><span>Jawaban benar</span></label></div>`).join('')}</div>
      </div>
      <div id="tf" class="question-answer-box ${type === 'truefalse' ? '' : 'hidden'}"><p class="question-form-help">Pilih satu jawaban yang tepat.</p><div class="question-binary"><label><input type="radio" name="tf-answer" value="0" ${(item && item.answer === 0) || !item ? 'checked' : ''}> ✅ Benar</label><label><input type="radio" name="tf-answer" value="1" ${item && item.answer === 1 ? 'checked' : ''}> ❌ Salah</label></div></div>
      <div id="es" class="${isText ? '' : 'hidden'}">
        <label for="ea">Jawaban yang diharapkan</label><p class="question-form-help">Jawaban ini menjadi panduan saat guru memeriksa isian atau uraian siswa.</p><textarea id="ea" rows="3" maxlength="500" placeholder="Contoh: 1/2 atau 6 kue">${N.esc(item && isText ? item.answer || '' : '')}</textarea>
      </div>
      <label for="x">Pembahasan setelah menjawab <span class="muted">(opsional)</span></label><input id="x" maxlength="250" placeholder="Contoh: 3 piring × 2 kue = 6 kue" value="${N.esc(item ? item.explain || '' : '')}">
      <details class="question-extra"><summary>Tambahkan gambar pecahan pizza (opsional)</summary><p class="question-form-help">Isi jumlah potongan yang diarsir dan jumlah semua potongan.</p><div class="row"><label for="pn">Diarsir<input id="pn" type="number" min="0" max="12" placeholder="2" value="${item && item.pizza ? item.pizza[0] : ''}"></label><span>dari</span><label for="pd">Jumlah potongan<input id="pd" type="number" min="1" max="12" placeholder="4" value="${item && item.pizza ? item.pizza[1] : ''}"></label></div></details>
      <div id="me"></div><div class="row end" style="margin-top:14px"><button type="button" class="btn" data-c>Batal</button><button class="btn btn-g">Simpan</button></div></form>`);
    const q = (s) => N.$(s, m.el);
    const toggleType = () => {
      const value = q('#qt').value;
      q('#mc').classList.toggle('hidden', value !== 'multiple');
      q('#tf').classList.toggle('hidden', value !== 'truefalse');
      q('#es').classList.toggle('hidden', value !== 'essay' && value !== 'short');
      if (value === 'truefalse' && !q('[name=tf-answer]:checked')) q('[name=tf-answer]').checked = true;
    };
    const drawOptionFields = () => {
      const count = Number(q('#option-count').value), old = Array.from({ length: 6 }, (_, i) => q(`#o${i}`)?.value || '');
      const answer = q('[name=ans]:checked')?.value || '0';
      q('#option-fields').innerHTML = L.slice(0, count).map((label, i) => `<div class="question-choice-row"><span class="question-choice-letter">${label}</span><input id="o${i}" aria-label="Teks pilihan ${label}" placeholder="Tulis pilihan ${label}" ${i < 2 ? 'required' : ''} maxlength="80" value="${N.esc(old[i])}"><label class="question-correct"><input type="radio" name="ans" value="${i}" ${String(i) === answer ? 'checked' : ''}><span>Jawaban benar</span></label></div>`).join('');
      if (!q('[name=ans]:checked')) q('[name=ans]').checked = true;
    };
    N.$('[data-c]', m.el).addEventListener('click', m.close);
    q('#qt').addEventListener('change', toggleType);
    q('#option-count').addEventListener('change', drawOptionFields);
    q('#mf').addEventListener('submit', (e) => {
      e.preventDefault();
      const type = q('#qt').value, game = q('#g').value;
      const pn = q('#pn').value, pd = q('#pd').value;
      const pizza = pn !== '' && pd !== '' && +pn <= +pd ? [+pn, +pd] : null;
      if (type === 'essay' || type === 'short') {
        const answer = q('#ea').value.trim();
        if (!answer) { q('#me').innerHTML = '<div class="err">Isi jawaban yang diharapkan.</div>'; return; }
        const data = { kind: q('#k').value, q: q('#q').value.trim(), options: [], answer, explain: q('#x').value.trim(), pizza, type, game };
        const list = N.db.get('questions', []);
        if (item) { Object.assign(list.find((x) => x.id === item.id), data); N.audit('edit_soal', data.q.slice(0, 40)); }
        else { list.push({ id: N.uid(), ...data }); N.audit('tambah_soal', data.q.slice(0, 40)); }
        N.db.set('questions', list); m.close(); N.toast('Soal disimpan.'); draw();
        return;
      }
      const trueFalse = type === 'truefalse';
      const options = trueFalse ? ['Benar', 'Salah'] : Array.from({ length: Number(q('#option-count').value) }, (_, i) => q('#o' + i).value.trim());
      if (!trueFalse && (options.some((option) => !option) || new Set(options).size !== options.length)) { q('#me').innerHTML = '<div class="err">Isi semua pilihan dengan jawaban yang berbeda.</div>'; return; }
      const data = { kind: q('#k').value, q: q('#q').value.trim(), options, answer: Number(trueFalse ? q('[name=tf-answer]:checked')?.value : q('[name=ans]:checked')?.value), explain: q('#x').value.trim(), pizza, type, game };
      const list = N.db.get('questions', []);
      if (item) { Object.assign(list.find((x) => x.id === item.id), data); N.audit('edit_soal', data.q.slice(0, 40)); }
      else { list.push({ id: N.uid(), ...data }); N.audit('tambah_soal', data.q.slice(0, 40)); }
      N.db.set('questions', list); m.close(); N.toast('Soal disimpan.'); draw();
    });
  };

  const formAdmin = () => {
    const m = N.modal(`<h3>Tambah Akun Pengelola</h3><form id="af" class="admin-modal-form"><p class="question-form-help">Buat akun baru untuk orang yang membantu mengelola materi dan soal.</p><label for="n">Nama lengkap</label><input id="n" required maxlength="40" autocomplete="name"><label for="u">Username login</label><input id="u" required maxlength="20" placeholder="huruf kecil, angka, atau _" autocomplete="username"><label for="arole">Peran akun</label><select id="arole"><option value="admin">Admin — akses penuh pengelolaan</option><option value="guru">Guru — kelola materi dan soal</option></select><label for="p">Password sementara</label><input id="p" type="password" required minlength="8" autocomplete="new-password" aria-describedby="pw-help"><small id="pw-help">Minimal 8 karakter, berisi huruf dan angka.</small><label for="p2">Ulangi password</label><input id="p2" type="password" required autocomplete="new-password"><div id="me" aria-live="polite"></div><div class="row end" style="margin-top:14px"><button type="button" class="btn" data-c>Batal</button><button class="btn btn-g">Buat Akun</button></div></form>`);
    const q = (s) => N.$(s, m.el);
    N.$('[data-c]', m.el).addEventListener('click', m.close);
    q('#af').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = q('#n').value.trim();
      const uname = q('#u').value.trim();
      const pw = q('#p').value;
      const pw2 = q('#p2').value;
      if (pw !== pw2) { q('#me').innerHTML = '<div class="err">Password tidak sama.</div>'; return; }
      const role = q('#arole').value;
      const r = await N.auth.register(name, uname, pw, role);
      if (r.error) { q('#me').innerHTML = `<div class="err">${N.esc(r.error)}</div>`; return; }
      N.audit('tambah_pengelola', `${uname} (${role})`);
      m.close(); N.toast(`Akun ${role === 'admin' ? 'admin' : 'guru'} berhasil dibuat.`); draw();
    });
  };

  /* ---------- hapus ---------- */
  async function remove(id) {
    if (!(await N.confirm('Hapus data ini? Tindakan tidak bisa dibatalkan.'))) return;
    if (tab === 'materi') { const l = N.db.get('materi', []), x = l.find((i) => N.sameId(i.id, id)); N.db.set('materi', l.filter((i) => !N.sameId(i.id, id))); N.audit('hapus_materi', x && x.title); }
    if (tab === 'soal') { const l = N.db.get('questions', []), x = l.find((i) => N.sameId(i.id, id)); N.db.set('questions', l.filter((i) => !N.sameId(i.id, id))); N.audit('hapus_soal', x && x.q.slice(0, 40)); }
    if (tab === 'media') {
      const l = N.db.get('files', []), x = l.find((i) => N.sameId(i.id, id));
      if (x && x.mediaId) { try { await N.media.del(x.mediaId); } catch (e) { /* abaikan */ } }
      N.db.set('files', l.filter((i) => !N.sameId(i.id, id))); N.audit('hapus_file', x && x.title);
    }
    N.toast('Dihapus.'); draw();
  }

  /* ---------- render & bind ---------- */
  let rootEl = null;
  function draw() {
    N.$('#apanel', rootEl).innerHTML = panels[tab]();
    N.$$('.tab', rootEl).forEach((t) => { const active = t.dataset.tab === tab; t.classList.toggle('on', active); t.setAttribute('aria-selected', String(active)); });
    const p = N.$('#apanel', rootEl);
    const forms = { materi: formMateri, media: formMedia, soal: formSoal };
    const src = { materi: 'materi', media: 'files', soal: 'questions' }[tab];
    const find = (id) => N.db.get(src, []).find((x) => x.id === id);
    const add = N.$('[data-add]', p); if (add) add.addEventListener('click', () => forms[tab]());
    const addAdmin = N.$('[data-add-admin]', p); if (addAdmin) addAdmin.addEventListener('click', () => formAdmin());
    N.$$('[data-edit]', p).forEach((b) => b.addEventListener('click', () => forms[tab](find(b.dataset.edit))));
    N.$$('[data-view]', p).forEach((b) => b.addEventListener('click', () => N.mediaUI.openPreview(find(b.dataset.view))));
    if (tab === 'materi' || tab === 'media' || tab === 'soal') N.$$('[data-del]', p).forEach((b) => b.addEventListener('click', () => remove(b.dataset.del)));
    N.$$('[data-sf]', p).forEach((b) => b.addEventListener('click', () => { soalFilter = b.dataset.sf; draw(); }));
    if (tab === 'nilai') N.exp.bind(p, 'rekap-nilai-siswa', 'Rekapitulasi Nilai Evaluasi NUMERA', recapRows);
    if (tab === 'riwayat') { N.exp.bind(p, 'riwayat-kuis-semua', 'Riwayat Kuis Semua Siswa – NUMERA', () => N.hist.rows(N.db.get('history', []), true)); N.hist.bindDelete(p, draw); }
    if (tab === 'konfigurasi') {
      N.$('#learning-config-form', p).addEventListener('submit', (event) => {
        event.preventDefault();
        const form = event.currentTarget, err = N.$('#config-error', p);
        const parseLines = (value, expected, label) => {
          const rows = value.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => line.split('|').map((part) => part.trim()));
          if (!rows.length || rows.some((row) => row.length !== expected || row.some((part) => !part))) throw new Error(`Periksa format ${label}.`);
          return rows;
        };
        try {
          const themeRows = parseLines(form.elements.themes.value, 5, 'tema');
          const ids = themeRows.map((row) => row[0]);
          if (new Set(ids).size !== ids.length || ids.some((id) => !/^[\w-]{1,32}$/.test(id))) throw new Error('ID tema harus berbeda dan hanya boleh berisi huruf, angka, garis bawah, atau tanda hubung.');
          const themes = themeRows.map(([id, name, icon, plural, title]) => ({ id, name, icon, plural, title }));
          const opRows = parseLines(form.elements.operations.value, 7, 'operasi');
          const allowed = ['tambah', 'kurang', 'kali', 'bagi'];
          if (opRows.length !== 4 || opRows.some((row) => !allowed.includes(row[0])) || new Set(opRows.map((row) => row[0])).size !== 4) throw new Error('Isi tepat empat operasi dengan ID tambah, kurang, kali, dan bagi.');
          const signs = { tambah: '+', kurang: '−', kali: '×', bagi: '÷' };
          const operations = opRows.map(([id, label, sign, icon, a, b, story]) => {
            const first = Number(a), second = Number(b);
            if (!Number.isInteger(first) || !Number.isInteger(second) || first < 0 || second < 0 || first > 50 || second > 50) throw new Error('Angka contoh operasi harus bilangan bulat 0–50.');
            if (sign !== signs[id]) throw new Error(`Tanda operasi ${id} harus ${signs[id]}.`);
            if (id === 'kurang' && first < second) throw new Error('Untuk contoh pengurangan, angka pertama harus lebih besar atau sama dengan angka kedua.');
            if (id === 'bagi' && (!second || first % second !== 0)) throw new Error('Untuk contoh pembagian, angka kedua harus lebih dari 0 dan hasilnya bilangan bulat.');
            return { id, label, sign, icon, a: first, b: second, story };
          });
          const config = { ...N.learningConfig(), appName: form.elements.appName.value.trim(), subjectName: form.elements.subjectName.value.trim(), gradeName: form.elements.gradeName.value.trim(), kkm: Number(form.elements.kkm.value), evalCount: Number(form.elements.evalCount.value), themes, operations };
          if (!config.appName || !config.subjectName || !config.gradeName || !themes.length || config.kkm < 0 || config.kkm > 100 || config.evalCount < 1 || config.evalCount > 100) throw new Error('Lengkapi semua pengaturan dengan nilai yang sesuai.');
          N.db.set('learningConfig', config); N.applyLearningConfig(); N.audit('ubah_pengaturan_belajar', `${config.gradeName}, ${themes.length} tema`);
          N.toast('Pengaturan tema, kelas, dan materi belajar berhasil disimpan.'); N.render();
        } catch (error) { err.innerHTML = `<div class="err">${N.esc(error.message)}</div>`; }
      });
    }
  }

  N.views.admin = {
    render() {
      return `<section class="admin-dashboard"><h2>🧑‍🏫 Dashboard Guru</h2><p class="admin-welcome">Pilih bagian yang ingin kamu kelola hari ini ✨</p><div class="tabs" role="tablist" aria-label="Bagian dashboard">${TABS.map(([k, l]) => `<button class="tab" role="tab" data-tab="${k}" aria-selected="false">${l}</button>`).join('')}</div><div id="apanel" class="admin-panel" role="tabpanel" tabindex="0"></div></section>`;
    },
    mount(root) {
      rootEl = root;
      N.$$('.tab', root).forEach((t) => t.addEventListener('click', () => { tab = t.dataset.tab; draw(); }));
      draw();
    }
  };
})();
