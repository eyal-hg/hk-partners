/* HK ליועצים — scroll progress, hero rotator, scroll reveal, modal + form */
(function () {
  'use strict';

  /* ---------- Scroll progress bar ---------- */
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

  /* ---------- Scroll reveal ---------- */
  var reduceMotionQ = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotionQ && 'IntersectionObserver' in window) {
    var selectors = [
      '.value-head > *',
      '.world-card',
      '.val-row',
      '.strip-line', '.strip-sub', '.strip .btn',
      '.founders .value-head > *',
      '.founder-card',
      '.cta-final .section-title', '.cta-sub', '.cta-final .btn'
    ];
    var elements = Array.prototype.slice.call(
      document.querySelectorAll(selectors.join(','))
    );

    var groups = new Map();
    elements.forEach(function (el) {
      var key = el.parentElement;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(el);
    });
    elements.forEach(function (el) { el.classList.add('reveal'); });
    groups.forEach(function (siblings) {
      if (siblings.length > 1) {
        siblings.forEach(function (el, i) {
          el.style.transitionDelay = Math.min(i * 90, 450) + 'ms';
        });
      }
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    elements.forEach(function (el) { io.observe(el); });

    // Reveal anything already in view (handles load position + anchors)
    function revealInViewport() {
      var vh = window.innerHeight;
      elements.forEach(function (el) {
        if (el.classList.contains('is-revealed')) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.95 && r.bottom > 0) {
          el.classList.add('is-revealed');
          io.unobserve(el);
        }
      });
    }
    requestAnimationFrame(function () { requestAnimationFrame(revealInViewport); });
    window.addEventListener('load', function () { requestAnimationFrame(revealInViewport); });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) revealInViewport();
    });
  }

  /* ---------- Hero rotating line ---------- */
  var rot = document.getElementById('rotWord');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (rot && !reduceMotion) {
    var phrases = [
      'מנהלים את התזרים.',
      'כותבים את ההכנה.',
      'מסכמים את הפגישה.',
      'עונים ללקוח ב-23:00.',
      'זוכרים כל מילה.',
      'עושים את כל השאר.'
    ];
    var i = phrases.length - 1;
    setInterval(function () {
      rot.classList.add('rot-out');
      setTimeout(function () {
        i = (i + 1) % phrases.length;
        rot.textContent = phrases[i];
        rot.classList.remove('rot-out');
      }, 290);
    }, 2400);
  }

  var modal = document.getElementById('contactModal');
  var openers = document.querySelectorAll('[data-open-modal]');
  var closers = document.querySelectorAll('[data-close-modal]');
  var form = modal && modal.querySelector('form');
  var successPanel = modal && modal.querySelector('.form-success');

  function openModal() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var firstField = modal.querySelector('input:not([name="_honey"]), select');
    if (firstField) setTimeout(function () { firstField.focus(); }, 50);
  }
  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openers.forEach(function (b) { b.addEventListener('click', openModal); });
  closers.forEach(function (b) { b.addEventListener('click', closeModal); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var action = form.getAttribute('action') || '/';
      var data = new FormData(form);
      fetch(action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data
      }).catch(function () { /* show success anyway */ });
      form.hidden = true;
      successPanel.hidden = false;
      setTimeout(closeModal, 2200);
      setTimeout(function () {
        form.reset();
        form.hidden = false;
        successPanel.hidden = true;
      }, 2600);
    });
  }
})();
