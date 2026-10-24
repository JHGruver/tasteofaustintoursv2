// Parallax: layers move at their own speed relative to scroll
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const layers = [...document.querySelectorAll('[data-speed]')];
let ticking = false;
function paint() {
  const y = scrollY;
  layers.forEach(el => {
    const host = el.closest('.hero,.band') || el.parentElement;
    const r = host.getBoundingClientRect();
    if (r.bottom < -200 || r.top > innerHeight + 200) return;
    el.style.transform = `translate3d(0,${(-r.top * parseFloat(el.dataset.speed)).toFixed(1)}px,0)`;
  });
  ticking = false;
}
if (!reduce) {
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
  paint();
}

// Mouse-tilt on hero cards
const stack = document.querySelector('.stack');
if (stack && !reduce) {
  stack.parentElement.addEventListener('pointermove', e => {
    const x = (e.clientX / innerWidth - .5) * 2, y = (e.clientY / innerHeight - .5) * 2;
    stack.querySelectorAll('[data-depth]').forEach(el => {
      const d = parseFloat(el.dataset.depth);
      el.style.translate = `${x * d}px ${y * d}px`;
    });
  });
}

// Reveal on scroll
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

// Mobile menu
const mb = document.querySelector('.menu-btn'), links = document.querySelector('.links');
mb?.addEventListener('click', () => { const o = links.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
links?.addEventListener('click', e => { if (e.target.tagName === 'A') links.classList.remove('open'); });

// Booking bar: price + hand-off to the existing checkout pages
const BASE = 'https://www.tasteofaustintours.com';
const EXPERIENCES = {
  tour:   { price: 106, url: BASE + '/book-tour-1' },
  dining: { price: 119, url: BASE + '/copy-of-book-tour' },
  corporate: { price: 250, inquiry: true, url: 'corporate.html#inquiry' }
};
const form = document.getElementById('book');
if (form) {
  const sel = form.querySelector('#exp'), guests = form.querySelector('#guests'), date = form.querySelector('#date');
  const total = form.querySelector('#total'), label = form.querySelector('#total-label');
  date.min = new Date().toISOString().slice(0, 10);
  const money = n => '$' + n.toLocaleString();
  function update() {
    const x = EXPERIENCES[sel.value], g = +guests.value || 1;
    if (x.price) { total.textContent = money(x.price * g); label.textContent = `${g} guest${g > 1 ? 's' : ''} × ${money(x.price)} ${x.inquiry ? '· groups of 8–60, confirmed by email' : '· tax included'}`; }
  }
  form.addEventListener('input', update); update();
  form.addEventListener('submit', e => {
    e.preventDefault();
    const x = EXPERIENCES[sel.value];
    location.href = !x.inquiry ? x.url : `corporate.html?guests=${guests.value}&date=${date.value}#inquiry`;
  });
  // Cards elsewhere on the page preselect an experience
  document.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => {
    sel.value = b.dataset.pick; update();
    document.getElementById('book-anchor').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));
}


// Form delivery. With FORM_ENDPOINT empty, forms open the visitor's email app (works, but needs a mail client).
// To deliver straight to Shane's inbox, set it to a form service endpoint, e.g.
//   'https://formsubmit.co/ajax/shane@tasteofaustintours.com'  (Shane confirms the first message by email)
// Messages then go through that service; on any failure the form falls back to the email app.
const FORM_ENDPOINT = '';
async function deliver(form, subject, body) {
  const ok = form.querySelector('.ok'), btn = form.querySelector('button[type=submit]');
  const mailto = `mailto:shane@tasteofaustintours.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const say = (t, err) => { ok.textContent = t; ok.style.display = 'block'; ok.dataset.state = err ? 'err' : 'ok'; };
  if (!FORM_ENDPOINT) { say('Opening your email app with your message. Just press send.'); location.href = mailto; return; }
  const label = btn.textContent; btn.disabled = true; btn.textContent = 'Sending…';
  try {
    const r = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ _subject: subject, subject, message: body, ...Object.fromEntries(new FormData(form)) }) });
    if (!r.ok) throw new Error(r.status);
    form.reset(); say('Thank you. Your message was sent.');
  } catch (_) { say('We could not send that automatically, so we are opening your email app instead.', true); location.href = mailto; }
  finally { btn.disabled = false; btn.textContent = label; }
}

// Corporate inquiry
const inq = document.getElementById('inquiry-form');
if (inq) {
  const p = new URLSearchParams(location.search);
  if (p.get('guests')) inq.guests.value = p.get('guests');
  if (p.get('date')) inq.date.value = p.get('date');
  inq.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(inq));
    const body = `Company: ${d.company}\nContact: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone || '-'}\nGuests: ${d.guests}\nPreferred date: ${d.date || 'flexible'}\nPackage: ${d.pkg}\n\n${d.notes || ''}`;
    deliver(inq, 'Corporate event inquiry – ' + d.company, body);
  });
}

// Cursor-follow spotlight on glass cards
document.querySelectorAll('.spot').forEach(c => c.addEventListener('pointermove', e => {
  const r = c.getBoundingClientRect();
  c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
  c.style.setProperty('--my', (e.clientY - r.top) + 'px');
}));

// Events filter chips
document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => {
  document.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === c));
  document.querySelectorAll('.event[data-cat]').forEach(e => { e.hidden = c.dataset.f !== 'all' && e.dataset.cat !== c.dataset.f; });
}));

// Sticky mobile CTA: hidden near the top and while its target section is on screen
const mcta = document.querySelector('.m-cta');
if (mcta) {
  const t = document.querySelector(mcta.dataset.hide);
  let seen = false;
  const sync = () => mcta.classList.toggle('off', seen || scrollY < 520);
  if (t) new IntersectionObserver(es => { seen = es[0].isIntersecting; sync(); }, { threshold: .15 }).observe(t);
  addEventListener('scroll', sync, { passive: true }); sync();
}
// Filter chips announce state
document.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c.classList.contains('on')));
document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => document.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', x === c))));

// Contact form: compose an email (no backend). ?event=<name> shows that event as a summary and selects it as the topic.
const EVENT_INFO = {
  'Private Group Tour': ['Your own guide and your own pace. A private version of our walking tour for family reunions, friends and visiting groups.', 'Pricing on request'],
  'Corporate & Team Events': ['Team offsites, client entertainment and holiday parties, built around your group size, budget and dietary needs.', '$250 per person, minimum 8 guests']
};
const cf = document.getElementById('contact-form');
if (cf) {
  const ev = new URLSearchParams(location.search).get('event');
  if (ev && EVENT_INFO[ev]) {
    cf.topic.value = ev;
    document.getElementById('inq-name').textContent = ev;
    document.getElementById('inq-desc').textContent = EVENT_INFO[ev][0];
    document.getElementById('inq-price').textContent = EVENT_INFO[ev][1];
    document.getElementById('inq-sum').hidden = false;
    cf.msg.placeholder = 'Tell us your date, group size and anything we should know';
  }
  cf.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(cf));
    const sub = `Website inquiry – ${d.topic}`;
    const body = `Experience: ${d.topic}\nName: ${d.name}\nEmail: ${d.email}\n\n${d.msg}`;
    deliver(cf, sub, body);
  });
}

// Hero: a 90-frame sequence of the clip is drawn on a canvas.
// 1) Intro (home page load): the clip plays on its own for ~2.4s while the page fades in.  2) After that, scrolling continues the clip
// from the frame where the intro stopped (down = forward, up = back).  No video element, so no audio and no seek lag.
const cv = document.getElementById('hero-canvas'), runway = document.getElementById('hero-runway');
if (cv && runway) {
  const root = document.documentElement, INTRO = root.classList.contains('intro-pre');
  const N = +cv.dataset.frames, B = reduce ? 0.2 : 0.22;           // share of the clip played by the intro
  const ctx = cv.getContext('2d'), imgs = new Array(N), host = cv.parentElement;
  let cur = INTRO ? 0 : B, target = cur, last = -1, raf = 0, introActive = false;
  const src = i => `media/frames/f${String(i).padStart(3, '0')}.jpg`;
  const load = i => new Promise(res => { const im = new Image(); im.onload = () => { imgs[i] = im; if (i === 0) draw(true); res(); }; im.onerror = res; im.src = src(i); });
  const head = Math.ceil(B * (N - 1)) + 2;
  const headLoaded = Promise.all(Array.from({ length: head }, (_, i) => load(i)));
  headLoaded.then(async () => {
    const rest = []; for (let k = head + 2; k < N; k += 3) rest.push(k); for (let k = head; k < N; k++) if (!rest.includes(k)) rest.push(k);
    for (let b = 0; b < rest.length; b += 6) await Promise.all(rest.slice(b, b + 6).map(load));
  });
  const size = () => { const d = Math.min(devicePixelRatio || 1, 1.5); cv.width = Math.round(host.clientWidth * d); cv.height = Math.round(host.clientHeight * d); last = -1; draw(true); };
  function draw(force) {
    let i = Math.round(cur * (N - 1)); if (!force && i === last) return;
    const want = i; while (i > 0 && !imgs[i]) i--;
    const im = imgs[i]; if (!im) return; last = want;
    const cw = cv.width, ch = cv.height, s = Math.max(cw / im.width, ch / im.height);
    ctx.drawImage(im, (cw - im.width * s) / 2, (ch - im.height * s) / 2, im.width * s, im.height * s);
  }
  const progress = () => {
    const r = runway.getBoundingClientRect(), pinned = getComputedStyle(host).position === 'sticky';
    const range = pinned ? runway.offsetHeight - innerHeight : host.offsetHeight;
    return Math.min(1, Math.max(0, -r.top / Math.max(1, range)));
  };
  const tick = () => { raf = 0; cur += (target - cur) * 0.2; if (Math.abs(target - cur) < 0.0015) cur = target; draw(); if (cur !== target) raf = requestAnimationFrame(tick); };
  const update = () => { if (introActive) return; target = reduce ? B : B + progress() * (1 - B); if (!raf) raf = requestAnimationFrame(tick); };

  size(); update();
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', () => { size(); update(); });

  if (INTRO) {
    introActive = true; scrollTo(0, 0);
    const mark = document.createElement('div'); mark.className = 'intro-mark'; mark.setAttribute('aria-hidden', 'true');
    mark.innerHTML = '<b>Taste of Austin</b><i></i><span>Walking food tours</span>'; host.appendChild(mark);
    const stop = e => e.preventDefault(), keep = () => scrollTo(0, 0);
    addEventListener('wheel', stop, { passive: false }); addEventListener('touchmove', stop, { passive: false }); addEventListener('scroll', keep);
    const DUR = 2400, ease = t => 0.5 - Math.cos(Math.PI * t) / 2;
    const finish = () => {
      cancelAnimationFrame(raf); raf = 0; cur = B; draw(true);
      introActive = false; removeEventListener('wheel', stop); removeEventListener('touchmove', stop); removeEventListener('scroll', keep);
      root.classList.remove('intro-pre', 'intro-go'); mark.remove(); update();
    };
    // wait (max 2.5s) for the opening frames, then play
    Promise.race([headLoaded, new Promise(r => setTimeout(r, 2500))]).then(() => {
      root.classList.add('intro-go');
      const t0 = performance.now();
      (function step(now) {
        const t = Math.min(1, (now - t0) / DUR);
        cur = B * ease(t); draw();
        t < 1 ? requestAnimationFrame(step) : finish();
      })(t0);
    });
  }
}

// Logo + Home: on the home page, scroll back to the top instead of doing nothing
document.querySelectorAll('a.brand, .links a[href="index.html"]').forEach(a => a.addEventListener('click', e => {
  if (/(^|\/)(index\.html)?$/.test(location.pathname)) { e.preventDefault(); links?.classList.remove('open'); scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }
}));  // brand click
