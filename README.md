# WebPort

A portfolio of four production-grade websites — a studio hub and three complete client
builds, each with its own design system and one substantial interactive system built from
scratch.

**Everything is static HTML, CSS and JavaScript with zero runtime dependencies.**
No framework, no bundler, no `node_modules` needed to host it. See **[HOSTING.md](HOSTING.md)**.

---

## The sites

| Path | Site | Sector | Signature system |
| --- | --- | --- | --- |
| `/` | Studio hub | Portfolio | Case studies for the three builds below |
| `/aurelia/` | Aurelia | Boutique hospitality | Accessible date-range booking engine |
| `/northwind/` | Northwind | B2B observability SaaS | Live SVG dashboard + pricing calculator |
| `/forma/` | Forma | Design-object e-commerce | Faceted catalog, variants, persistent cart |

Aurelia, Northwind and Forma are **fictional brands**, created to demonstrate design and
engineering capability across three very different problem shapes: art direction, technical
communication, and transactional UX.

---

## Quick start

Hosting requires no tooling at all — serve `dist/`. To work on the source you need Node 20+:

```bash
npm run build     # src/ → dist/
npm run serve     # preview at http://localhost:4173
npm run verify    # integrity checks; exits non-zero on failure
npm run check     # build + verify
```

There are no dependencies to install.

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

## Quality bar

These are enforced rather than aspirational — `npm run verify` fails the build on most of
them, and the rest were checked in a real browser.

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
