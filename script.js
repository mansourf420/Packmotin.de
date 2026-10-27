(function () {
  'use strict';

  // Sticky header background once the page scrolls
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile navigation
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  function setNav(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    toggle.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setNav(false); toggle.focus(); }
    });
  }

  // Reveal sections as they enter the viewport
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Contact form: validate, then open the visitor's mail client with a prepared message
  var form = document.getElementById('contact-form');
  var errorBox = document.getElementById('form-error');
  var RECIPIENT = 'info@packmotin.de';

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var invalid = [];
      ['name', 'email', 'message'].forEach(function (name) {
        var field = form.elements[name];
        var ok = field.value.trim() !== '' && (name !== 'email' || field.checkValidity());
        field.setAttribute('aria-invalid', String(!ok));
        if (!ok) invalid.push(field);
      });
      var consent = form.elements.consent;
      if (!consent.checked) invalid.push(consent);

      if (invalid.length) {
        errorBox.textContent = !consent.checked && invalid.length === 1
          ? 'Bitte stimmen Sie der Datenschutzerklärung zu.'
          : 'Bitte füllen Sie alle Pflichtfelder (*) korrekt aus.';
        errorBox.hidden = false;
        invalid[0].focus();
        return;
      }
      errorBox.hidden = true;

      var interests = Array.prototype.map.call(
        form.querySelectorAll('input[name="interest"]:checked'),
        function (el) { return el.value; }
      );
      var body = [
        'Name: ' + form.elements.name.value.trim(),
        'Firma: ' + (form.elements.company.value.trim() || '-'),
        'E-Mail: ' + form.elements.email.value.trim(),
        'Telefon: ' + (form.elements.phone.value.trim() || '-'),
        'Interesse: ' + (interests.join(', ') || '-'),
        '',
        form.elements.message.value.trim()
      ].join('\n');
      var subject = 'Anfrage über packmotin.de' + (form.elements.company.value.trim() ? ' – ' + form.elements.company.value.trim() : '');
      window.location.href = 'mailto:' + RECIPIENT + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });

    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true') e.target.removeAttribute('aria-invalid');
    });
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
