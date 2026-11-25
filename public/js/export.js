/* NUMERA – ekspor data: CSV, Excel (.xls berbasis tabel HTML), PDF sederhana (via cetak) */
(function () {
  'use strict';
  const N = window.NUMERA;

  const download = (name, blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  // cegah CSV/formula injection
  const safe = (v) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return s; };
  const stamp = () => new Date().toISOString().slice(0, 10);

  N.exp = {
    csv(name, rows) {
      const body = rows.map((r) => r.map((c) => '"' + safe(c).replace(/"/g, '""') + '"').join(',')).join('\r\n');
      download(`${name}-${stamp()}.csv`, new Blob(['﻿' + body], { type: 'text/csv;charset=utf-8' }));
    },
    xls(name, rows) {
      const t = '<table border="1">' + rows.map((r, i) => '<tr>' + r.map((c) => `<${i ? 'td' : 'th'}>${N.esc(safe(c))}</${i ? 'td' : 'th'}>`).join('') + '</tr>').join('') + '</table>';
      const html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body>${t}</body></html>`;
      download(`${name}-${stamp()}.xls`, new Blob(['﻿' + html], { type: 'application/vnd.ms-excel' }));
    },
    pdf(title, rows) {
      const w = window.open('', '_blank');
      if (!w) { N.toast('Izinkan pop-up agar jendela cetak/PDF dapat dibuka.', 'bad'); return; }
      const t = '<table>' + rows.map((r, i) => '<tr>' + r.map((c) => `<${i ? 'td' : 'th'}>${N.esc(c)}</${i ? 'td' : 'th'}>`).join('') + '</tr>').join('') + '</table>';
      w.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${N.esc(title)}</title><style>body{font-family:Arial,sans-serif;padding:24px}h1{font-size:20px}table{border-collapse:collapse;width:100%;font-size:13px}th,td{border:1px solid #888;padding:6px 8px;text-align:left}th{background:#ffe27a}p{color:#555;font-size:12px}</style></head><body><h1>${N.esc(title)}</h1><p>Dicetak: ${N.esc(N.fmtDate(Date.now()))} — pilih "Simpan sebagai PDF" pada jendela cetak.</p>${t}<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>`);
      w.document.close();
    },
    /* Tombol ekspor: HTML + pengikat. getRows() -> array 2D (baris pertama = header) */
    buttons() {
      return `<div class="row"><button class="btn btn-sm btn-g" data-export="csv">⬇️ CSV</button><button class="btn btn-sm btn-b" data-export="xls">📗 Excel</button><button class="btn btn-sm btn-o" data-export="pdf">📄 PDF</button></div>`;
    },
    bind(root, name, title, getRows) {
      N.$$('[data-export]', root).forEach((b) => b.addEventListener('click', () => {
        const rows = getRows(); const fmt = b.dataset.export;
        if (rows.length < 2) { N.toast('Belum ada data untuk diekspor.', 'bad'); return; }
        if (fmt === 'pdf') N.exp.pdf(title, rows); else N.exp[fmt](name, rows);
        N.audit('ekspor_' + fmt, name);
      }));
    }
  };
})();
