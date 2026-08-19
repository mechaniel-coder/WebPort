/**
 * Hub content — the case studies.
 *
 * These are the client-winning half of the portfolio. A gallery shows what was
 * made; a case study shows the constraint, the decision, and the thing that was
 * traded away. Each one names its signature system and says how it was verified,
 * because "we built a booking engine" is a claim and "the calendar is a
 * role=grid with roving tabindex, checked in Chromium" is evidence.
 */

export const studies = [
  {
    slug: 'aurelia',
    name: 'Aurelia',
    sector: 'Hospitality',
    live: '/aurelia/',
    accent: '#4fae9a',
    year: '2026',
    role: 'Design system, front end, booking engine',
    pages: 15,
    summary: 'A coastal retreat with a booking engine built from scratch.',
    oneLiner: `A twenty-two room hotel that needed to take bookings without handing the
      guest experience to a third-party widget.`,

    brief: `Boutique properties almost always outsource booking to an embedded widget. It
      works, and it is also the moment the site stops being the property's and starts being
      the vendor's — different typography, different colours, an iframe that cannot be styled,
      and a guest who has visibly left the hotel's website halfway through paying it money.
      Aurelia wanted the whole journey to stay inside its own design.`,

    constraints: [
      'The booking flow had to look and behave as though it were part of the site, because it is.',
      'Rates move with season and day of week; the published rate table and the quoted price must never disagree.',
      'It had to be fully operable by keyboard and screen reader — a date picker is the single most commonly broken widget on the web.',
      'No date library, no form library, no framework.',
    ],

    approach: [
      {
        title: 'One rate engine, two consumers',
        text: `Rate, availability and quoting logic lives in a single dependency-free module
          that the build imports to print "from $X" on room pages and the browser imports to
          quote the actual stay. There is no second implementation to drift, so the table on
          the rooms page is arithmetically the same as the number at checkout.`,
      },
      {
        title: 'The calendar is a real grid',
        text: `Not a listbox pretending to be a calendar. A role="grid" with roving tabindex,
          arrow / Home / End / PageUp / PageDown navigation, and an accessible name per cell
          giving the full date, its selection state and its availability — a bare day number
          tells a screen-reader user nothing.`,
      },
      {
        title: 'Availability that does not lie',
        text: `Choosing an arrival computes the furthest reachable departure — the night
          before the next sold-out night — and disables everything past it. The alternative
          is letting someone assemble a range that cannot be fulfilled and telling them so
          three steps later.`,
      },
      {
        title: 'Deterministic, not random',
        text: `Occupancy is a seeded hash of room and date rather than Math.random(), so the
          calendar is stable across reloads instead of rearranging itself under the guest.`,
      },
    ],

    tradeoff: `The booking flow needs JavaScript, because availability is computed in the
      browser. Rather than pretend otherwise, the page ships a noscript block with the phone
      number and email — which is what a twenty-two room property would actually want.`,

    verified: [
      'A booking driven end to end in Chromium: dates, room, validation rejection, guest details, review, confirmation.',
      'Keyboard model asserted directly — one cell in the tab order, arrows moving exactly one day and one week, PageDown changing month.',
      'Every page checked for console errors, broken links, metadata and unlabelled graphics.',
    ],

    signature: 'Accessible date-range booking engine',
  },

  {
    slug: 'northwind',
    name: 'Northwind',
    sector: 'B2B SaaS',
    live: '/northwind/',
    accent: '#e2932c',
    year: '2026',
    role: 'Design system, front end, data visualisation',
    pages: 13,
    summary: 'An observability platform that demonstrates itself on the marketing site.',
    oneLiner: `A developer-tools company whose product is charts, sold on a site that was
      showing screenshots of charts.`,

    brief: `Northwind sells observability to engineers, and engineers do not believe
      screenshots. The old site led with a static PNG of a dashboard, which is the least
      persuasive possible way to sell a product whose entire value is how good its dashboard
      is. The brief was to put the actual thing on the page.`,

    constraints: [
      'The dashboard had to be interactive and fast, without shipping a charting library to a marketing page.',
      'It had to survive a failed script load — a broken demo is worse than a screenshot.',
      'Every value a chart shows must be reachable without hovering, and identity must never rest on colour alone.',
      'Pricing needed to be honest enough that an engineer could check the arithmetic.',
    ],

    approach: [
      {
        title: 'Charts rendered twice, written once',
        text: `The chart module runs at build time and in the browser. The SVG is in the
          served HTML before any script executes, so the demo degrades to a real, readable
          chart rather than an empty box, and the client upgrades it with range switching, a
          crosshair and live updates.`,
      },
      {
        title: 'The palette was validated, not chosen',
        text: `The categorical series colours were run through a colour-vision validator
          against this site's exact dark surface — lightness band, chroma floor, deutan and
          tritan separation, and contrast. The interface accent is a neighbouring step of the
          same blue, so the UI never competes with the data.`,
      },
      {
        title: 'Hover is not the only way in',
        text: `The crosshair snaps to the nearest data index and lists every series at that
          point; the identical readout is produced by arrow keys. Every chart also has a table
          view, so no number on the page is gated behind a pointer.`,
      },
      {
        title: 'Pricing with real crossovers',
        text: `The calculator does genuine tiered arithmetic — platform fee, per-unit overage
          beyond each allowance, a retention multiplier on storage, an annual discount. There
          are volumes where Team beats Business and volumes where it does not, and it will
          tell you which one you are in.`,
      },
    ],

    tradeoff: `The dashboard runs on generated data rather than a live feed, which is stated
      on the page. Using a seeded generator instead of Math.random() means it is at least
      internally consistent and identical on every reload.`,

    verified: [
      'Range switching, crosshair, keyboard readout, table views and the live ticker all driven in Chromium.',
      'Pricing asserted to exact figures — $359 for Team at 100 GB and 25 hosts — not merely that a number appeared.',
      'Palette re-validated against the shipped surface colour; every text colour clears 4.5:1.',
    ],

    signature: 'Live SVG dashboard and tiered pricing calculator',
  },

  {
    slug: 'forma',
    name: 'Forma',
    sector: 'E-commerce',
    live: '/forma/',
    accent: '#7f9fe8',
    year: '2026',
    role: 'Design system, front end, commerce layer',
    pages: 19,
    summary: 'A design-object storefront with a complete client-side commerce layer.',
    oneLiner: `A small-run furniture brand that needed a storefront before it had a
      photography budget.`,

    brief: `Forma makes eight products in small runs. Product photography for eight objects
      in ten finishes is forty-plus shots and a studio day, and they had neither yet. The
      question was whether a storefront could be genuinely good without any photographs at
      all — not as a placeholder, but as the actual design.`,

    constraints: [
      'No photography, and no stock imagery — nothing hotlinked, no licensing to clear.',
      'Filtering had to be shareable and survive the back button.',
      'The cart had to persist and not contradict itself across tabs.',
      'No payment details collected anywhere, at any point.',
    ],

    approach: [
      {
        title: 'The objects are drawn',
        text: `Each product is parametric SVG built from flat geometry, a hard contour and
          two tones taken from the selected finish. Choosing a finish re-renders the object
          rather than tinting an image — which is the honest version of a swatch, and
          incidentally makes every finish available on day one instead of after a reshoot.`,
      },
      {
        title: 'Filters live in the URL',
        text: `Facet state round-trips through the query string, so a filtered view is
          shareable and bookmarkable and the back button moves through filter states instead
          of leaving the page. Values within a facet are OR-ed and separate facets AND-ed —
          what shoppers expect, and the opposite of the naive implementation.`,
      },
      {
        title: 'Filtering never blanks the page',
        text: `The full catalogue is server-rendered; the client reorders and hides it rather
          than rebuilding. Crawlers see every product, the page works without scripting, and
          nothing flashes on a filter change.`,
      },
      {
        title: 'Arithmetic that matches the real world',
        text: `One pricing function serves the card, the product page and the cart. Tax is
          charged on goods plus shipping, which is how most US states work and the thing
          storefront demos routinely get wrong.`,
      },
    ],

    tradeoff: `Drawn objects communicate proportion, finish and form honestly, and communicate
      material texture not at all. For a brand selling the feel of oiled oak that is a real
      limitation — the recommendation is drawn art for the catalogue and photography for the
      detail pages once there is a budget for it.`,

    verified: [
      'Facet algebra, URL round-tripping, variant premium stacking and cross-tab cart sync driven in Chromium.',
      'Order totals asserted exactly: $225.00 subtotal, $20.66 tax, $263.66 total.',
      'Absence of payment fields asserted by inspecting form controls, not the marketing copy.',
    ],

    signature: 'Faceted catalogue, variant pricing and persistent cart',
  },

  {
    slug: 'vestra',
    name: 'Vestra',
    sector: 'Fashion',
    live: '/vestra/',
    accent: '#a8b6dd',
    year: '2026',
    role: 'Design system, front end, fit engine, cloth simulation',
    pages: 18,
    summary: 'A ready-to-wear label with a measurement-based fit engine and simulated cloth.',
    oneLiner: `A clothing label that wanted to sell online without pretending sizing is
      simple.`,

    brief: `Vestra grade nine styles across six sizes in six very different cloths. Their
      returns were almost entirely sizing, and their size chart was the usual thing: a table
      of body measurements with no opinion, leaving a customer to guess whether a coat cut
      with 24 cm of ease and a rib top cut with minus 6 are the same size on them. They are
      not.`,

    constraints: [
      'No photography — and unlike furniture, clothing cannot simply be drawn.',
      'Sizing had to give an answer, not a table, and admit when it was uncertain.',
      'Five markets, so every size needed UK, US, EU, IT and JP labels.',
      'No payment details collected anywhere, at any point.',
    ],

    approach: [
      {
        title: 'Ease, not size',
        text: `The engine holds the finished garment measurements and the ease each cut is
          designed around, then scores every size on how close the actual gap lands to the
          intended one. That is why the same body gets different sizes across the collection
          — and why the site can explain each one rather than just asserting it.`,
      },
      {
        title: 'It says when it does not know',
        text: `When two sizes score within a threshold the answer is both, with the tradeoff
          in words: which point is snug in one and as intended in the other. The threshold
          was tuned against a spread of body types — at its first value it hedged on half of
          all combinations, which is a fit finder that has told you nothing.`,
      },
      {
        title: 'The cloth is simulated, not photographed',
        text: `Cloth is not an object to depict, it is a behaviour — how it falls and how
          long it takes to settle is what separates 420 gsm flannel from 110 gsm crepe, and
          a still photograph cannot show it. The hero runs the studio's own Verlet solver
          with parameters derived from each cloth's real weight and stiffness.`,
      },
      {
        title: 'Swatches are woven, not filled',
        text: `Every material is drawn from its actual weave draft — which yarns pass over
          which, and on what diagonal. A twill leans, a herringbone reverses, poplin carries
          a finer warp than weft. It costs a few hundred bytes per cloth and it is the
          difference between a swatch and a paint chip.`,
      },
    ],

    tradeoff: `The fit engine models the body as four circumferences, which is what a tape
      measure gives you and not what a body is. It cannot see posture, proportion or where
      someone carries their height, so it is honest about ease and silent about drape. A
      brand with the budget should pair it with real fit photography on more than one body —
      the engine narrows the question, it does not close it.`,

    verified: [
      'Fit recommendations asserted against exact figures, including negative ease on the rib knit.',
      'Between-sizes and off-chart paths driven in Chromium, not just the confident case.',
      'Cloth simulation asserted for stability and for settling, not merely for running.',
      'Absence of payment fields asserted by inspecting form controls, not the copy.',
    ],

    signature: 'Measurement-based fit engine and simulated cloth',
  },
];

