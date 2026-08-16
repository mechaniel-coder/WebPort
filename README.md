# WebPort

A portfolio of five production-grade websites — a studio hub, three complete client builds
and an experimental lab, each with its own design system and at least one substantial
interactive system built from scratch.

**Everything is static HTML, CSS and JavaScript with zero runtime dependencies.**
No framework, no bundler, no `node_modules` needed to host it. See **[HOSTING.md](HOSTING.md)**.

---

## The sites

**60 pages. 0 errors and 0 warnings from the integrity checker. 117 browser checks passing.**

| Path | Site | Sector | Pages | Signature system |
| --- | --- | --- | --- | --- |
| `/` | Studio hub | Portfolio | 7 | Case studies for the three client builds |
| `/aurelia/` | Aurelia | Boutique hospitality | 15 | Accessible date-range booking engine |
| `/northwind/` | Northwind | B2B observability SaaS | 13 | Live SVG dashboard + pricing calculator |
| `/forma/` | Forma | Design-object e-commerce | 19 | Faceted catalog, variants, persistent cart |
| `/lab/` | Meridian Lab | In-house R&D | 6 | WebGL renderer, Verlet physics, scrollytelling, frontier CSS |

The lab is the studio’s own research rather than client work: four experiments in techniques that normally arrive with a library attached — a WebGL renderer written from the matrix maths up, a hand-written Verlet physics solver, scroll-driven storytelling that never takes the scrollbar, and frontier CSS with no JavaScript at all. No three.js, no physics engine, no scroll library.

Aurelia, Northwind and Forma are **fictional brands**, created to demonstrate design and
engineering capability across three very different problem shapes: art direction, technical
communication, and transactional UX.

---

## Quick start

Hosting requires no tooling at all — serve `dist/`. To work on the source you need Node 20+:

```bash
npm run build          # src/ → dist/
npm run serve          # preview at http://localhost:4173
npm run verify         # integrity checks; exits non-zero on failure
npm run check          # build + verify
npm run check:browser  # drive every page and interactive system in Chromium
npm run screenshots    # responsive screenshots at 390 / 834 / 1440
```

There are no dependencies to install for the first four. The browser checks need
`npm install playwright-core` and skip cleanly without it — hosting never needs either.

---

## How it works

Each page is an ES module exporting `meta` and `render`. `build.js` walks the tree, renders
every page through a shared document shell, and writes clean-URL HTML.

```
site.config.js        studio identity, origin, base path, site list
build.js              generator: walk → render → write
serve.js              preview server
verify.js             integrity gate (links, metadata, a11y, structured data)

src/
  _lib/               document shell, <head>/SEO/JSON-LD builders, shared reset
  hub/                site.js (chrome + design tokens) · pages/ · assets/
  aurelia/            "
  northwind/          "
  forma/              "
  lab/                "

dist/                 committed build output — this is what gets hosted
```

### Adding a page

Create `src/<site>/pages/whatever.page.js`:

```js
export const meta = {
  title: 'Whatever',
  description: 'One sentence, under 165 characters.',
};

export function render({ url, site, studio }) {
  return `<section class="shell"><h1>Whatever</h1></section>`;
}
```

It builds to `/<site>/whatever/`. A file named `index.page.js` builds to the directory root,
and a module exporting a `pages` array generates a whole collection from data (used for room
and product detail pages).

### Routing rules

| Source file | URL |
| --- | --- |
| `pages/index.page.js` | `/<site>/` |
| `pages/rooms/index.page.js` | `/<site>/rooms/` |
| `pages/rooms/dune.page.js` | `/<site>/rooms/dune/` |
| `pages/shop/[product].page.js` | `/<site>/shop/<slug>/` for each entry in `pages` |

---

## What each site demonstrates

Three problems that need genuinely different answers, which is why the sites do not look
alike:

- **Aurelia** — art direction and a hard accessibility problem. The calendar is a real
  `role="grid"` with roving tabindex and a per-cell accessible name; choosing an arrival
  computes the furthest reachable departure so an unfulfillable range cannot be assembled.
