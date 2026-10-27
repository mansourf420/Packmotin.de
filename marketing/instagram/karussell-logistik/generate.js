// Renders the 6 carousel slides (1080x1350). Usage: node generate.js <repo-root> <output-dir>
const { chromium } = require('playwright');
const fs = require('fs');
const root = process.argv[2], out = process.argv[3];
const b64 = (p, m) => `data:${m};base64,` + fs.readFileSync(`${root}/${p}`).toString('base64');
const ARCHIVO = b64('assets/fonts/archivo-latin-wght-normal.woff2', 'font/woff2');
const INTER = b64('assets/fonts/inter-latin-wght-normal.woff2', 'font/woff2');
const MARK = b64('assets/logo-mark.png', 'image/png');

const I = {
  warehouse: '<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/>',
  package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  shieldcheck: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  chart: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  trending: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  gem: '<path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  video: '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'
};
const svg = (name, size, extra = '') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="url(#g)" stroke-linecap="round" stroke-linejoin="round" ${extra}>${I[name]}</svg>`;

const slides = [
  { cover: true, features: [['warehouse', 'Lagerung'], ['package', 'Verpackung'], ['truck', 'Versand'], ['megaphone', 'Marketing Support']] },
  { eyebrow: 'Sichere & flexible', title: 'Lagerung.', art: 'warehouse',
    text: 'Deine Produkte sind bei uns sicher, organisiert und jederzeit versandbereit.',
    list: ['Moderne Lagerflächen in Deutschland', 'Transparente Bestände in Echtzeit', 'Skalierbar für jedes Wachstum', 'Sichere & saubere Lagerung'],
    features: [['shield', 'Sicher'], ['chart', 'Transparent'], ['trending', 'Skalierbar']] },
  { eyebrow: 'Schnelle & zuverlässige', title: 'Verpackung.', art: 'package',
    text: 'Wir verpacken deine Bestellungen sorgfältig, effizient und in deinem Design – damit deine Kunden begeistert sind.',
    list: ['Individuelles Branding auf Wunsch', 'Sorgfältige & sichere Verpackung', 'Umweltfreundliche Materialien', 'Qualitätskontrolle bei jeder Bestellung'],
    features: [['gem', 'Individuell'], ['leaf', 'Nachhaltig'], ['shieldcheck', 'Zuverlässig']] },
  { eyebrow: 'Schneller & zuverlässiger', title: 'Versand.', art: 'truck',
    text: 'Deine Bestellungen erreichen deine Kunden schnell und sicher – in ganz Deutschland und Europa.',
    list: ['Versand mit starken Partnern (z. B. DHL)', 'Schnelle Bearbeitungszeiten', 'Sendungsverfolgung in Echtzeit', 'National & international'],
    features: [['zap', 'Schnell'], ['globe', 'Deutschland & Europa'], ['pin', 'Tracking in Echtzeit']] },
  { eyebrow: 'Persönlicher', title: 'Marketing Support.', art: 'camera',
    text: 'Auf Wunsch unterstützen wir dich bei Content, Produktfotos und Social Media – damit deine Marke noch schneller wächst.',
    list: ['Professionelle Produktfotos', 'Content-Erstellung (Reels, Fotos)', 'Social-Media-Unterstützung', 'Mehr Sichtbarkeit für deine Marke'],
    features: [['camera', 'Produktfotos'], ['video', 'Content'], ['trending', 'Mehr Reichweite']] },
  { final: true, eyebrow: 'Deine Vorteile mit', title: 'Packmotin.',
    text: 'Mehr Zeit, weniger Aufwand, mehr Wachstum – wir kümmern uns um die Logistik, damit du dich auf das Wesentliche konzentrieren kannst.',
    list: ['Alles aus einer Hand', 'Transparente Preise', 'Persönlicher Ansprechpartner', 'Skalierbar für jedes Business', 'Made in Germany'] }
];

const css = `
@font-face{font-family:Archivo;src:url(${ARCHIVO}) format('woff2');font-weight:100 900}
@font-face{font-family:Inter;src:url(${INTER}) format('woff2');font-weight:100 900}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1350px;overflow:hidden;background:#000}
.s{position:relative;width:1080px;height:1350px;overflow:hidden;color:#f5f1ea;font-family:Inter,sans-serif;
  background:radial-gradient(ellipse 70% 55% at var(--gx,85%) var(--gy,55%),rgba(227,171,99,.26),rgba(227,171,99,.05) 55%,transparent 75%),
  linear-gradient(180deg,#0e0b08 0%,#060504 100%)}
.s::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:60px 60px;
  -webkit-mask-image:radial-gradient(ellipse at var(--gx,85%) var(--gy,55%),#000,transparent 70%)}
.in{position:absolute;inset:0;padding:72px 80px}
.top{display:flex;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:16px;font:900 36px/1 Archivo;letter-spacing:.01em}
.brand img{width:52px}
.gold{background:linear-gradient(135deg,#f7cd80 0%,#dca35c 48%,#a8692f 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.count{font:600 24px Inter;color:#f5f1ea;padding:10px 20px;border-radius:99px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12)}
.eyebrow{margin-top:92px;font:700 38px/1 Archivo;text-transform:uppercase;letter-spacing:.06em}
.title{font:900 150px/1 Archivo;text-transform:uppercase;letter-spacing:-.02em;margin-top:16px;white-space:nowrap}
.title.two{white-space:normal;line-height:.95}
.text{margin-top:34px;font:400 34px/1.45 Inter;color:#d8d2c9;max-width:720px}
.list{list-style:none;margin-top:44px;display:grid;gap:22px;max-width:600px}
.list li{display:flex;gap:20px;align-items:flex-start;font:500 31px/1.3 Inter}
.ck{width:44px;height:44px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;background:linear-gradient(135deg,#f7cd80,#dca35c 48%,#a8692f)}
.ck svg{stroke:#140d05}
.art{position:absolute;right:56px;top:560px;filter:drop-shadow(0 0 40px rgba(227,171,99,.35))}
.feat{position:absolute;left:80px;right:80px;bottom:72px;display:flex;border-top:1px solid rgba(255,255,255,.12);padding-top:40px}
.feat div{flex:1;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center;font:700 22px/1.25 Archivo;text-transform:uppercase;letter-spacing:.06em}
.feat div+div{border-left:1px solid rgba(255,255,255,.12)}
/* cover */
.cover h1{margin-top:120px;font:900 120px/1.02 Archivo;text-transform:uppercase;letter-spacing:-.02em}
.cover h1 span{display:block;width:max-content;white-space:nowrap}
.cover .sub{margin-top:40px;font:400 36px/1.4 Inter;color:#d8d2c9;max-width:520px}
.cover .bigmark{position:absolute;right:70px;top:620px;width:300px;filter:drop-shadow(0 30px 70px rgba(227,171,99,.4))}
.circles{position:absolute;left:80px;right:80px;bottom:140px;display:flex;justify-content:space-between}
.circles div{display:flex;flex-direction:column;align-items:center;gap:16px;width:200px;font:700 22px/1.2 Archivo;text-transform:uppercase;letter-spacing:.06em;text-align:center}
.circles span{width:124px;height:124px;border-radius:50%;display:grid;place-items:center;border:2px solid rgba(227,171,99,.6);background:rgba(227,171,99,.07)}
.swipe{position:absolute;right:80px;bottom:64px;display:flex;align-items:center;gap:12px;font:600 26px Inter;color:#d8d2c9}
.domain{position:absolute;left:80px;bottom:64px;font:600 26px Inter;color:#d8d2c9}
/* final */
.final .fm{position:absolute;right:60px;top:610px;width:290px;filter:drop-shadow(0 30px 70px rgba(227,171,99,.4))}
.cta{position:absolute;left:80px;right:80px;bottom:150px;height:110px;border-radius:99px;display:flex;align-items:center;justify-content:center;gap:18px;
  background:linear-gradient(135deg,#f7cd80,#dca35c 48%,#a8692f);color:#140d05;font:800 38px Archivo;text-transform:uppercase;letter-spacing:.03em;box-shadow:0 20px 50px -15px rgba(227,171,99,.7)}
.contact{position:absolute;left:80px;right:80px;bottom:62px;display:flex;justify-content:center;gap:40px;font:600 28px Inter;color:#d8d2c9}
`;
const defs = `<svg width="0" height="0" style="position:absolute"><defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="24" y2="24"><stop offset="0" stop-color="#f7cd80"/><stop offset=".5" stop-color="#dca35c"/><stop offset="1" stop-color="#a8692f"/></linearGradient></defs></svg>`;
const brand = `<div class="brand"><img src="${MARK}"><span><span>PACK</span><span class="gold">MOTIN.DE</span></span></div>`;
const glow = [['18%','30%'],['88%','62%'],['86%','60%'],['84%','62%'],['86%','60%'],['80%','62%']];

function html(s, i) {
  const n = `<div class="count">${i + 1}/6</div>`;
  let body;
  if (s.cover) {
    body = `<div class="in cover">${brand}
      <h1 data-fitlines><span>Du verkaufst.</span><span class="gold">Wir übernehmen</span><span>die Logistik.</span></h1>
      <p class="sub">Fulfillment in Deutschland<br>für wachsende Onlineshops.</p>
      <img class="bigmark" src="${MARK}">
      <div class="circles">${s.features.map(([ic, l]) => `<div><span>${svg(ic, 60, 'stroke-width="1.6"')}</span>${l}</div>`).join('')}</div>
      <div class="domain">packmotin.de</div>
      <div class="swipe">Wischen ${svg('arrow', 34, 'stroke-width="2"')}</div></div>`;
  } else {
    const list = `<ul class="list">${s.list.map(t => `<li><span class="ck"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${I.check}</svg></span>${t}</li>`).join('')}</ul>`;
    body = `<div class="in ${s.final ? 'final' : ''}"><div class="top">${brand}${n}</div>
      <p class="eyebrow">${s.eyebrow}</p>
      <h2 class="title gold" data-fit>${s.title}</h2>
      <p class="text">${s.text}</p>${list}
      ${s.final
        ? `<img class="fm" src="${MARK}"><div class="cta">Jetzt Anfrage stellen ${svg('arrow', 40, 'style="stroke:#140d05" stroke-width="2.4"')}</div>
           <div class="contact"><span>packmotin.de</span><span>·</span><span>0177 7578761</span></div>`
        : `<div class="art">${svg(s.art, 320, 'stroke-width="1.1"')}</div>
           <div class="feat">${s.features.map(([ic, l]) => `<div>${svg(ic, 56, 'stroke-width="1.6"')}<span>${l}</span></div>`).join('')}</div>`}
    </div>`;
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${defs}<div class="s" style="--gx:${glow[i][0]};--gy:${glow[i][1]}">${body}</div></body></html>`;
}

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (let i = 0; i < slides.length; i++) {
    await p.setContent(html(slides[i], i));
    await p.evaluate(async () => {
      await document.fonts.ready;
      // Shrink the big title until it fits the slide width; long titles may wrap to two lines
      const t = document.querySelector('[data-fit]');
      if (!t) return;
      const max = 920;
      let size = 150;
      t.style.fontSize = size + 'px';
      while (t.scrollWidth > max && size > 112) { size -= 2; t.style.fontSize = size + 'px'; }
      if (t.scrollWidth > max) { t.classList.add('two'); t.style.fontSize = '128px'; }
    });
    await p.evaluate(() => {
      // Cover: make the three headline lines equally fit the width
      const h = document.querySelector('[data-fitlines]');
      if (h) { let size = 120; const w = () => Math.max(...[...h.children].map(c => c.getBoundingClientRect().width));
        while (w() > 920 && size > 60) { size -= 2; h.style.fontSize = size + 'px'; } }
      // Keep artwork below the intro paragraph
      const a = document.querySelector('.art, .fm'), tx = document.querySelector('.text');
      if (a && tx) { const top = tx.getBoundingClientRect().bottom + 40; if (a.getBoundingClientRect().top < top) a.style.top = top + 'px'; }
    });
    const overflow = await p.evaluate(() => {
      const bad = [];
      document.querySelectorAll('.in *').forEach(el => { const r = el.getBoundingClientRect(); if (r.width && (r.right > 1081 || r.bottom > 1351) && !el.closest('.bigmark,.art,.fm')) bad.push(el.className || el.tagName); });
      // detect overlap between checklist and feature row / CTA
      const l = document.querySelector('.list'), f = document.querySelector('.feat, .cta');
      if (l && f && l.getBoundingClientRect().bottom > f.getBoundingClientRect().top - 20) bad.push('list overlaps bottom');
      const a = document.querySelector('.art, .fm'), tx = document.querySelector('.text');
      if (a && tx && a.getBoundingClientRect().top < tx.getBoundingClientRect().bottom - 10 && a.getBoundingClientRect().left < tx.getBoundingClientRect().right) bad.push('art overlaps text');
      return bad;
    });
    const file = `${out}/packmotin-slide-${i + 1}.png`;
    await p.screenshot({ path: file });
    console.log(file.split('/').pop(), overflow.length ? 'ISSUES: ' + overflow.join(', ') : 'ok');
  }
  await b.close();
})();
