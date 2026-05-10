/* HK Money Partners — interactions: modal + form submit + scroll reveal */
(function () {
  'use strict';

  /* ---------- Scroll reveal ---------- */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealSelectors = [
      '.section-head > *',
      '.pain-card',
      '.pillar',
      '.feature-card',
      '.ops-step',
      '.ops-tasks-col',
      '.ops-outcome',
      '.exp-card',
      '.founder-card',
      '.bridge-eyebrow',
      '.bridge-title',
      '.bridge-sub',
      '.client-foot',
      '.dashboard-hero',
      '.callout',
      '.hero-copy h1',
      '.hero-copy .lead',
      '.hero-cta',
      '.cta-final h2',
      '.cta-final .section-sub',
      '.cta-final-actions',
      '.founders-intro > *',
    ];

    const elements = Array.from(document.querySelectorAll(revealSelectors.join(',')));

    // Group by parent for sibling-based stagger
    const groups = new Map();
    elements.forEach(el => {
      const key = el.parentElement;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(el);
    });

    elements.forEach(el => el.classList.add('reveal'));

    groups.forEach(siblings => {
      siblings.forEach((el, i) => {
        const delay = Math.min(i * 90, 540);
        el.style.transitionDelay = delay + 'ms';
      });
    });

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    elements.forEach(el => io.observe(el));

    // Safety net: reveal anything already in viewport once layout settles.
    // Covers cases where IntersectionObserver is paused (tab opened in background)
    // or where the initial firing misses fully-visible elements.
    function revealInViewport() {
      const vh = window.innerHeight;
      elements.forEach(el => {
        if (el.classList.contains('is-revealed')) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.95 && rect.bottom > 0) {
          el.classList.add('is-revealed');
          io.unobserve(el);
        }
      });
    }
    requestAnimationFrame(() => requestAnimationFrame(revealInViewport));
    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => requestAnimationFrame(revealInViewport));
    }
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) revealInViewport();
    });
  }


  const modal = document.getElementById('contactModal');
  const openers = document.querySelectorAll('[data-open-modal]');
  const closers = document.querySelectorAll('[data-close-modal]');
  const form = modal && modal.querySelector('form');
  const successPanel = modal && modal.querySelector('.form-success');

  function openModal() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const firstField = modal.querySelector('input, select');
    if (firstField) setTimeout(() => firstField.focus(), 50);
  }
  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openers.forEach(b => b.addEventListener('click', openModal));
  closers.forEach(b => b.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const action = form.getAttribute('action') || '/';
      const data = new FormData(form);
      try {
        await fetch(action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: data
        });
      } catch (_) {
        // Network error — still show success so the user isn't blocked locally.
      }
      form.hidden = true;
      successPanel.hidden = false;
      setTimeout(closeModal, 2200);
      setTimeout(() => {
        form.reset();
        form.hidden = false;
        successPanel.hidden = true;
      }, 2600);
    });
  }
})();
