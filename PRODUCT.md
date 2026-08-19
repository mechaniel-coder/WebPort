# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences of equal weight, confirmed by the owner. Where they conflict, neither
gets a tiebreaker — the case-study pages carry technical depth and the client sites
carry visual impact, and each stays legible to the other audience.

- **Prospective clients.** Business owners and marketing leads deciding whether to
  hire. They judge on whether the work looks expensive and whether the case studies
  read as competent. They are not reading source.
- **Technical evaluators.** Developers and design leads who will read the source,
  check accessibility and open dev tools. They judge on craft, correctness and
  restraint.

## Product Purpose

A studio portfolio whose job is to win work and demonstrate capability. It presents
four complete client-style builds and one in-house research lab, each with its own
design system and at least one substantial hand-built interactive system.

Success is a prospective client being convinced the studio can do the work, and a
technical evaluator finding nothing that embarrasses it when they look closely.

## Positioning

- **The scope is itemised so it can be checked against a real quote.** The repository
  states plainly that it cannot certify its own market value, and instead lists what
  was built so the reader can compare it line by line.
- **Every claim on the site is asserted by an automated gate**, not left as marketing.
  `verify.js` fails the build on broken links, metadata, heading structure, malformed
  JSON-LD and unlabelled controls; `browser-check.js` drives every interactive system
  in a real browser against exact figures.
- **Delivery is clone-and-serve.** No framework, no bundler, no `node_modules`
  required to host. Third-party libraries and fonts are vendored and committed.

## Ownership and identity

**Confirmed:** the studio is a real business. The four client brands — Aurelia,
Northwind, Forma, Vestra — remain openly fictional and are labelled as self-initiated
demonstration work, not commissioned projects. That labelling is a commitment, not a
placeholder: it must survive any redesign.

**PENDING — must be supplied by the owner, never invented:**

- the studio's real trading name (currently the placeholder "Studio Meridian")
- its real location
- its real contact email and phone

Until these are supplied the placeholder stands. Fabricating a business name, address
or contact for a live commercial site is out of bounds regardless of how plausible the
invention would look.

## Constraints

Durable, and all of them survive a redesign:

- **No photography, and no stock imagery.** Nothing hotlinked; no licensing to clear.
  All artwork is generated — SVG, CSS, two WebGL shaders and a cloth simulation.
- **No third-party requests at runtime.** The Content-Security-Policy allows no
  external origins. Fonts, scripts and artwork are all same-origin. One inline script
  is permitted by SHA-256 hash rather than by opening the policy.
- **WCAG 2.2 AA**, with full keyboard operation and correct ARIA for every custom
  widget. `prefers-reduced-motion` is honoured throughout, and no reveal system may
  leave content permanently hidden.
- **Hosting stays clone-and-serve**, on the owner's colleague's AWS. `dist/` is
  committed. Any build step that hosting would depend on is out of bounds.
- **No payment details are collected anywhere**, on any of the commerce sites, at any
  step. Both checkout flows stop at the hand-off and say so.
- **Content is fictional and says so.** Copy, metrics and company details on the four
  client sites are written for demonstration.

## Terminology

- **Site** — one of the six mounts: hub `/`, `aurelia`, `northwind`, `forma`,
  `vestra`, `lab`.
- **Signature system** — the one substantial interactive system each site is built
  around (booking engine, dashboard, faceted catalogue, fit engine, experiments).
- **The gate** — `npm run check` plus `node browser-check.js`, run at both the domain
  root and under `BASE_PATH=/WebPort/`.

## Evidence

Figures that appear on the site and must stay true to the build:

- 79 pages; 0 errors and 0 warnings from the integrity checker; 234 browser checks.
- Northwind Team tier costs €/$359 at 100 GB and 25 hosts.
- A Forma order of $225.00 produces $20.66 tax and a $263.66 total.
- Vestra: a 96–80–104 body with a 78 cm inseam takes UK 12 in the coat, UK 14 in the
  trouser and UK 10 in the shirt — different sizes from one body, which is the point.

## Accessibility

Non-negotiable and already enforced by the gate. A redesign may not trade any of it
for visual effect: keyboard operation, visible focus, AA contrast, canvas text
alternatives, reduced-motion static states, and no colour-only status encoding.