export const studyBySlug = Object.fromEntries(studies.map((study) => [study.slug, study]));

/* ── About ─────────────────────────────────────────────────────────────────── */

export const principles = [
  {
    title: 'The design system comes first',
    text: `Every project starts with tokens — colour, type scale, spacing, motion — and the
      pages are assembled from them. It is why three sites built in the same repository do
      not look like three skins of one template.`,
  },
  {
    title: 'Accessibility is not a phase',
    text: `Custom widgets get the correct ARIA and a real keyboard model while they are being
      written, because retrofitting a date picker is more expensive than building it properly
      and usually does not happen.`,
  },
  {
    title: 'One implementation, not two',
    text: `Where the server and the browser both need the same logic — rates, prices, cart
      maths — it lives in one module both import. Two copies of a pricing rule is a bug
      waiting for a deadline.`,
  },
  {
    title: 'Claims get verified',
    text: `Every interactive system on this site is driven end to end in a real browser, and
      the assertions check exact figures rather than that something appeared. If a number is
      quoted in a case study, a test produced it.`,
  },
];

export const capabilities = [
  ['Design', 'Design systems, art direction, interaction design, responsive layout'],
  ['Front end', 'Semantic HTML, modern CSS, vanilla JS, SVG, progressive enhancement'],
  ['Accessibility', 'WCAG 2.2 AA, ARIA authoring practices, keyboard models, screen-reader testing'],
  ['Performance', 'Static generation, zero-dependency delivery, no layout shift, performance budgets'],
  ['SEO', 'Structured data, Open Graph, sitemaps, canonical strategy'],
  ['Handoff', 'Documented build, integrity checks in CI, hosting guides written for non-developers'],
];

export const faqs = [
  {
    question: 'What does a project like these cost?',
    answer: `The three sites here are the scope of a $25,000–$60,000 engagement depending on
      content volume and how much of the copy we write. The README itemises exactly what is
      included so it can be compared line by line against another quote.`,
  },
  {
    question: 'How long does it take?',
    answer: `Six to ten weeks for a site of this depth — roughly two weeks on the design
      system, four to six building, and two on content, accessibility and handoff.`,
  },
  {
    question: 'Do you work with an existing brand?',
    answer: `Usually. If there are brand guidelines we build the design system from them; if
      there are not, defining one is the first phase and it is the part that makes everything
      afterwards go quickly.`,
  },
  {
    question: 'Why no React?',
    answer: `For marketing sites and storefronts a framework mostly adds weight and a build
      chain someone has to maintain. These ship a few kilobytes of JavaScript and will still
      run in five years. For an application with real client-side state, the answer changes.`,
  },
  {
    question: 'Who hosts it?',
    answer: `You do, anywhere. The output is static files with no runtime dependencies —
      Netlify, Cloudflare Pages, S3, or a directory on your own server. There is nothing to
      keep patched.`,
  },
];
