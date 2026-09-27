/* HK ליועצים — סרגל גלילה, הופעה בגלילה, לייטבוקס, מודל וטופס */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- סרגל התקדמות ---------- */
  var bar = document.getElementById('scrollBar');
  if (bar && reduceMotion) { bar.remove(); bar = null; }
  if (bar) {
    var updateBar = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
      bar.style.width = (pct * 100).toFixed(2) + '%';
    };
    window.addEventListener('scroll', updateBar, { passive: true });
    window.addEventListener('resize', updateBar);
    updateBar();
  }

  /* ---------- הופעה עדינה בגלילה ---------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var els = Array.prototype.slice.call(document.querySelectorAll(
      '.sec-title, .prose, .three p, .three-note, .ba-col, .chips, .mem-card, ' +
      '.table-wrap, .caveat-line, .shot, .gal-item, .gal-head > *, .three p, .three-note, ' +
      '.st-copy, .st-shots, .calc, .calc-note, .cli-item, .flip-item, ' +
      '.ofir-photo, .ofir-copy'
    ));
    els.forEach(function (el) { el.classList.add('reveal'); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-revealed'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
    els.forEach(function (el) { io.observe(el); });

    // כל מה שכבר בתוך המסך — לחשוף מיד
    var revealVisible = function () {
      var vh = window.innerHeight;
      els.forEach(function (el) {
        if (el.classList.contains('is-revealed')) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 1.05 && r.bottom > -50) { el.classList.add('is-revealed'); io.unobserve(el); }
      });
    };
    requestAnimationFrame(function () { requestAnimationFrame(revealVisible); });
    window.addEventListener('load', revealVisible);
    window.addEventListener('scroll', revealVisible, { passive: true });
    // רשת ביטחון: תוכן לעולם לא נשאר בלתי נראה בגלל אנימציה שלא רצה
    setTimeout(function () {
      els.forEach(function (el) { el.classList.add('is-revealed'); });
      io.disconnect();
    }, 4000);
  }

  /* ---------- הדיאגרמה: הקווים נמשכים פעם אחת ---------- */
  var diagram = document.getElementById('memDiagram');
  if (diagram) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      diagram.classList.add('is-drawn');
    } else {
      var dio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { diagram.classList.add('is-drawn'); dio.disconnect(); }
        });
      }, { threshold: 0.3 });
      dio.observe(diagram);
    }
  }

  /* ---------- 10 → 25, ספירה אחת, בלי תזוזת פריסה ---------- */
  var counter = document.getElementById('countTo');
  if (counter) {
    var to = parseInt(counter.dataset.to, 10);
    var from = parseInt(counter.dataset.from, 10);
    if (reduceMotion || !('IntersectionObserver' in window)) {
      counter.textContent = to;
    } else {
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          cio.disconnect();
          var t0 = null, dur = 700;
          var step = function (t) {
            if (t0 === null) t0 = t;
            var p = Math.min((t - t0) / dur, 1);
            counter.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(step);
          };
          counter.textContent = from;
          requestAnimationFrame(step);
          // גיבוי: אם rAF נחנק (טאב ברקע), המספר עדיין נסגר על היעד
          setTimeout(function () { counter.textContent = to; }, dur + 120);
        });
      }, { threshold: 0.6 });
      cio.observe(counter);
    }
  }

  /* ---------- ציר הזמן (גרסה B) ---------- */
  var month = document.getElementById('month');
  if (month) {
    var stations = Array.prototype.slice.call(month.querySelectorAll('.station'));
    var updateRail = function () {
      var r = month.getBoundingClientRect();
      var mid = window.innerHeight * 0.5;
      var pct = Math.max(0, Math.min(1, (mid - r.top) / r.height));
      month.style.setProperty('--rail-progress', (pct * 100).toFixed(1) + '%');
      stations.forEach(function (st) {
        var b = st.getBoundingClientRect();
        st.classList.toggle('is-on', b.top < mid && b.bottom > mid * 0.4);
      });
    };
    if (reduceMotion) {
      month.style.setProperty('--rail-progress', '100%');
      stations.forEach(function (st) { st.classList.add('is-on'); });
    } else {
      window.addEventListener('scroll', updateRail, { passive: true });
      window.addEventListener('resize', updateRail);
      updateRail();
    }
  }

  /* ---------- המחשבון (גרסה 3) ---------- */
  var cClients = document.getElementById('cClients');
  if (cClients) {
    var cFee = document.getElementById('cFee');
    // שתי השורות נמדדות על אותו בסיס — פר לקוח — כדי שהחשבון ייצא זהה גם למי שבודק
    var OPS_NOW = 8.5,  OPS_HK = 1.25;   // תפעול בלבד, בלי הפגישה
    var TOT_NOW = 10,   TOT_HK = 3;      // סה״כ, כולל הפגישה החודשית וההכנה
    var BUDGET  = 80;                    // שעות בחודש שיועץ מקדיש לעבודת לקוחות
    var f = function (n) { return Math.round(n).toLocaleString('he-IL'); };
    var money = function (n) { return f(n) + '<i class="cur">₪</i>'; };

    var run = function () {
      var n = +cClients.value, fee = +cFee.value;
      var capNow = Math.floor(BUDGET / TOT_NOW);   // 8
      var capHk  = Math.floor(BUDGET / TOT_HK);    // 26
      var revNow = n * fee * 12;
      var revHk  = capHk * fee * 12;

      document.getElementById('oClients').textContent = n;
      document.getElementById('oFee').innerHTML = money(fee);
      document.getElementById('rOpsNow').textContent = OPS_NOW;
      document.getElementById('rOpsHk').textContent  = OPS_HK;
      document.getElementById('rTotNow').textContent = TOT_NOW;
      document.getElementById('rTotHk').textContent  = TOT_HK;
      document.getElementById('rCapNow').textContent = capNow;
      document.getElementById('rCapHk').textContent  = capHk;
      // כל תא אומר על מה הוא מבוסס — אין ערבוב בין מספר שהוזן לבין תקרה מחושבת
      // כל תא מציג את החישוב המלא שלו — אין מה לפרש לא נכון
      document.getElementById('rRevNow').innerHTML =
        money(revNow) + '<span class="cell-note">' + n + ' לקוחות × ' + f(fee) + ' × 12</span>';
      // מי שכבר מעל התקרה לא מרוויח עוד לקוחות — הוא מרוויח שעות.
      // הצגת 780,000 מול ההכנסה האמיתית שלו הייתה אומרת לו שעם HK ירוויח פחות.
      if (n >= capHk) {
        document.getElementById('rRevHk').innerHTML =
          '<span class="same-rev">אותה הכנסה</span><span class="cell-note">הרווח כאן הוא שעות, לא לקוחות</span>';
      } else {
        document.getElementById('rRevHk').innerHTML =
          money(revHk) + '<span class="cell-note">' + capHk + ' לקוחות × ' + f(fee) + ' × 12</span>';
      }

      // אם הוא כבר מעל התקרה — זו האמת המעניינת יותר, ושווה לומר אותה
      var over = document.getElementById('overCap');
      if (over) {
        if (n > capNow) {
          over.innerHTML = 'שים לב — יש לך <b>' + n + '</b> לקוחות ו-80 שעות מכסות <b>' +
            capNow + '</b>. את ההפרש אתה כבר משלים מהזמן הפרטי שלך.';
          over.hidden = false;
        } else { over.hidden = true; }
      }

      var state = document.getElementById('calcState');
      var lbl = document.getElementById('deltaLbl'), num = document.getElementById('deltaNum');

      if (n >= capHk) {
        lbl.textContent = 'שעות שחוזרות אליך בחודש';
        num.innerHTML = f(n * (OPS_NOW - OPS_HK));
        state.textContent = 'בנפח הזה השאלה כבר לא כמה לקוחות אלא כמה זמן. בוא נדבר.';
        state.hidden = false;
      } else if (n >= 20) {
        lbl.textContent = 'שעות שחוזרות אליך בחודש';
        num.innerHTML = f(n * (OPS_NOW - OPS_HK));
        state.textContent = 'אתה כבר מעל התקרה שרוב היועצים מגיעים אליה — כנראה על חשבון שעות, לא במקומן. מה ש-HK מחזירה לך זה את השעות.';
        state.hidden = false;
      } else {
        lbl.textContent = 'ההפרש השנתי';
        num.innerHTML = money(Math.max(0, revHk - revNow));
        state.hidden = true;
      }
    };
    [cClients, cFee].forEach(function (el) { el.addEventListener('input', run); });
    run();   // מחושב כבר בטעינה
  }

  /* ---------- לייטבוקס לצילומי המסך ---------- */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img');
    var closeLb = function () {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lbImg.src = '';
    };
    var openLb = function (img) {
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    document.querySelectorAll('.shot img, .hero-shot img, .gal-item img').forEach(function (img) {
      img.addEventListener('click', function () { openLb(img); });
    });
    // הקישור "להגדלה" פותח את אותו לייטבוקס
    document.querySelectorAll('.zoom-link').forEach(function (b) {
      b.addEventListener('click', function () {
        var img = b.closest('figure') && b.closest('figure').querySelector('img');
        if (img) openLb(img);
      });
    });
    lb.addEventListener('click', closeLb);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lb.classList.contains('is-open')) closeLb();
    });
  }

  /* ---------- מודל יצירת קשר ---------- */
  var modal = document.getElementById('contactModal');
  if (!modal) return;

  var form = modal.querySelector('form');
  var successPanel = modal.querySelector('.form-success');
  var ctaSource = document.getElementById('ctaSource');
  var lastFocused = null;

  function openModal(trigger) {
    lastFocused = trigger || null;
    if (ctaSource && trigger) ctaSource.value = trigger.getAttribute('data-cta') || '';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var first = modal.querySelector('input:not([name="_honey"]):not([type="hidden"])');
    if (first) setTimeout(function () { first.focus(); }, 60);
  }
  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('[data-open-modal]').forEach(function (b) {
    b.addEventListener('click', function () { openModal(b); });
  });
  document.querySelectorAll('[data-close-modal]').forEach(function (b) {
    b.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  if (form) {
    var errorPanel = document.getElementById('leadError');
    var submitBtn = form.querySelector('button[type="submit"], .btn');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submitBtn) { submitBtn.disabled = true; submitBtn.dataset.label = submitBtn.textContent; submitBtn.textContent = 'שולח…'; }
      if (errorPanel) errorPanel.hidden = true;
      var done = function (ok) {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset.label; }
        if (!ok) { if (errorPanel) errorPanel.hidden = false; return; }   // הטופס נשאר מלא — אפשר לנסות שוב או לעבור לוואטסאפ
        if (window.gtag) gtag('event', 'generate_lead', { source: (document.getElementById('ctaSource') || {}).value || '' });
        form.hidden = true;
        successPanel.hidden = false;
        setTimeout(closeModal, 2400);
        setTimeout(function () { form.reset(); form.hidden = false; successPanel.hidden = true; }, 2800);
      };
      // אותם שני מסלולים כמו hak.co.il: השרת של HK (מסך הלידים) + ה-CRM. המייל דרך FormSubmit הוא גיבוי.
      var fd = new FormData(form);
      var name = (fd.get('שם מלא') || '').trim(), phone = (fd.get('טלפון') || '').trim(), email = (fd.get('אימייל') || '').trim();
      var clients = fd.get('מספר לקוחות') || '', cta = fd.get('מקור הפנייה') || '';
      var lead = { name: name, phone: phone, stageKey: 'new',
        source: { channel: 'אתר HK Studio', form: 'שלושים דקות עם אופיר' + (cta ? ' · ' + cta : '') } };
      if (email) lead.email = email;
      if (clients) lead.notes = 'מספר לקוחות פעילים: ' + clients;
      var parts = name.split(' ');
      var crm = { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '', full_name: name, phone: phone, email: email,
        business_name: '', source: 'HK Studio Landing Page', form_id: 'studio', tags: ['hk-studio', 'landing-page'], clients: clients };
      fetch('https://services.leadconnectorhq.com/hooks/xb3rZ5Z4gIQCgKJUAPAe/webhook-trigger/59e35304-8c8d-4fe5-85ff-43d63f3e36ee',
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(crm) }).catch(function () {});
      fetch(form.getAttribute('data-formsubmit'), { method: 'POST', headers: { 'Accept': 'application/json' }, body: fd }).catch(function () {});
      // גיבוי במייל: טופס Netlify (נשמר ברשימת הטפסים של האתר ונשלח לכתובות שמוגדרות ב-Netlify)
      var nf = new URLSearchParams({ 'form-name': 'studio-lead', 'שם מלא': name, 'טלפון': phone, 'אימייל': email, 'מספר לקוחות': clients, 'מקור הפנייה': cta });
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: nf.toString() }).catch(function () {});
      fetch('https://hk-prod-462507.oa.r.appspot.com/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) })
        .then(function (r) { return r.ok; })
        .then(done)
        .catch(function () { done(false); });
    });
  }
})();
