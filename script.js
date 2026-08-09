/* HK ליועצים — interactions: scroll reveal, day clock, modal + form */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll reveal ---------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealSelectors = [
      '.hero-eyebrow', '.hero-title', '.hero-lead', '.hero-cta', '.hero-stage',
      '.day-head > *',
      '.day-step',
      '.memory-inner > *',
      '.mem-card',
      '.more-head > *',
      '.more-card',
      '.client-head > *',
      '.client-card',
      '.client-foot',
      '.ops-txt > *',
      '.ops-stat',
      '.founders-intro > *',
      '.founder-card',
      '.cta-title', '.cta-sub', '.cta-final .btn'
    ];

    var elements = Array.prototype.slice.call(
      document.querySelectorAll(revealSelectors.join(','))
    );

    var groups = new Map();
    elements.forEach(function (el) {
      var key = el.parentElement;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(el);
    });

    elements.forEach(function (el) { el.classList.add('reveal'); });

    groups.forEach(function (siblings) {
      siblings.forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i * 80, 480) + 'ms';
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    elements.forEach(function (el) { io.observe(el); });

    // Safety net: reveal what's already visible (background-tab load etc.)
    function revealInViewport() {
      var vh = window.innerHeight;
      elements.forEach(function (el) {
        if (el.classList.contains('is-revealed')) return;
        var rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.95 && rect.bottom > 0) {
          el.classList.add('is-revealed');
          io.unobserve(el);
        }
      });
    }
    requestAnimationFrame(function () { requestAnimationFrame(revealInViewport); });
    if (document.readyState !== 'complete') {
      window.addEventListener('load', function () { requestAnimationFrame(revealInViewport); });
    }
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) revealInViewport();
    });
  }

  /* ---------- Day clock (sticky, updates per step) ---------- */
  var clock = document.getElementById('dayClock');
  var steps = document.querySelectorAll('.day-step[data-time]');
  if (clock && steps.length && 'IntersectionObserver' in window) {
    var clockIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var t = entry.target.getAttribute('data-time');
          if (t && clock.textContent !== t) {
            clock.textContent = t;
            if (!reduceMotion) {
              clock.animate(
                [{ transform: 'scale(1.12)' }, { transform: 'scale(1)' }],
                { duration: 260, easing: 'ease-out' }
              );
            }
          }
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
    steps.forEach(function (s) { clockIO.observe(s); });
  }

  /* ---------- Modal ---------- */
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
      }).catch(function () { /* show success anyway; production posts via FormSubmit */ });
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
