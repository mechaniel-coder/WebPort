# Design

<!-- impeccable:design-schema 1 -->

Six visual worlds in one repository. The constraint that shapes all of them: no
photography, strict CSP, zero runtime dependencies, WCAG 2.2 AA, and a build that
must stay clone-and-serve.

## Why this document exists

The portfolio previously had **two looks across six sites**, not six.

| Site | Ground | Accent |
| --- | --- | --- |
| Aurelia | `#f6f2ea` | terracotta `#9a5f3f` |
| Forma | `#faf7f2` | signal red `#d8402a` |
| Vestra | `#f7f5f1` | brown `#7d4f43` |
| hub | `#f4f1ea` | — |
| Northwind | `#0b0e14` | blue `#4f8ff7` |
| lab | `#000000` | lime `#c3f53c` |

Four warm creams within a few points of each other, two near-blacks, and two
accents (Aurelia's and Vestra's) that were nearly the same brown. Each stylesheet
carried a comment claiming the sites did not look alike. At the token level that
was not true.

Both clusters are the highest-probability answer for their category: warm cream
plus high-contrast serif plus terracotta for anything hospitality, fashion or
craft; near-black plus a neon accent for anything technical. Two of the five
typefaces in use were on the same list.

Each world below is therefore recorded with **what it is an anti-reference to**,
because that is the part that stops it drifting back.

## The six worlds

### Aurelia — hospitality

**Marine layer, not sunset.** Aurelia is on the Sonoma coast, where the fog holds
for most of the year, the water is cold and the light is diffuse and blue-grey.
The golden-hour palette every boutique hotel reaches for describes about six
weeks of the year there.

Cool oyster ground with green in it (`#e4e8e6`), wet-slate ink (`#16211e`), and
one saturated colour — sea glass `#1d6a5c`, sampled from the caustics shader so
the brand colour and the artwork are one decision. Newsreader for display, whose
`opsz` axis carries an 11 rem hero and a 13 px caption from one file; Familjen
Grotesk for text.

**No monospace.** Rates, dates and counts were set in JetBrains Mono, which is a
costume: a nightly rate is not terminal output. Figures are Familjen with
`tabular-nums`, which is what actually makes a column line up.

*Anti-reference: warm cream, terracotta, sunset gradients, Fraunces, mono-as-metadata.*

### Northwind — B2B observability

**The page is light; only the instrument is dark.** Every vendor in this category
ships a near-black page with a blue accent, borrowed from the product's own
console — which puts the website in a costume, pretending to be the tool while
showing a picture of the tool inside itself.

Cold white page (`#f5f6f8`) read at a desk in the afternoon; the dashboard keeps
its dark surfaces, scoped to `.dashboard` so its components never learn they
moved. The product sits on the page as an object, and the screenshot is the
darkest thing on screen. Accent is amber `#8a4c08`: blue is the category default
and also the one hue an alerting tool cannot spend, because blue means nothing in
a severity scale.

Chart series are violet, cyan and red — separated on lightness as well as hue,
which is what survives the blue-yellow axis collapsing. Worst pair across normal,
protan, deutan and tritan: **44.3 dE**. The hero shader lays traces down as ink on
the page rather than adding glow to a dark field.

Red Hat Display, Text and Mono: one superfamily drawn for an operating-system
company's documentation, so the mono is a real terminal face rather than a costume.

*Anti-reference: dark SaaS marketing page, blue accent, Geist/Inter, glow-on-black hero.*

### Forma — design-object commerce

**The drawing, not the gallery.** Forma's artwork is generated vector geometry —
every object is drawn from parameters. A drawing belongs on a drawing sheet.

True white ground, hairline structure in cold blue-grey, dimensions and prices in
the mono, and one colour: cobalt `#17429e`, used the way a drafting stamp is — for
the thing that has been decided. Chivo and Chivo Mono, one superfamily, so a spec
table looks drawn rather than assembled.

Headlines are sentence case. Every display line used to be heavy uppercase, which
shouts, and a shop arguing that each object carries one idea should not raise its
voice about it.

*Anti-reference: warm cream, signal red, heavy uppercase display, Bricolage/Instrument Sans.*

### Vestra — fashion ready-to-wear

**The pattern room, not the magazine.** Vestra's argument is published
measurement: it prints the finished size of every garment and the ease each cut is
designed around.

Cloth-white ground, heavy rule, and **no brand colour at all** — the only
chromatic thing on any page is the cloth itself, through the colourway swatches
and the procedural weave drafts. Indigo `#26314f` appears only on affordances,
because indigo is a dye a cloth house actually owns.

Epilogue alone, at two extremes: hierarchy is weight and tracking rather than a
change of voice, and display sizes take weight *down* as they grow. The exception
is the fit engine's recommended size, which goes the other way — it is the one
number the page exists to produce.

*Anti-reference: didone display face, warm cream, editorial-spread size charts.*

### The hub — the studio

**A wall, and the work hung on it.** The studio site was on the same warm cream as
three of the four client sites it exists to present, so it competed with them.

Dark and achromatic. **No brand accent.** Every colour on the site belongs to one
of the four client brands and arrives through the case studies as their own
`--accent`. That is the strongest form of the claim the site makes: a studio whose
site has no colour of its own, because the colour is always the client's.

### The lab — in-house R&D

Dark, because you view a WebGL renderer in the dark — the use scene, not the
category. Same position as the hub: **no colour of its own**, and each experiment
supplies one drawn from what it actually renders — the renderer's rim light, the
tension colour a physics debug view uses, the blue a water column goes at depth,
the amber of a plotter.

The default was `#c3f53c`, a lime that is the single most predictable choice a
dark technical page can make.

**The lab is exempt from the shared motion layer on purpose.** Its own copy claims
no GSAP and no scroll library, so loading them would make the product lie about
itself. It reveals content with native CSS scroll-driven animation, and a check
asserts it ships none of those files.

## Rules that hold across all six

- **No typeface is shared between two client brands.** They are separate
  businesses. The hub and the lab share a pair because they are the same studio
  speaking.
- **A label never sits above a heading.** Roughly eighty kickers were removed;
  those carrying something the heading did not — a date, a count, a sector, a
  weave — moved below the title as captions. `pageHead`'s kicker slot is now a
  `note`/`tag`/`label` that renders *after* the heading, so the shape cannot come
  back by habit.
- **Light or dark comes from the use scene**, never from the category.
- **Every colour pair is measured**, not eyeballed: body text ≥ 4.5:1, and the
  categorical chart palette is validated against all three dichromacies.
- **Fallback metrics are measured in the engine**, not derived from font tables.
  Swapping a family means recomputing them.
- **Motion**: above the fold animates on load, below it on scroll, and nothing is
  hidden that is not definitely going to be shown.
