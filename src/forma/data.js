/**
 * Forma content model.
 *
 * A design-object storefront. The catalogue below drives the faceted shop, the
 * product pages, the variant pricing and the cart — the browser gets the same
 * data as a JSON island, so filtering and pricing never disagree with the
 * server-rendered pages.
 *
 * All money is in cents.
 */

export const brand = {
  name: 'Forma',
  tagline: 'Objects with one idea each.',
  lede: `Lighting, furniture and tableware made in small runs by people we have met, from
    materials that look better after a few years than they did on day one.`,
  email: 'hello@example.com',
  phone: '+1 (212) 555-0188',
  studio: '44 Provost Street, Brooklyn, NY 11222',
  founded: 2019,
};

/* ── Facets ────────────────────────────────────────────────────────────────── */

export const categories = [
  { id: 'lighting', label: 'Lighting' },
  { id: 'furniture', label: 'Furniture' },
  { id: 'objects', label: 'Objects' },
  { id: 'tableware', label: 'Tableware' },
];

export const materials = [
  { id: 'aluminium', label: 'Aluminium' },
  { id: 'steel', label: 'Steel' },
  { id: 'oak', label: 'Oak' },
  { id: 'glass', label: 'Glass' },
  { id: 'ceramic', label: 'Ceramic' },
];

export const priceBands = [
  { id: 'under-150', label: 'Under $150', max: 15000 },
  { id: '150-400', label: '$150 – $400', min: 15000, max: 40000 },
  { id: 'over-400', label: 'Over $400', min: 40000 },
];

export const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price, low to high' },
  { id: 'price-desc', label: 'Price, high to low' },
  { id: 'name', label: 'A to Z' },
];

/* ── Finishes ──────────────────────────────────────────────────────────────── */

/**
 * Finish definitions live in assets/render.js — the one module both the build
 * and the browser import — and are re-exported here so page modules have a
 * single obvious place to look. Defining them twice would let a swatch premium
 * drift away from the price the cart actually charges.
 */
export { FINISHES } from "./assets/render.js";

/* ── Catalogue ─────────────────────────────────────────────────────────────── */

