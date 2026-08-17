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

All three are SIL Open Font License 1.1, which permits embedding and web use commercially.
Full texts in `licences/`.

| File | Family | Axes | Size |
| --- | --- | --- | --- |
| `fraunces-var.woff2` | Fraunces Variable | `opsz` 9–144, `wght` 100–900 | 66 KB |
| `schibsted-var.woff2` | Schibsted Grotesk Variable | `wght` 400–900 | 46 KB |
| `jetbrains-var.woff2` | JetBrains Mono Variable | `wght` 100–800 | 39 KB |

These are the Latin subsets from the Fontsource packages — already cut down from the full
families, which is why one file covers every weight.

Fraunces ships in several axis combinations; this is the `standard` cut (optical size plus
weight) rather than `full`. The `SOFT` and `WONK` axes are characterful but cost another
54 KB, and the design uses optical sizing far more: the same face is set at 200 px in a hero
and at 15 px in a caption, and `opsz` is what keeps the second one from looking spindly.

## Updating

```bash
npm install                      # dev-only; hosting never needs this
node tools/vendor.js             # re-copies from node_modules into this directory
```

Re-run the build and commit both `src/_lib/vendor/` and `dist/` together.
