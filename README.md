# Taste of Austin Tours — v2

Static redesign of tasteofaustintours.com (no build step). Plain HTML, CSS and JS.

- Pages: `index.html`, `events.html`, `corporate.html`, `about.html`, `contact.html`
- Home hero: 90-frame sequence in `media/frames/`, drawn on a canvas and driven by scroll (intro plays on load).
- Booking buttons link to the existing Wix booking pages; contact and quote forms open an email (no backend).
- Previous version lives in `JHGruver/Tasteofaustintours`.

## Preview status
Draft. `robots.txt` and the `noindex` meta tags keep it out of search engines.
**Remove both before pointing the real domain at it.**

## Booking
Walking Food Tour – Lunch and Exclusive Dining Experience book through the client's Jotforms (full-screen on `book.html`).
Corporate, Private Group Tour, Evening Progressive Dinner and Celebration Tables are inquiry-only until they exist in Wix.
The 1:00 PM / 5:00 PM departure pills are removed because the Jotform does not offer those times yet.
Anything tagged `data-wix="pending"` is hidden by `styles.css`; delete the attribute to show it.
