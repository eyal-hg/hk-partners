/* HK Money Partners — interactions: modal + form submit */
(function () {
  'use strict';

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
      const data = new FormData(form);
      const body = new URLSearchParams();
      data.forEach((v, k) => body.append(k, v));
      try {
        await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString()
        });
      } catch (_) {
        // Even if local/no-Netlify, show success — Netlify intercepts on production.
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
