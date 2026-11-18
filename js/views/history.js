/* NUMERA – Riwayat Kuis (siswa: milik sendiri; guru: semua) + hapus + ekspor */
(function () {
  'use strict';
  const N = window.NUMERA;

  N.hist = {
    forUser(u) {
      const all = N.db.get('history', []);
      if (!u) return all.filter((h) => h.userId === 'guest');
      return N.isAdminRole(u.role) ? all : all.filter((h) => h.userId === u.id);
    },
    remove(id, u) {
      const all = N.db.get('history', []), h = all.find((x) => N.sameId(x.id, id));
      if (!h || (u ? (!N.isAdminRole(u.role) && h.userId !== u.id) : h.userId !== 'guest')) return false; // pengguna tanpa login hanya boleh menghapus riwayat di perangkat ini
      N.db.set('history', all.filter((x) => !N.sameId(x.id, id)));
      N.audit('hapus_riwayat', `${h.username} ${h.type} ${h.score}`);
      return true;
    },
    rows(list, withName) {
      return [['Tanggal', ...(withName ? ['Nama', 'Username'] : []), 'Jenis', 'Benar', 'Total', 'Nilai', 'Status']]
        .concat(list.map((h) => [N.fmtDate(h.t), ...(withName ? [h.name, h.username] : []), h.type, h.correct, h.total, h.score, h.status]));
    },
    table(list, withName, canDelete = true) {
      if (!list.length) return '<div class="card center"><div style="font-size:3rem">📭</div><p>Belum ada riwayat kuis.</p></div>';
      return `<div class="tw"><table><thead><tr><th>Tanggal</th>${withName ? '<th>Nama</th>' : ''}<th>Jenis</th><th>Benar</th><th>Nilai</th><th>Status</th>${canDelete ? '<th>Aksi</th>' : ''}</tr></thead><tbody>
        ${list.map((h) => `<tr><td>${N.fmtDate(h.t)}</td>${withName ? `<td>${N.esc(h.name)} <span class="muted">(${N.esc(h.username)})</span></td>` : ''}<td>${N.esc(h.type)}</td><td>${h.correct}/${h.total}</td><td><b>${h.score}</b></td><td><span class="pill ${h.status === 'Tuntas' ? 'ok' : 'no'}">${N.esc(h.status)}</span></td>${canDelete ? `<td><button type="button" class="btn btn-sm btn-r" data-del="${h.id}" aria-label="Hapus riwayat">🗑️ Hapus</button></td>` : ''}</tr>`).join('')}
        </tbody></table></div>`;
    },
    /* pasang tombol hapus; refresh() dipanggil setelah berhasil */
    bindDelete(root, refresh) {
      N.$$('[data-del]', root).forEach((b) => b.addEventListener('click', async () => {
        if (!(await N.confirm('Hapus riwayat kuis ini? Tindakan tidak bisa dibatalkan.'))) return;
        if (N.hist.remove(b.dataset.del, N.auth.current())) { N.toast('Riwayat dihapus.'); refresh(); } else N.toast('Tidak diizinkan.', 'bad');
      }));
    }
  };

  N.views.riwayat = {
    render() {
      const u = N.auth.current(), list = N.hist.forUser(u), guru = !!u && N.isAdminRole(u.role);
      const best = list.length ? Math.max(...list.map((h) => h.score)) : '-';
      return `<h2>📜 Riwayat Kuis ${guru ? '(Semua Siswa)' : ''}</h2>
        <div class="row between" style="margin-bottom:14px"><div class="row"><span class="pill">Percobaan: ${list.length}</span><span class="pill ok">Nilai tertinggi: ${best}</span></div>${N.exp.buttons()}</div>
        ${N.hist.table(list, guru)}`;
    },
    mount(root) {
      const u = N.auth.current(), guru = !!u && N.isAdminRole(u.role);
      N.exp.bind(root, 'riwayat-kuis', 'Riwayat Kuis NUMERA', () => N.hist.rows(N.hist.forUser(u), guru));
      N.hist.bindDelete(root, () => N.render());
    }
  };
})();
