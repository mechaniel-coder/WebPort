# Cinematic — a kit of eight

Eight full landing pages, one per site category from a "cinematic websites" prompt kit
(SaaS, portfolio, limited-run launch, agency, e-commerce, app, event, luxury membership),
built with Next.js, Tailwind CSS v4 and Framer Motion. All eight share a single design-token
system — near-black ground, a giant italic serif for display type, film grain and glass
surfaces — with only the accent colour changing per site.

This is a real Next.js app, not the zero-dependency static architecture the rest of the
[parent repo](../README.md) uses. `npm` is the actual toolchain here.

## Sites

| Route | Name | Category |
| --- | --- | --- |
| `/saas` | Aperture | Revenue operations SaaS |
| `/portfolio` | Noctis | Director & motion designer |
| `/launch` | Fragment | Limited-run product drop |
| `/agency` | Halide | Creative studio |
| `/ecommerce` | Fennimore | Leather goods |
| `/app` | Cadence | Adaptive running coach |
| `/event` | Meridian | Two-day operator summit |
| `/luxury` | Solace | Private travel membership |

`/` is an index linking to all eight.

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build — every route prerenders as static content
npm run lint
```

## Design system

Every token lives in one block in `src/app/globals.css` — 8pt spacing scale, a two-typeface
system (Fraunces display / Inter body), a fixed radius family, three-step tinted-shadow
elevation, and a single signature easing curve. The eight sites differ only in their
`--accent`/`--accent-ink`/`--accent-soft` values, set via a `[data-site="…"]` attribute — the
rest of the system is identical by construction.

Motion goes through Framer Motion's `MotionConfig` (`src/components/Providers.tsx`), which
sets `reducedMotion="user"` globally so transform-based animation is disabled automatically
for anyone with `prefers-reduced-motion` set — no per-component checks needed.

All copy, names and metrics are fictional demonstration content.
