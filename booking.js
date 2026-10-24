// Booking page: a full-screen takeover of the client's real Jotforms under the site navigation.
// The page behind the form matches each form's own background so it reads as one surface.
const EXP = {
  tour:   { form: 'https://form.jotform.com/253066638302152', bg: '#208454', name: 'Walking Food Tour' },
  dining: { form: 'https://pci.jotform.com/form/253240857231150', bg: '#208454', name: 'Exclusive Dining Experience' }
};
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const frame = $('#book-frame');
if (frame) {
  const stage = $('.tk-stage');
  function pick(key, push) {
    key = EXP[key] ? key : 'tour'; const x = EXP[key];
    $$('.tk-tab').forEach(t => { const on = t.dataset.exp === key; t.classList.toggle('on', on); t.setAttribute('aria-selected', on); });
    document.body.style.setProperty('--tk-bg', x.bg); $('#tk-main').dataset.exp = key;
    document.title = `Book ${x.name} | Taste of Austin Tours`;
    $('#form-loading').hidden = false; frame.style.height = ''; frame.src = x.form;
    scrollTo({ top: 0 });
    if (push) history.replaceState(null, '', `?exp=${key}`);
  }
  frame.addEventListener('load', () => { $('#form-loading').hidden = true; });
  // Jotform reports its height so the page scrolls once, with no scrollbar inside the form
  addEventListener('message', e => {
    let host = ''; try { host = new URL(e.origin).hostname; } catch (_) {}
    if (typeof e.data !== 'string' || !/(^|\.)jotform\.com$/.test(host)) return;
    const m = e.data.match(/^setHeight:(\d+)/); if (m) frame.style.height = (+m[1] + 24 + (innerWidth <= 780 ? 72 : 0)) + 'px';  // phones: Jotform pins a footer banner over the last 50px, so leave room for it below the Submit button
    if (/^scrollIntoView/.test(e.data)) stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $$('.tk-tab').forEach(t => t.addEventListener('click', () => pick(t.dataset.exp, true)));
  pick(new URLSearchParams(location.search).get('exp'), false);
}