export const products = [
  {
    slug: 'halo-pendant',
    name: 'Halo Pendant',
    category: 'lighting',
    material: 'aluminium',
    price: 34000,
    shape: 'pendant',
    featured: 1,
    finishes: ['chalk', 'ink', 'ochre', 'brass'],
    sizes: [
      { id: 'sm', label: '340 mm', premium: 0 },
      { id: 'lg', label: '480 mm', premium: 9000 },
    ],
    tagline: 'A spun aluminium dome and nothing else.',
    lede: `Spun from a single disc of aluminium on a lathe in Rhode Island, then hand-finished.
      The whole object is one operation, which is the point.`,
    detail: `The shade is spun rather than pressed, so the wall thickness varies slightly from
      rim to crown and the light falls off the way it does in a hand-thrown bowl. Wired for a
      standard E26 socket with a 2.5 m braided cord you can shorten yourself.`,
    specs: [
      ['Diameter', '340 mm or 480 mm'],
      ['Drop', 'Up to 2.5 m, adjustable'],
      ['Material', 'Spun aluminium, powder-coated'],
      ['Fitting', 'E26, bulb not included'],
      ['Weight', '1.4 kg'],
    ],
    care: 'Dust with a dry cloth. Do not use solvents on the powder coat.',
  },
  {
    slug: 'arc-floor-lamp',
    name: 'Arc Floor Lamp',
    category: 'lighting',
    material: 'steel',
    price: 69000,
    shape: 'arclamp',
    featured: 2,
    finishes: ['ink', 'chalk', 'rust'],
    sizes: [{ id: 'std', label: '1.9 m', premium: 0 }],
    tagline: 'Reaches over a sofa without standing in front of it.',
    lede: `A single bent steel tube weighted at the foot, so it leans over a seat from a metre
      and a half away and stays exactly where you put it.`,
    detail: `The arc is bent from one 22 mm tube — no joints, no visible fixings. The base is a
      solid steel disc heavy enough that the lamp does not need to be anchored, which means it
      also does not need a floor plate you have to work around.`,
    specs: [
      ['Height', '1.9 m'],
      ['Reach', '1.5 m'],
      ['Material', 'Bent steel tube, cast base'],
      ['Fitting', 'E26 with inline dimmer'],
      ['Weight', '11 kg'],
    ],
    care: 'Wipe with a damp cloth. The base will patina at the edges; this is expected.',
  },
  {
    slug: 'cairn-side-table',
    name: 'Cairn Side Table',
    category: 'furniture',
    material: 'oak',
    price: 52000,
    shape: 'sidetable',
    featured: 3,
    finishes: ['oak', 'smoked', 'ink'],
    sizes: [
      { id: 'low', label: '420 mm', premium: 0 },
      { id: 'tall', label: '560 mm', premium: 7000 },
    ],
    tagline: 'Three stacked solids that happen to hold a cup.',
    lede: `Turned from solid European oak in three sections, stacked and doweled. It is
      considerably heavier than it looks, which is the honest consequence of being solid.`,
    detail: `Each section is turned separately so the grain runs vertically through all three,
      then joined with oak dowels and no metal. Finished with a hardwax oil that can be
      re-applied at home rather than needing to go back to a workshop.`,
    specs: [
      ['Height', '420 mm or 560 mm'],
      ['Top diameter', '380 mm'],
      ['Material', 'Solid European oak'],
      ['Finish', 'Hardwax oil'],
      ['Weight', '9.5 kg'],
    ],
    care: 'Re-oil once a year. Wipe spills promptly; oak marks with standing water.',
  },
  {
    slug: 'column-stool',
    name: 'Column Stool',
    category: 'furniture',
    material: 'oak',
    price: 29500,
    shape: 'stool',
    featured: 6,
    finishes: ['oak', 'smoked', 'moss', 'ink'],
    sizes: [{ id: 'std', label: '450 mm', premium: 0 }],
    tagline: 'A seat, a side table, or a step. Usually all three.',
    lede: `A solid oak cylinder with a dished top. It works as a stool because the dish is
      shallow enough to sit on and deep enough to notice.`,
    detail: `The dish is cut on a five-axis router to about 14 mm at the centre — enough to
      register under you without turning it into a bowl. The bottom is relieved by 3 mm so it
      sits flat on floors that are not.`,
    specs: [
      ['Height', '450 mm'],
      ['Diameter', '320 mm'],
      ['Material', 'Solid European oak'],
      ['Finish', 'Hardwax oil'],
      ['Weight', '7.2 kg'],
    ],
    care: 'Re-oil once a year. Suitable for occasional outdoor use under cover.',
  },
  {
    slug: 'prism-vase',
    name: 'Prism Vase',
    category: 'objects',
    material: 'glass',
    price: 9500,
    shape: 'vase',
    featured: 4,
    finishes: ['clear', 'amber', 'moss'],
    sizes: [
      { id: 'sm', label: '180 mm', premium: 0 },
      { id: 'md', label: '260 mm', premium: 3500 },
    ],
    tagline: 'Six flat faces, so it never rolls and always catches light.',
    lede: `Mould-blown into a hexagonal form, then annealed slowly enough that the faces stay
      genuinely flat rather than pillowing.`,
    detail: `Blown in a family glassworks outside Prague that has been running since 1946.
      Because it is mould-blown rather than pressed, the wall thickness varies and the faces
      refract differently as you move — a pressed vase does not do this.`,
    specs: [
      ['Height', '180 mm or 260 mm'],
      ['Width', '110 mm across flats'],
      ['Material', 'Mould-blown soda-lime glass'],
      ['Opening', '52 mm'],
      ['Weight', '0.9 kg'],
    ],
    care: 'Hand wash. Not dishwasher safe — the thermal shock will craze the faces.',
  },
  {
    slug: 'meridian-mirror',
    name: 'Meridian Mirror',
    category: 'objects',
    material: 'steel',
    price: 41000,
    shape: 'mirror',
    featured: 5,
    finishes: ['ink', 'chalk', 'brass'],
    sizes: [
      { id: 'sm', label: '500 mm', premium: 0 },
      { id: 'lg', label: '700 mm', premium: 12000 },
    ],
    tagline: 'A circle held by a line.',
    lede: `Low-iron mirror glass in a steel ring, hung from a single bar that reads as a
      drawn line rather than a bracket.`,
    detail: `Low-iron glass rather than standard float, so it does not put a green cast on
      everything it reflects. The hanging bar is structural, not decorative — the ring pivots
      on it, so the angle is adjustable by hand and holds by friction.`,
    specs: [
      ['Diameter', '500 mm or 700 mm'],
      ['Depth', '38 mm'],
      ['Material', 'Low-iron mirror, powder-coated steel'],
      ['Mounting', 'Single point, hardware included'],
      ['Weight', '4.8 kg'],
    ],
    care: 'Clean with glass cleaner on a cloth, never sprayed directly at the frame joint.',
  },
  {
    slug: 'quarry-bowl',
    name: 'Quarry Bowl',
    category: 'tableware',
    material: 'ceramic',
    price: 12000,
    shape: 'bowl',
    featured: 7,
    finishes: ['chalk', 'moss', 'rust'],
    sizes: [
      { id: 'md', label: '240 mm', premium: 0 },
      { id: 'lg', label: '300 mm', premium: 4000 },
    ],
    tagline: 'A serving bowl with an unglazed foot, so it grips the table.',
    lede: `Thrown in stoneware, glazed inside and to the rim, and left raw underneath. The
      unglazed foot is the reason it does not slide.`,
    detail: `Fired to 1,260°C, which makes it genuinely vitrified rather than merely hard —
      it will not absorb oil over time the way earthenware does. The glaze breaks lighter over
      the throwing rings, so the form stays legible.`,
    specs: [
      ['Diameter', '240 mm or 300 mm'],
      ['Height', '95 mm'],
      ['Material', 'Stoneware, 1,260°C'],
      ['Capacity', '1.8 L or 3.2 L'],
      ['Weight', '1.1 kg'],
    ],
    care: 'Dishwasher and oven safe to 200°C. Do not put on a direct flame.',
  },
  {
    slug: 'facet-carafe',
    name: 'Facet Carafe',
    category: 'tableware',
    material: 'glass',
    price: 11000,
    shape: 'carafe',
    featured: 8,
    finishes: ['clear', 'amber'],
    sizes: [{ id: 'std', label: '1 L', premium: 0 }],
    tagline: 'Pours without dribbling. This took four prototypes.',
    lede: `A one-litre carafe with a cut lip that actually breaks the stream. Most carafes do
      not, and it is the only thing anyone notices.`,
    detail: `The lip profile went through four rounds before it stopped running down the side.
      The faceted body is not styling — it is what lets you grip a wet carafe with one hand.`,
    specs: [
      ['Capacity', '1 L'],
      ['Height', '230 mm'],
      ['Material', 'Mould-blown soda-lime glass'],
      ['Lip', 'Cut and fire-polished'],
      ['Weight', '0.6 kg'],
    ],
    care: 'Hand wash. The cut lip will dull in a dishwasher.',
  },
];

