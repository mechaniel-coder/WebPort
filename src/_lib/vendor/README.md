# Vendored third-party assets

These files are committed rather than installed so that hosting stays a clone-and-serve
operation: `dist/` needs no `npm install`, no CDN and no external request at runtime. The
site's Content-Security-Policy allows no third-party origins, so anything the browser loads
has to live here.

## JavaScript — `js/`

| File | Version | Licence |
| --- | --- | --- |
| `gsap.min.js` | GSAP 3.15.0 | [Standard "no charge" licence](https://gsap.com/standard-license) |
| `ScrollTrigger.min.js` | GSAP 3.15.0 | as above |
| `lenis.min.js` | Lenis 1.3.26 | MIT — `licences/MIT-Lenis.txt` |

All three are UMD builds loaded with plain `<script>` tags, which is why there is no bundler
in this repo. They attach `window.gsap`, `window.ScrollTrigger` and `window.Lenis`.

GSAP's standard licence permits use in websites, including commercial ones, at no charge.
It is not an OSI open-source licence: it restricts redistribution of GSAP *itself* as part
of a competing product or a tool that lets others build animations. Serving it as part of a
website is exactly what it is for.

## Fonts — `fonts/`

All eleven are SIL Open Font License 1.1, which permits embedding and web use commercially.
Full texts in `licences/`.

| File | Family | Axes | Size | Used by |
| --- | --- | --- | --- | --- |
| `newsreader-var.woff2` | Newsreader | `opsz` 6–72, `wght` 200–800 | 128 KB | Aurelia |
| `familjen-var.woff2` | Familjen Grotesk | `wght` 400–700 | 18 KB | Aurelia |
| `redhat-display-var.woff2` | Red Hat Display | `wght` 300–900 | 29 KB | Northwind |
| `redhat-text-var.woff2` | Red Hat Text | `wght` 300–700 | 29 KB | Northwind |
| `redhat-mono-var.woff2` | Red Hat Mono | `wght` 300–700 | 21 KB | Northwind |
| `chivo-var.woff2` | Chivo | `wght` 100–900 | 32 KB | Forma |
| `chivo-mono-var.woff2` | Chivo Mono | `wght` 100–900 | 25 KB | Forma |
| `epilogue-var.woff2` | Epilogue | `wght` 100–900 | 34 KB | Vestra |
| `spline-mono-var.woff2` | Spline Sans Mono | `wght` 300–700 | 35 KB | Vestra |
| `schibsted-var.woff2` | Schibsted Grotesk | `wght` 400–900 | 45 KB | hub, lab |
| `jetbrains-var.woff2` | JetBrains Mono | `wght` 100–800 | 39 KB | hub, lab |

These are the Latin subsets from the Fontsource packages — already cut down from the full
families, which is why one file covers every weight.

No family is shared between two client brands: Aurelia, Northwind, Forma and Vestra are
separate businesses and a shared typeface would say otherwise. The hub and the lab do share
a pair, because they are the same studio speaking.

Newsreader is the outlier on size, and deliberately: it ships in several axis combinations
and this is the `standard` cut, optical size plus weight, rather than weight alone. Aurelia
sets the same face at 176 px in a hero and at 13 px in a table, and `opsz` is what keeps the
second from looking spindly and the first from looking clotted. Only two files per site are
preloaded, so the rest never block a first paint.

Every family has a metric-matched fallback declared in `src/_lib/type.css`. Those numbers
were measured in the rendering engine through canvas metrics, not read out of the font
tables — see the note in that file. **If a family here is swapped, they must be recomputed;
they are specific to these exact files.**

## Updating

```bash
npm install                      # dev-only; hosting never needs this
node tools/vendor.js             # re-copies from node_modules into this directory
```

Re-run the build and commit both `src/_lib/vendor/` and `dist/` together.