- **Northwind** — technical credibility. Charts are hand-built SVG rendered at *build* time
  and again in the browser, so the dashboard is in the served HTML before any script runs.
  The categorical palette was run through a colour-vision validator against the site's own
  dark surface rather than picked by eye.
- **Forma** — transactional correctness. Faceted filtering is AND across facets and OR
  within one, with state in the URL so it survives sharing and the back button. Tax is
  charged on goods *plus* shipping. No payment details are collected anywhere.

Where the server and browser both need the same logic — rates, chart data, prices, cart
maths — it lives in one module both import (`src/aurelia/assets/rates.js`,
`src/northwind/assets/charts.js`, `src/forma/assets/commerce.js`). There is no second
implementation to drift.

---

## Quality bar

These are enforced rather than aspirational — `npm run verify` fails the build on most of
them, and the rest are driven in a real browser by `npm run check:browser`.

- **Design systems** — every site defines its own colour, type, space and motion tokens as
  CSS custom properties. Fluid type via `clamp()`. Verified at 360 / 768 / 1024 / 1440px.
- **Accessibility** — semantic landmarks, skip links, visible focus, AA contrast, and full
  keyboard operation with correct ARIA for every custom widget. `prefers-reduced-motion`
  is honoured throughout.
- **SEO** — unique title and description per page, canonical URLs, Open Graph and Twitter
  cards, JSON-LD per page type, generated `sitemap.xml` and `robots.txt`.
- **Performance** — no runtime framework, no external font or script requests, no layout
  shift. The largest page ships a few KB of JavaScript.
- **Imagery** — all artwork is original SVG and CSS. Nothing is hotlinked, and there is no
  third-party licensing to clear.

### What "verified" means here

`verify.js` checks every built page for broken internal links (including `og:image` and
canonical targets), missing or duplicated metadata, heading structure, malformed JSON-LD,
duplicate ids, unlabelled form controls, and inline SVG with no accessible name.

`browser-check.js` loads all 60 pages in Chromium asserting zero console errors, then drives
each signature system end to end. The assertions check **exact figures**, not that something
appeared — Team costs `$359` at 100 GB and 25 hosts; a Forma order of `$225.00` produces
`$20.66` tax and a `$263.66` total; the booking reference matches `AUR-YYYY-XXXXX`. The lab
is held to the same standard — the descent visualisation is asserted against Boyle’s law at
100 m, and the physics is checked for stability rather than merely for running.

Both suites also pass against a **subdirectory build** (`BASE_PATH=/WebPort/`), which is the
single most common way a multi-site static repo breaks.

### Known limitations

Stated plainly rather than left to be discovered:

- **Social card images are SVG.** They are self-contained and render correctly in the
  browser, but some crawlers (notably Facebook) only accept raster formats. For maximum
  unfurl coverage, export each `social-card.svg` to a 1200×630 PNG and point `socialImage`
  at it.
- **Forms have no backend.** They validate and stop. See *Forms* in HOSTING.md for the
  single hand-off point in each.
- **Content is fictional.** Copy, testimonials, metrics and company details are written for
  demonstration. Anything reused for a real client needs real content.
- **Forma's products are drawn, not photographed.** Generated vector artwork communicates
  proportion, finish and form honestly, and material texture not at all. The recommendation
  for a real brand is drawn art for the catalogue and photography on detail pages.
- **Northwind's dashboard runs on generated data**, stated on the page itself. It uses a
  seeded generator rather than `Math.random()`, so it is at least internally consistent and
  identical on every reload.

### On valuation

This repository cannot certify what it is worth — no codebase can. What it can do is state
the scope precisely so it can be compared against a real quote: **60 pages, three
independent design systems, four hand-built interactive subsystems, WCAG 2.2 AA with
keyboard-operable custom widgets, structured data per page type, a zero-dependency delivery
target, and an automated integrity gate.** Whether that is worth a given number is a
judgement for whoever is paying; the itemisation above is the honest input to it.