export const productBySlug = Object.fromEntries(products.map((item) => [item.slug, item]));

/* ── Commerce rules ────────────────────────────────────────────────────────── */

// Defined in assets/commerce.js, the module both the build and the browser use.

export { COMMERCE } from "./assets/commerce.js";

/* ── Collections ───────────────────────────────────────────────────────────── */

export const collections = [
  {
    slug: 'first-light',
    name: 'First Light',
    blurb: 'The two lamps, photographed at the hour they were designed for.',
    items: ['halo-pendant', 'arc-floor-lamp'],
    palette: ['#d8973c', '#e9e5dd', '#23252a'],
  },
  {
    slug: 'solid-ground',
    name: 'Solid Ground',
    blurb: 'Oak that gets better with a decade of use and no maintenance to speak of.',
    items: ['cairn-side-table', 'column-stool'],
    palette: ['#d9b98a', '#8a6a4c', '#5d7355'],
  },
  {
    slug: 'set-the-table',
    name: 'Set the Table',
    blurb: 'Things that are used daily and are therefore allowed to be plain.',
    items: ['quarry-bowl', 'facet-carafe', 'prism-vase'],
    palette: ['#dfe8e6', '#dda85e', '#b4553c'],
  },
];

/* ── Editorial ─────────────────────────────────────────────────────────────── */

