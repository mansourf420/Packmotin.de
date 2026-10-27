(function () {
  'use strict';

  var PHONE = '0177 7578761';
  var PHONE_LINK = 'tel:+491777578761';
  var EMAIL = 'info@packmotin.de';
  var INSTAGRAM = 'https://ig.me/m/packmotin.de';
  var MAILTO = 'mailto:' + 'info@packmotin.de' + '?subject=' + encodeURIComponent('Anfrage über packmotin.de');
  // Optional: URL of a backend that answers with a real AI model.
  // It receives { messages: [{ role, content }] } and must return { reply: "..." }.
  // Left empty, the assistant answers from the built-in knowledge below.
  var CHAT_ENDPOINT = '';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function store(kind) {
    try { return window[kind]; } catch (e) { return null; }
  }
  function load(kind, key) {
    try { var s = store(kind); return s ? JSON.parse(s.getItem(key)) : null; } catch (e) { return null; }
  }
  function save(kind, key, value) {
    try { var s = store(kind); if (s) s.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
  }

  // Sticky header background once the page scrolls
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile navigation (a checkbox drives it, so it also opens without JavaScript)
  var navCheck = document.getElementById('nav-check');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  function syncNav() {
    var open = navCheck.checked;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    toggle.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
  }
  function setNav(open) { navCheck.checked = open; syncNav(); }
  if (navCheck && toggle && nav) {
    navCheck.addEventListener('change', syncNav);
    toggle.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setNav(!navCheck.checked); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navCheck.checked) { setNav(false); toggle.focus(); }
    });
  }

  // In-page links: scroll by script so they also work in previews that block hash navigation
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href').slice(1);
    var target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    if (navCheck && navCheck.checked) setNav(false);
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    try { history.pushState(null, '', '#' + id); } catch (err) { /* sandboxed preview */ }
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

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
      window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });

    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true') e.target.removeAttribute('aria-invalid');
    });
  }

  // Cookie consent
  var CONSENT_KEY = 'packmotin-consent';
  var banner = document.getElementById('cookie');
  var options = document.getElementById('cookie-options');
  var optToggle = banner && banner.querySelector('[data-cookie="toggle"]');
  var saveBtn = banner && banner.querySelector('[data-cookie="save"]');

  function applyConsent(consent) {
    window.packmotinConsent = consent;
    document.dispatchEvent(new CustomEvent('packmotin:consent', { detail: consent }));
  }
  function showBanner(withOptions) {
    var current = load('localStorage', CONSENT_KEY) || {};
    banner.querySelector('[name="statistics"]').checked = !!current.statistics;
    banner.querySelector('[name="marketing"]').checked = !!current.marketing;
    setOptions(!!withOptions);
    banner.hidden = false;
    document.body.classList.add('cookie-open');
  }
  function setOptions(open) {
    options.hidden = !open;
    saveBtn.hidden = !open;
    optToggle.hidden = open;
    optToggle.setAttribute('aria-expanded', String(open));
  }
  function decide(statistics, marketing) {
    var consent = { necessary: true, statistics: statistics, marketing: marketing, date: new Date().toISOString() };
    save('localStorage', CONSENT_KEY, consent);
    banner.hidden = true;
    document.body.classList.remove('cookie-open');
    applyConsent(consent);
  }
  if (banner) {
    banner.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-cookie]');
      if (!btn) return;
      var action = btn.getAttribute('data-cookie');
      if (action === 'all') decide(true, true);
      else if (action === 'necessary') decide(false, false);
      else if (action === 'toggle') setOptions(true);
      else if (action === 'save') decide(
        banner.querySelector('[name="statistics"]').checked,
        banner.querySelector('[name="marketing"]').checked
      );
    });
    document.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
      el.addEventListener('click', function () { showBanner(true); });
    });
    var stored = load('localStorage', CONSENT_KEY);
    if (stored) applyConsent(stored); else showBanner(false);
  }

  // Chat assistant
  var launcher = document.getElementById('chat-launcher');
  var chat = document.getElementById('chat');
  var log = document.getElementById('chat-log');
  var suggest = document.getElementById('chat-suggest');
  var chatForm = document.getElementById('chat-form');
  var chatInput = document.getElementById('chat-input');
  var HISTORY_KEY = 'packmotin-chat';
  var history = load('sessionStorage', HISTORY_KEY) || [];

  var contactHtml = 'Telefon: <a href="' + PHONE_LINK + '">' + PHONE + '</a>\n' +
    'E-Mail: <a href="' + MAILTO + '">' + EMAIL + '</a>\n' +
    'Instagram: <a href="' + INSTAGRAM + '">@packmotin.de</a>';
  var offerHtml = '<a href="#kontakt">Zum Anfrageformular</a>';

  var knowledge = [
    { keys: ['hallo', 'hi', 'hey', 'moin', 'guten tag', 'servus', 'gruss', 'morgen', 'abend'],
      answer: 'Hallo! Ich bin der Packmotin-Assistent. Fragen Sie mich gern zu Lagerung, Verpackung, Versand, Retouren, Werbung & Content oder zu Preisen.' },
    { keys: ['leistung', 'was macht', 'was bietet', 'was bietest', 'service', 'angebot an', 'was ihr', 'was sie', 'fulfillment', 'fullfillment', 'ueberblick'],
      answer: 'Packmotin ist Ihr Fulfillment-Partner für kleine und mittlere Unternehmen. Wir übernehmen:\n• Lagerung Ihrer Ware\n• Pick & Pack (Kommissionieren und Verpacken)\n• Versand an Ihre Kunden\n• Verpackungslösungen bis hin zu gebrandeten Boxen\n• Retourenmanagement\n• Werbung & Content: Produktfotos, Videos und Social-Media-Werbung\n\n<a href="#leistungen">Alle Leistungen ansehen</a>' },
    { keys: ['lager', 'einlager', 'bestand', 'inventur', 'platz', 'palette'],
      answer: 'Wir lagern Ihre Ware sicher und sauber ein und führen den Bestand genau, damit Sie jederzeit wissen, was verfügbar ist. Wie viel Platz Sie brauchen, besprechen wir gern persönlich.' },
    { keys: ['versand', 'versend', 'verschick', 'paket', 'liefer', 'zustell', 'dhl', 'dpd', 'hermes', 'ups', 'gls', 'international', 'ausland', 'tracking', 'sendungsverfolgung'],
      answer: 'Wir versenden Ihre Bestellungen schnell und zuverlässig an Ihre Kunden, national und international, mit Sendungsverfolgung. Welche Versanddienstleister am besten zu Ihren Produkten passen, stimmen wir gemeinsam ab.' },
    { keys: ['verpack', 'karton', 'box', 'branding', 'unboxing', 'beilage', 'flyer', 'geschenk', 'pick', 'kommission'],
      answer: 'Jede Bestellung wird sorgfältig kommissioniert und produktgerecht verpackt. Auf Wunsch auch mit gebrandeter Verpackung, Beilagen oder Flyern, für ein Unboxing, das in Erinnerung bleibt.' },
    { keys: ['retour', 'ruecksend', 'zurueck', 'umtausch', 'reklamation'],
      answer: 'Retouren prüfen, erfassen und lagern wir wieder ein, damit die Ware schnell wieder verkaufsbereit ist.' },
    { keys: ['werbung', 'content', 'foto', 'bild', 'video', 'reel', 'social', 'tiktok', 'marketing', 'anzeige', 'ads', 'kampagne', 'sichtbar'],
      answer: 'Neben dem Fulfillment machen wir auch Werbung & Content: Produktfotos für Shop und Marktplätze, Kurzvideos und Unboxing-Clips für Social Media sowie die Planung und Betreuung von Werbeanzeigen. Ihre Ware liegt schon bei uns, deshalb muss nichts hin- und hergeschickt werden.\n\n<a href="#content">Mehr zu Werbung & Content</a>' },
    { boost: 2, keys: ['preis', 'kost', 'teuer', 'guenstig', 'tarif', 'gebuehr', 'euro', 'budget', 'rechnung', 'bezahl'],
      answer: 'Die Kosten hängen von Ihren Produkten, Ihrem Bestellvolumen und den gewünschten Leistungen ab. Nach einem kurzen Gespräch bekommen Sie ein individuelles, transparentes Angebot, unverbindlich.\n\n' + offerHtml + '\nOder direkt anrufen: <a href="' + PHONE_LINK + '">' + PHONE + '</a>' },
    { keys: ['start', 'loslegen', 'anfangen', 'wie lange', 'dauer', 'wann', 'ablauf', 'schritt', 'onboarding'],
      answer: 'So läuft es ab:\n1. Erstgespräch: Wir lernen Ihr Geschäft kennen und machen ein Angebot.\n2. Anbindung & Einlagerung: Ihr Shop wird angebunden, Ihre Ware kommt zu uns.\n3. Wir packen & versenden jede Bestellung.\n4. Sie konzentrieren sich auf Ihr Wachstum.\n\nDen genauen Zeitplan stimmen wir mit Ihnen ab.' },
    { keys: ['shop', 'shopify', 'woocommerce', 'amazon', 'ebay', 'etsy', 'marktplatz', 'schnittstelle', 'anbind', 'integration'],
      answer: 'Wir binden Ihren Shop bzw. Ihre Marktplätze unkompliziert an, damit Bestellungen automatisch bei uns ankommen. Welche Systeme Sie nutzen, klären wir am besten im Erstgespräch: ' + PHONE + '.' },
    { keys: ['mindest', 'klein', 'wenig', 'kmu', 'startup', 'start-up', 'gross', 'menge', 'volumen', 'skalier'],
      answer: 'Wir sind auf kleine und mittlere Unternehmen spezialisiert und wachsen mit Ihrem Bestellvolumen mit. Erzählen Sie uns, wo Sie gerade stehen, dann finden wir die passende Lösung.\n\n' + offerHtml },
    { keys: ['instagram', 'insta '],
      answer: 'Schreiben Sie uns direkt auf Instagram: <a href="' + INSTAGRAM + '">@packmotin.de</a>. Ein Tipp auf den Link öffnet den Chat mit uns.' },
    { keys: ['kontakt', 'telefon', 'nummer', 'anruf', 'anrufen', 'erreich', 'mail', 'email', 'e-mail', 'whatsapp', 'sprechen', 'mitarbeiter', 'mensch', 'berater', 'rueckruf'],
      answer: 'Sie erreichen uns so:\n' + contactHtml + '\n\nOder Sie nutzen das ' + '<a href="#kontakt">Anfrageformular</a>.' },
    { keys: ['wo', 'standort', 'adresse', 'sitz', 'stadt', 'besichtig'],
      answer: 'Zu unserem Standort und einer möglichen Besichtigung sprechen wir gern persönlich mit Ihnen. Rufen Sie einfach an: <a href="' + PHONE_LINK + '">' + PHONE + '</a>.' },
    { keys: ['danke', 'super', 'top', 'perfekt', 'cool'],
      answer: 'Sehr gern! Wenn Sie noch Fragen haben, schreiben Sie einfach. Für ein Angebot: ' + offerHtml + '.' },
    { keys: ['tschuess', 'bye', 'ciao', 'auf wiedersehen'],
      answer: 'Danke für Ihr Interesse an Packmotin. Bis bald!' }
  ];
  var fallback = 'Dazu kann ich Ihnen leider keine sichere Antwort geben. Am besten fragen Sie direkt unser Team:\n' + contactHtml;
  var suggestions = ['Welche Leistungen bietet ihr?', 'Was kostet Fulfillment?', 'Macht ihr auch Werbung?', 'Wie läuft der Start ab?', 'Kontakt'];

  function normalize(text) {
    return (' ' + text.toLowerCase() + ' ')
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9\- ]/g, ' ').replace(/\s+/g, ' ');
  }
  function localAnswer(text) {
    var q = normalize(text);
    var best = null, bestScore = 0;
    knowledge.forEach(function (entry) {
      var score = 0;
      entry.keys.forEach(function (key) {
        // Short keys must match whole words, 4-letter keys a word start, longer keys anywhere
        var needle = key.length <= 3 ? ' ' + key + ' ' : key.length === 4 ? ' ' + key : key;
        if (q.indexOf(needle) !== -1) score += key.length > 4 ? 2 : 1;
      });
      // Price questions win over the topic they mention ("Was kostet ein Video?")
      if (score && entry.boost) score += entry.boost;
      if (score > bestScore) { best = entry; bestScore = score; }
    });
    return best ? best.answer : fallback;
  }

  function addMessage(role, content, isHtml) {
    var el = document.createElement('div');
    el.className = 'msg ' + (role === 'user' ? 'msg-user' : 'msg-bot');
    if (isHtml) el.innerHTML = content; else el.textContent = content;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }
  function renderSuggestions(list) {
    suggest.innerHTML = '';
    list.forEach(function (text) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = text;
      b.addEventListener('click', function () { ask(text); });
      suggest.appendChild(b);
    });
  }
  function remember(role, content) {
    history.push({ role: role, content: content });
    save('sessionStorage', HISTORY_KEY, history.slice(-40));
  }

  function remoteAnswer() {
    return fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: history.map(function (m) {
          return { role: m.role, content: m.role === 'assistant' ? m.content.replace(/<[^>]+>/g, '') : m.content };
        })
      })
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (data) {
      if (!data || typeof data.reply !== 'string') throw new Error('bad reply');
      var div = document.createElement('div');
      div.textContent = data.reply;
      return div.innerHTML;
    });
  }

  var busy = false;
  function ask(text) {
    text = text.trim();
    if (!text || busy) return;
    busy = true;
    suggest.innerHTML = '';
    addMessage('user', text);
    remember('user', text);
    var typing = addMessage('assistant', '<span class="msg-typing" aria-label="Assistent schreibt"><span></span><span></span><span></span></span>', true);

    var answer = CHAT_ENDPOINT
      ? remoteAnswer().catch(function () { return localAnswer(text); })
      : new Promise(function (resolve) { setTimeout(function () { resolve(localAnswer(text)); }, reduceMotion ? 0 : 550); });

    answer.then(function (html) {
      typing.innerHTML = html;
      log.scrollTop = log.scrollHeight;
      remember('assistant', html);
      busy = false;
      renderSuggestions(suggestions.filter(function (s) { return s !== text; }).slice(0, 3));
    });
  }

  function openChat(open) {
    chat.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    launcher.setAttribute('aria-label', open ? 'Chat schließen' : 'Chat mit dem Packmotin-Assistenten öffnen');
    document.body.classList.toggle('chat-open', open);
    if (open) {
      if (!log.children.length) {
        if (history.length) {
          history.forEach(function (m) { addMessage(m.role, m.content, m.role === 'assistant'); });
          renderSuggestions(suggestions.slice(0, 3));
        } else {
          addMessage('assistant', 'Hallo! Ich bin der Packmotin-Assistent. Wie kann ich Ihnen helfen?');
          renderSuggestions(suggestions);
        }
      }
      chatInput.focus({ preventScroll: true });
    } else {
      launcher.focus({ preventScroll: true });
    }
  }

  if (launcher && chat) {
    launcher.addEventListener('click', function () { openChat(chat.hidden); });
    chat.querySelector('.chat-close').addEventListener('click', function () { openChat(false); });
    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = chatInput.value;
      chatInput.value = '';
      ask(text);
    });
    log.addEventListener('click', function (e) {
      if (e.target.closest('a[href^="#"]') && window.matchMedia('(max-width: 560px)').matches) openChat(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !chat.hidden) openChat(false);
    });
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
