/* HK ליועצים — סרגל גלילה, הופעה בגלילה, לייטבוקס, מודל וטופס */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- סרגל התקדמות ---------- */
  var bar = document.getElementById('scrollBar');
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
      '.sec-label, .sec-title, .sub-title, .prose, .lead-in, .pain-card, .pull, ' +
      '.table-wrap, .assumption, .money-col, .money-note, .caveat, ' +
      '.pillar-num, .pillar-title, .points, .shot, .uni-title, .quote, ' +
      '.obj, .founder-card, .faq details, .cta-note, .hero-cta'
    ));
    els.forEach(function (el) { el.classList.add('reveal'); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-revealed'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });

    // כל מה שכבר בתוך המסך — לחשוף מיד
    var revealVisible = function () {
      var vh = window.innerHeight;
      els.forEach(function (el) {
        if (el.classList.contains('is-revealed')) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.95 && r.bottom > 0) { el.classList.add('is-revealed'); io.unobserve(el); }
      });
    };
    requestAnimationFrame(function () { requestAnimationFrame(revealVisible); });
    window.addEventListener('load', revealVisible);
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
    document.querySelectorAll('.shot img').forEach(function (img) {
      img.addEventListener('click', function () {
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt;
        lb.classList.add('is-open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
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