export const materialNotes = [
  {
    name: 'Aluminium',
    text: `Spun, not pressed. Spinning leaves a slightly uneven wall and a surface that takes
      powder coat evenly; pressing is cheaper and gives you a shape with no memory of how it
      was made.`,
  },
  {
    name: 'Oak',
    text: `European oak from managed forests in Bavaria, air-dried for two years before it is
      touched. Kiln-dried oak is faster and moves more in a heated room.`,
  },
  {
    name: 'Glass',
    text: `Mould-blown in a family glassworks outside Prague. The wall thickness varies by a
      millimetre or so across a piece, which is why the light behaves differently as you move.`,
  },
  {
    name: 'Stoneware',
    text: `Fired to 1,260°C, which vitrifies the body properly. Below about 1,200°C you get
      something that looks the same and slowly absorbs cooking oil for the rest of its life.`,
  },
  {
    name: 'Steel',
    text: `Bent from tube rather than cast or welded from sections, so there are no joints to
      fail and nothing to align. It is harder to make and much harder to make badly.`,
  },
];

export const faqs = [
  {
    question: 'How long does delivery take?',
    answer: `Three to five working days in the continental US. Furniture ships freight and
      takes seven to ten, with a delivery window you choose rather than one we assign.`,
  },
  {
    question: 'What is the returns policy?',
    answer: `Thirty days, unused, in the original packaging, and we pay the return shipping.
      Made-to-order finishes are the exception and are marked as such at checkout.`,
  },
  {
    question: 'Do you ship internationally?',
    answer: `To the UK, EU, Canada and Japan. Duties are calculated at checkout and paid up
      front, so nothing arrives with a bill attached to it.`,
  },
  {
    question: 'Is anything made to order?',
    answer: `Brass and smoked oak finishes are, and add about three weeks. Everything else
      ships from stock in Brooklyn.`,
  },
  {
    question: 'Can I see these in person?',
    answer: `Yes — the Brooklyn studio is open Thursday to Saturday, and eleven stockists
      carry parts of the range. Both are listed on the stockists page.`,
  },
  {
    question: 'Do you offer trade pricing?',
    answer: `Yes, for architects, interior designers and hospitality projects. Email us with
      the project and we will set up an account rather than make you fill in a portal.`,
  },
];

export const stockists = [
  { city: 'New York', name: 'Forma Studio', detail: '44 Provost Street, Brooklyn · Thu–Sat, 11–6', own: true },
  { city: 'New York', name: 'Field Notes Supply', detail: 'Lower East Side · Full range' },
  { city: 'Los Angeles', name: 'Marrow', detail: 'Silver Lake · Lighting and objects' },
  { city: 'Chicago', name: 'Grain & Gable', detail: 'West Loop · Furniture only' },
  { city: 'London', name: 'Ossett', detail: 'Shoreditch · Full range' },
  { city: 'Copenhagen', name: 'Stilleben Nord', detail: 'Indre By · Tableware and objects' },
  { city: 'Berlin', name: 'Halle 9', detail: 'Kreuzberg · Lighting only' },
  { city: 'Tokyo', name: 'Kinari', detail: 'Nakameguro · Full range' },
  { city: 'Toronto', name: 'Mjölk', detail: 'Junction · Objects and tableware' },
  { city: 'Melbourne', name: 'Curated Spaces', detail: 'Fitzroy · Furniture and lighting' },
  { city: 'Amsterdam', name: 'Vlak', detail: 'Jordaan · Full range' },
];
