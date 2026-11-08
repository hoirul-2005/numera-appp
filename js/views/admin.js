/* NUMERA – Dashboard Guru: CMS materi, file & video, bank soal, rekap nilai, riwayat, audit */
(function () {
  'use strict';
  const N = window.NUMERA;
  const TABS = [['ringkasan', '📊 Ringkasan'], ['materi', '📘 Materi'], ['media', '🎬 File & Video'], ['soal', '❓ Bank Soal'], ['nilai', '🏅 Rekap Nilai'], ['riwayat', '📜 Riwayat Kuis'], ['audit', '🛡️ Audit Log']];
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
    materi() {
      const m = N.db.get('materi', []);
      return `<div class="row between"><h3>Materi Teks</h3><button class="btn btn-g" data-add>➕ Tambah Materi</button></div>
        ${m.length ? `<div class="tw"><table><thead><tr><th>Judul</th><th>Isi</th><th>Aksi</th></tr></thead><tbody>${m.map((x) => `<tr><td><b>${N.esc(x.title)}</b></td><td>${N.esc(x.body.slice(0, 110))}${x.body.length > 110 ? '…' : ''}</td><td><button type="button" class="btn btn-sm btn-b" data-edit="${x.id}">✏️ Edit</button><button type="button" class="btn btn-sm btn-r" data-del="${x.id}">🗑️ Hapus</button></td></tr>`).join('')}</tbody></table></div>` : '<div class="card center">Belum ada materi.</div>'}`;
    },
    media() {
      const f = N.db.get('files', []);
      return `<div class="row between"><h3>File, Dokumen & Video</h3><button class="btn btn-g" data-add>⬆️ Unggah / Tautkan</button></div>
        ${f.length ? `<div class="tw"><table><thead><tr><th>Judul</th><th>Jenis</th><th>Sumber</th><th>Ukuran</th><th>Ditambahkan</th><th>Aksi</th></tr></thead><tbody>${f.map((x) => { const k = N.mediaKind(x); return `<tr><td><b>${N.esc(x.title)}</b><br><span class="muted">${N.esc(x.desc || '')}</span></td><td>${N.mediaUI.ICON[k]} ${N.mediaUI.LABEL[k]}</td><td>${x.url ? 'Tautan' : N.esc(x.name || 'Berkas')}</td><td>${x.url ? '-' : N.fmtSize(x.size)}</td><td>${N.fmtDate(x.added)}</td><td><button type="button" class="btn btn-sm" data-view="${x.id}">👁️</button><button type="button" class="btn btn-sm btn-b" data-edit="${x.id}">✏️</button><button type="button" class="btn btn-sm btn-r" data-del="${x.id}">🗑️</button></td></tr>`; }).join('')}</tbody></table></div>` : '<div class="card center">Belum ada file/video. Klik "Unggah / Tautkan".</div>'}`;
    },
    soal() {
      const q = N.db.get('questions', []).filter((x) => soalFilter === 'semua' || x.kind === soalFilter);
      return `<div class="row between"><div class="chips" id="sf">${['semua', 'latihan', 'evaluasi'].map((k) => `<button class="chip ${soalFilter === k ? 'on' : ''}" data-sf="${k}">${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</div><button class="btn btn-g" data-add>➕ Tambah Soal</button></div>
        <div class="tw" style="margin-top:12px"><table><thead><tr><th>Jenis</th><th>Soal</th><th>Jawaban benar</th><th>Aksi</th></tr></thead><tbody>${q.map((x) => `<tr><td><span class="pill">${x.kind}</span></td><td>${N.esc(x.q)}</td><td>${N.esc(x.options[x.answer])}</td><td><button type="button" class="btn btn-sm btn-b" data-edit="${x.id}">✏️</button><button type="button" class="btn btn-sm btn-r" data-del="${x.id}">🗑️</button></td></tr>`).join('') || '<tr><td colspan="4">Belum ada soal.</td></tr>'}</tbody></table></div>`;
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
    const m = N.modal(`<h3>${item ? 'Edit' : 'Tambah'} Materi</h3><form id="mf"><label for="t">Judul</label><input id="t" required maxlength="100" value="${N.esc(item ? item.title : '')}"><label for="b">Isi materi</label><textarea id="b" required maxlength="3000">${N.esc(item ? item.body : '')}</textarea><div class="row end" style="margin-top:14px"><button type="button" class="btn" data-c>Batal</button><button class="btn btn-g">Simpan</button></div></form>`);
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
    const m = N.modal(`<h3>${item ? 'Edit' : 'Unggah / Tautkan'} File & Video</h3><form id="mf">
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
    const o = item ? item.options : ['', '', '', ''], L = ['A', 'B', 'C', 'D'];
    const m = N.modal(`<h3>${item ? 'Edit' : 'Tambah'} Soal</h3><form id="mf">
      <label for="k">Jenis</label><select id="k"><option value="latihan" ${item && item.kind === 'latihan' ? 'selected' : ''}>Ayo Berlatih</option><option value="evaluasi" ${item && item.kind === 'evaluasi' ? 'selected' : ''}>Evaluasi</option></select>
      <label for="q">Pertanyaan</label><textarea id="q" required maxlength="400">${N.esc(item ? item.q : '')}</textarea>
      ${L.map((l, i) => `<label for="o${i}">Pilihan ${l}</label><div class="row" style="flex-wrap:nowrap"><input id="o${i}" required maxlength="80" value="${N.esc(o[i])}"><label style="margin:0;white-space:nowrap"><input type="radio" name="ans" value="${i}" ${(item ? item.answer : 0) === i ? 'checked' : ''}> benar</label></div>`).join('')}
      <label for="x">Pembahasan (opsional)</label><input id="x" maxlength="250" value="${N.esc(item ? item.explain || '' : '')}">
      <label>Gambar pizza (opsional)</label><div class="row"><input id="pn" type="number" min="0" max="12" placeholder="diarsir" style="width:110px" value="${item && item.pizza ? item.pizza[0] : ''}"><span>dari</span><input id="pd" type="number" min="1" max="12" placeholder="potong" style="width:110px" value="${item && item.pizza ? item.pizza[1] : ''}"></div>
      <div id="me"></div><div class="row end" style="margin-top:14px"><button type="button" class="btn" data-c>Batal</button><button class="btn btn-g">Simpan</button></div></form>`);
    const q = (s) => N.$(s, m.el);
    N.$('[data-c]', m.el).addEventListener('click', m.close);
    q('#mf').addEventListener('submit', (e) => {
      e.preventDefault();
      const options = [0, 1, 2, 3].map((i) => q('#o' + i).value.trim());
      if (new Set(options).size < 4) { q('#me').innerHTML = '<div class="err">Keempat pilihan harus berbeda.</div>'; return; }
      const pn = q('#pn').value, pd = q('#pd').value;
      const pizza = pn !== '' && pd !== '' && +pn <= +pd ? [+pn, +pd] : null;
      const data = { kind: q('#k').value, q: q('#q').value.trim(), options, answer: +q('[name=ans]:checked').value, explain: q('#x').value.trim(), pizza };
      const list = N.db.get('questions', []);
      if (item) { Object.assign(list.find((x) => x.id === item.id), data); N.audit('edit_soal', data.q.slice(0, 40)); }
      else { list.push({ id: N.uid(), ...data }); N.audit('tambah_soal', data.q.slice(0, 40)); }
      N.db.set('questions', list); m.close(); N.toast('Soal disimpan.'); draw();
    });
  };

  const formAdmin = () => {
    const m = N.modal(`<h3>Tambah Admin/Guru Baru</h3><form id="af"><label for="n">Nama lengkap</label><input id="n" required maxlength="40"><label for="u">Username</label><input id="u" required maxlength="20" placeholder="huruf kecil/angka/_"><label for="p">Password</label><input id="p" type="password" required minlength="8" autocomplete="new-password"><label for="p2">Ulangi password</label><input id="p2" type="password" required autocomplete="new-password"><div id="me"></div><div class="row end" style="margin-top:14px"><button type="button" class="btn" data-c>Batal</button><button class="btn btn-g">Tambah Admin</button></div></form>`);
    const q = (s) => N.$(s, m.el);
    N.$('[data-c]', m.el).addEventListener('click', m.close);
    q('#af').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = q('#n').value.trim();
      const uname = q('#u').value.trim();
      const pw = q('#p').value;
      const pw2 = q('#p2').value;
      if (pw !== pw2) { q('#me').innerHTML = '<div class="err">Password tidak sama.</div>'; return; }
      const r = await N.auth.register(name, uname, pw, 'guru');
      if (r.error) { q('#me').innerHTML = `<div class="err">${N.esc(r.error)}</div>`; return; }
      m.close(); N.toast('Akun guru/admin baru ditambahkan.'); draw();
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
    N.$$('.tab', rootEl).forEach((t) => t.classList.toggle('on', t.dataset.tab === tab));
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
  }

  N.views.admin = {
    render() {
      return `<h2>🧑‍🏫 Dashboard Guru</h2><div class="tabs" role="tablist">${TABS.map(([k, l]) => `<button class="tab" role="tab" data-tab="${k}">${l}</button>`).join('')}</div><div id="apanel"></div>`;
    },
    mount(root) {
      rootEl = root;
      N.$$('.tab', root).forEach((t) => t.addEventListener('click', () => { tab = t.dataset.tab; draw(); }));
      draw();
    }
  };
})();
