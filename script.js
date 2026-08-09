/* HK ליועצים — modal + form */
(function () {
  'use strict';

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
