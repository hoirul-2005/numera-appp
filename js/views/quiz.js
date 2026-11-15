/* NUMERA – Kuis: Ayo Berlatih & Evaluasi (dilindungi login) */
(function () {
  'use strict';
  const N = window.NUMERA;

  const CFG = {
    latihan: { title: '🎯 Ayo Berlatih', label: 'Latihan', intro: 'Jawab soal latihan dan lihat langsung benar atau salahnya. Tidak perlu takut salah, ayo coba lagi!', count: 10 },
    evaluasi: { title: '🏆 Evaluasi', label: 'Evaluasi', intro: `Kerjakan ${N.EVAL_COUNT} soal pilihan ganda. Nilai = (Benar ÷ ${N.EVAL_COUNT}) × 100. Nilai tuntas minimal ${N.KKM}.`, count: N.EVAL_COUNT }
  };

  function build(kind) {
    const bank = N.db.get('questions', []).filter((q) => q.kind === kind);
    return N.shuffle(bank).slice(0, CFG[kind].count).map((q) => {
      const essay = q.type === 'essay' || !Array.isArray(q.options) || !q.options.length;
      if (essay) return { q: q.q, explain: q.explain, pizza: q.pizza, type: 'essay', answer: String(q.answer ?? '').trim(), game: q.game || 'Pizza' };
      const opts = N.shuffle(q.options.map((t, i) => ({ t, ok: i === q.answer })));
      return { q: q.q, opts, explain: q.explain, pizza: q.pizza, type: 'multiple', answer: q.answer, game: q.game || 'Pizza' };
    });
  }

  function essayNorm(v) {
    return String(v ?? '').toLowerCase().replace(/\s+/g, '').replace(/[.,!?;:]+$/g, '').replace(/½/g, '1/2').replace(/¼/g, '1/4').replace(/¾/g, '3/4').replace(/\s*\/\s*/g, '/');
  }

  function essayOk(input, answer) {
    const a = essayNorm(answer), b = essayNorm(input);
    if (!a || !b) return false;
    if (a === b) return true;
    return a.includes(b) || b.includes(a);
  }

  function view(kind) {
    const cfg = CFG[kind];
    return {
      render() {
        const u = N.auth.current();
        const last = u && u.role === 'siswa' ? N.db.get('history', []).filter((h) => h.userId === u.id && h.type === cfg.label)[0] : null;
        const n = N.db.get('questions', []).filter((q) => q.kind === kind).length;
        return `<h2>${cfg.title}</h2><div class="card qcard center" id="qbox">
          <div style="font-size:4rem">${kind === 'latihan' ? '🎯' : '🏆'}</div><p style="font-size:1.25rem">${cfg.intro}</p>
          ${u && u.role === 'guru' ? '<div class="info">Anda masuk sebagai guru: ini mode pratinjau, hasil tidak disimpan.</div>' : ''}
          ${last ? `<p class="muted">Terakhir: nilai <b>${last.score}</b> (${N.esc(last.status)}) · ${N.fmtDate(last.t)}</p>` : ''}
          ${n ? `<button class="btn btn-y btn-big" id="go">▶️ Mulai</button>` : '<div class="err">Bank soal masih kosong. Hubungi guru.</div>'}
        </div>`;
      },
      mount(root) {
        const box = N.$('#qbox', root), go = N.$('#go', root);
        if (go) go.addEventListener('click', () => run(box, kind));
      }
    };
  }

  function run(box, kind) {
    const cfg = CFG[kind], qs = build(kind), user = N.auth.current();
    let i = 0, right = 0, locked = false;
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

    function show() {
      const q = qs[i]; locked = false;
      const gameTag = `<span class="pill" style="margin-left:auto">🎮 ${N.esc(q.game || 'Pizza')}</span>`;
      box.className = 'card qcard';
      box.innerHTML = `<div class="row between"><b>Soal ${i + 1} dari ${qs.length}</b><div class="row">${gameTag}<span class="pill">✅ Benar: ${right}</span></div></div>
        <div class="prog"><i style="width:${(i / qs.length) * 100}%"></i></div>
        ${q.pizza ? `<div class="center">${N.pizza(q.pizza[0], q.pizza[1], 110)}</div>` : ''}
        <div class="qtext">${N.esc(q.q)}</div>
        ${q.type === 'essay' ? `<div class="essay-box"><label for="essay-answer">Jawaban essay</label><textarea id="essay-answer" rows="4" placeholder="Tulis jawabanmu di sini..."></textarea></div>` : `<div class="opts">${q.opts.map((o, k) => `<button class="btn opt" data-k="${k}"><span class="k">${letters[k]}</span> ${N.esc(o.t)}</button>`).join('')}</div>`}
        <div id="fb" aria-live="polite"></div><div class="row end" style="margin-top:14px">${q.type === 'essay' ? '<button class="btn btn-y" id="check-essay">✅ Cek Jawaban</button>' : ''}<button class="btn btn-y hidden" id="nx">${i === qs.length - 1 ? 'Lihat Hasil 🏁' : 'Soal berikutnya ➡️'}</button></div>`;
      if (q.type === 'essay') {
        N.$('#check-essay', box).addEventListener('click', () => answerEssay(q));
      } else {
        N.$$('.opt', box).forEach((b) => b.addEventListener('click', () => answer(b, q)));
      }
      N.$('#nx', box).addEventListener('click', () => {
        if (q.type === 'essay' && !locked) return;
        N.sfx.click(); if (++i < qs.length) show(); else finish();
      });
    }

    function answer(btn, q) {
      if (locked) return; locked = true;
      const o = q.opts[+btn.dataset.k], fb = N.$('#fb', box);
      N.$$('.opt', box).forEach((b) => { b.disabled = true; if (q.opts[+b.dataset.k].ok) b.classList.add('right'); });
      if (o.ok) { right++; N.sfx.ok(); N.confetti(70); fb.innerHTML = `<div class="fb ok">🎉 Benar! Hebat sekali! ${N.esc(q.explain || '')}</div>`; }
      else { btn.classList.add('wrong'); N.sfx.bad(); fb.innerHTML = `<div class="fb no">😅 Belum tepat, semangat! ${N.esc(q.explain || '')}</div>`; }
      N.$('#nx', box).classList.remove('hidden'); N.$('#nx', box).focus();
    }

    function answerEssay(q) {
      if (locked) return;
      const answerField = N.$('#essay-answer', box), fb = N.$('#fb', box);
      const val = answerField.value.trim();
      if (!val) { fb.innerHTML = '<div class="fb no">Tulis jawabanmu dulu ya ✍️</div>'; return; }
      const ok = essayOk(val, q.answer);
      locked = true;
      if (ok) { right++; N.sfx.ok(); N.confetti(70); fb.innerHTML = `<div class="fb ok">🎉 Jawaban benar! ${N.esc(q.explain || '')}</div>`; }
      else { N.sfx.bad(); fb.innerHTML = `<div class="fb no">💡 Jawaban belum tepat. ${N.esc(q.explain || '')}</div>`; }
      N.$('#nx', box).classList.remove('hidden'); N.$('#nx', box).focus();
    }

    function finish() {
      const total = qs.length, score = Math.round((right / total) * 100), pass = score >= N.KKM;
      if (user && user.role === 'siswa') {
        const h = N.db.get('history', []);
        h.unshift({ id: N.uid(), userId: user.id, username: user.username, name: user.name, type: cfg.label, correct: right, total, score, status: pass ? 'Tuntas' : 'Belum Tuntas', t: Date.now() });
        N.db.set('history', h);
      }
      pass ? (N.sfx.win(), N.confetti(220)) : N.sfx.click();
      box.className = 'card qcard center';
      box.innerHTML = `<div style="font-size:4rem">${pass ? '🏆' : '💪'}</div><h2>${pass ? 'Luar biasa!' : 'Ayo coba lagi!'}</h2>
        <div class="score" style="color:${pass ? '#2f9e44' : '#e57d00'}">${score}</div>
        <p style="font-size:1.25rem">Benar <b>${right}</b> dari <b>${total}</b> soal · <span class="pill ${pass ? 'ok' : 'no'}">${pass ? 'Tuntas' : 'Belum Tuntas'}</span></p>
        <p class="muted">Nilai = (${right} ÷ ${total}) × 100</p>
        ${user && user.role === 'siswa' ? '<p class="muted">✅ Hasil tersimpan di Riwayat.</p>' : '<p class="muted">Mode pratinjau guru: hasil tidak disimpan.</p>'}
        <div class="row" style="justify-content:center"><button class="btn btn-y" id="again">🔁 Ulangi</button>${user && user.role === 'siswa' ? '<a class="btn btn-b" href="#/riwayat">📜 Lihat Riwayat</a>' : ''}<a class="btn" href="#/materi">📘 Belajar Lagi</a></div>`;
      N.$('#again', box).addEventListener('click', () => run(box, kind));
    }

    if (!qs.length) { box.innerHTML = '<div class="err">Belum ada soal.</div>'; return; }
    show();
  }

  N.views.latihan = view('latihan');
  N.views.evaluasi = view('evaluasi');
})();
