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
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      fetch(form.getAttribute('action'), {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      }).catch(function () { /* מציגים אישור בכל מקרה */ });

      form.hidden = true;
      successPanel.hidden = false;
      setTimeout(closeModal, 2400);
      setTimeout(function () {
        form.reset();
        form.hidden = false;
        successPanel.hidden = true;
      }, 2800);
    });
  }
})();
