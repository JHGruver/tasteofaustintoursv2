# Taste of Austin Tours — v2

Static redesign of tasteofaustintours.com (no build step). Plain HTML, CSS and JS.

- Pages: `index.html`, `events.html`, `corporate.html`, `about.html`, `contact.html`
- Home hero: 90-frame sequence in `media/frames/`, drawn on a canvas and driven by scroll (intro plays on load).
- Booking buttons link to the existing Wix booking pages; contact and quote forms open an email (no backend).
- Previous version lives in `JHGruver/Tasteofaustintours`.

## Preview status
Draft. `robots.txt` and the `noindex` meta tags keep it out of search engines.
**Remove both before pointing the real domain at it.**

## Hidden until added in Wix
Only the two experiences in the client's Jotform are shown (Walking Food Tour – Lunch, Exclusive Dining Experience).
These cards carry `data-wix="pending"` and are hidden: Corporate & Team Events, Private Group Tour, Evening Progressive Dinner, Celebration Tables, plus the 1:00 PM / 5:00 PM departure pills.
Delete the attribute on a card to show it once its Wix service exists.
