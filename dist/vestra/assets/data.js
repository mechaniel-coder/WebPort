/**
 * Vestra — content and catalogue.
 *
 * A fictional ready-to-wear label. Everything here is invented for
 * demonstration, but the *shapes* are real: the size charts are garment
 * measurements graded on a consistent rule, and the ease figures are the
 * numbers a pattern cutter would actually work to for each cut.
 */

export const brand = {
  name: 'Vestra',
  legalName: 'Vestra Atelier Ltd',
  founded: 2017,
  tagline: 'Cloth first, then the cut.',
  lede: `A small ready-to-wear label working in mill-finished natural cloth.
    Nine styles a season, graded across six sizes, made in a Porto workshop of
    forty-one people.`,
  city: 'Lisbon',
  address: {
    street: 'Rua da Boavista 84',
    locality: 'Lisbon',
    region: 'Lisboa',
    postal: '1200-068',
    country: 'PT',
  },
  email: 'atelier@example.com',
  phone: '+351 21 555 0148',
  returnDays: 30,
  freeShippingOver: 20000, // minor units
  currency: 'EUR',
};

/* ── Cloth ───────────────────────────────────────────────────────────────────
 *
 * `weave` selects a real structure in the textile renderer; `warp` and `weft`
 * are the two yarn colours it interlaces. The renderer draws the actual
 * interlacing rather than a flat fill, so a twill leans and a herringbone
 * reverses — which is the difference between a swatch and a colour chip.
 */
export const cloths = {
  'wool-flannel': {
    name: 'Wool flannel',
    weave: 'twill',
    warp: '#4a4d55', weft: '#6b6f79',
    weight: '420 gsm',
    mill: 'Abraham Moon, West Yorkshire',
    note: 'Milled and cropped so the twill line softens without losing its direction.',
  },
  'linen-canvas': {
    name: 'Linen canvas',
    weave: 'plain',
    warp: '#c9bda6', weft: '#ded4c0',
    weight: '260 gsm',
    mill: 'Libeco, Meulebeke',
    note: 'Wet-finished. It creases, and that is the point of it.',
  },
  'cotton-poplin': {
    name: 'Cotton poplin',
    weave: 'poplin',
    warp: '#e8e6e1', weft: '#f4f2ee',
    weight: '135 gsm',
    mill: 'Albini, Bergamo',
    note: 'Two-ply, mercerised. Takes a press and holds it.',
  },
  'herringbone-tweed': {
    name: 'Herringbone tweed',
    weave: 'herringbone',
    warp: '#3f4640', weft: '#8d9084',
    weight: '480 gsm',
    mill: 'Fox Brothers, Somerset',
    note: 'A 12-end herringbone, woven narrow and fulled hard.',
  },
  'merino-rib': {
    name: 'Merino rib',
    weave: 'rib',
    warp: '#7d4f43', weft: '#96604f',
    weight: '340 gsm',
    mill: 'Todd & Duncan, Kinross',
    note: 'A 2×2 rib that takes negative ease and returns to shape.',
  },
  'silk-crepe': {
    name: 'Silk crepe',
    weave: 'crepe',
    warp: '#2a2b30', weft: '#3a3c43',
    weight: '110 gsm',
    mill: 'Taroni, Como',
    note: 'Crepe-twisted in both directions, so it hangs without clinging.',
  },
};

/* ── Colourways ────────────────────────────────────────────────────────────── */

export const colourways = {
  slate: { name: 'Slate', hex: '#4a4d55' },
  bone: { name: 'Bone', hex: '#ded4c0' },
  chalk: { name: 'Chalk', hex: '#f4f2ee' },
  moss: { name: 'Moss', hex: '#5c6350' },
  rust: { name: 'Rust', hex: '#96604f' },
  ink: { name: 'Ink', hex: '#2a2b30' },
};

/* ── Garments ────────────────────────────────────────────────────────────────
 *
 * `sizes` are GARMENT measurements in centimetres — what a tape reads across
 * the finished piece, doubled where a chart would normally halve it. `ease` is
 * the gap the cut is designed to leave over the body at each point.
 *
 * Read them together and the grade is legible: the coat carries 24 cm of ease
 * at the bust and the rib top carries −6, which is why "I am a medium" cannot
 * be a property of a person.
 */
export const garments = [
  {
    slug: 'sculpted-wool-coat',
    name: 'Sculpted Wool Coat',
    category: 'outerwear',
    cloth: 'wool-flannel',
    price: 89000,
    colours: ['slate', 'ink', 'moss'],
    cut: 'Oversized, dropped shoulder',
    lede: 'A single-breasted coat cut wide through the body and closed high at the throat.',
    detail: `Cut from 420 gsm milled flannel with a full canvas front and a bemberg
      lining. The shoulder is dropped 4 cm past the natural line, which is what gives
      it the volume — it is not a larger size, it is a different shape.`,
    ease: { bust: 24, waist: 26, hip: 22, shoulder: 4 },
    sizes: {
      xs: { bust: 106, waist: 100, hip: 108, shoulder: 42 },
      s: { bust: 111, waist: 105, hip: 113, shoulder: 43.5 },
      m: { bust: 116, waist: 110, hip: 118, shoulder: 45 },
      l: { bust: 122, waist: 116, hip: 124, shoulder: 46.5 },
      xl: { bust: 128, waist: 122, hip: 130, shoulder: 48 },
      xxl: { bust: 134, waist: 128, hip: 136, shoulder: 49.5 },
    },
    model: { size: 's', height: 178, bust: '84', waist: '66', hip: '92' },
    care: ['Dry clean only', 'Brush after wear', 'Rest on a broad hanger'],
    featured: 1,
  },
  {
    slug: 'tailored-flannel-trouser',
    name: 'Tailored Flannel Trouser',
    category: 'trousers',
    cloth: 'wool-flannel',
    price: 34000,
    colours: ['slate', 'ink'],
    cut: 'Straight, mid rise',
    lede: 'A flat-front trouser cut straight from the knee with a turned hem.',
    detail: `Mid rise, sitting on the natural waist rather than below it. The leg is
      cut straight rather than tapered, so the flannel hangs from the hip instead of
      following the thigh.`,
    ease: { waist: 3, hip: 8, inseam: 0 },
    sizes: {
      xs: { waist: 66, hip: 92, inseam: 78 },
      s: { waist: 70, hip: 96, inseam: 79 },
      m: { waist: 75, hip: 101, inseam: 80 },
      l: { waist: 81, hip: 107, inseam: 81 },
      xl: { waist: 87, hip: 113, inseam: 82 },
      xxl: { waist: 93, hip: 119, inseam: 83 },
    },
    model: { size: 's', height: 178, bust: '84', waist: '66', hip: '92' },
    care: ['Dry clean', 'Press on the reverse', 'Hang by the hem'],
    featured: 4,
  },
  {
    slug: 'poplin-atelier-shirt',
    name: 'Poplin Atelier Shirt',
    category: 'shirting',
    cloth: 'cotton-poplin',
    price: 19500,
    colours: ['chalk', 'bone'],
    cut: 'Relaxed, boxy',
    lede: 'A boxy shirt in two-ply poplin, cut long enough to wear out.',
    detail: `A one-piece collar, a single patch pocket, and a back yoke deep enough to
      let the body hang clean. Mercerised poplin, so it presses sharp and keeps the
      press through a day.`,
    ease: { bust: 18, waist: 20, shoulder: 3 },
    sizes: {
      xs: { bust: 100, waist: 98, shoulder: 41 },
      s: { bust: 105, waist: 103, shoulder: 42.5 },
      m: { bust: 110, waist: 108, shoulder: 44 },
      l: { bust: 116, waist: 114, shoulder: 45.5 },
      xl: { bust: 122, waist: 120, shoulder: 47 },
      xxl: { bust: 128, waist: 126, shoulder: 48.5 },
    },
    model: { size: 's', height: 178, bust: '84', waist: '66', hip: '92' },
    care: ['Machine wash 30°', 'Iron damp', 'Do not tumble dry'],
    featured: 2,
  },
  {
    slug: 'merino-rib-top',
    name: 'Merino Rib Top',
    category: 'knitwear',
    cloth: 'merino-rib',
    price: 16500,
    colours: ['rust', 'ink', 'bone'],
    cut: 'Close, negative ease',
    lede: 'A 2×2 rib cut deliberately smaller than the body it is worn on.',
    detail: `Knitted in Kinross merino on a fine gauge. The rib is cut to 6 cm under
      the body measurement and stretches to meet it — which is why it looks small flat
      and fits close on. Size up only if you want it loose.`,
    ease: { bust: -6, waist: -8 },
    sizes: {
      xs: { bust: 74, waist: 62 },
      s: { bust: 79, waist: 67 },
      m: { bust: 84, waist: 72 },
      l: { bust: 90, waist: 78 },
      xl: { bust: 96, waist: 84 },
      xxl: { bust: 102, waist: 90 },
    },
    model: { size: 's', height: 178, bust: '84', waist: '66', hip: '92' },
    care: ['Hand wash cool', 'Dry flat', 'Never hang'],
    featured: 3,
  },
  {
    slug: 'linen-field-jacket',
    name: 'Linen Field Jacket',
    category: 'outerwear',
    cloth: 'linen-canvas',
    price: 48000,
    colours: ['bone', 'moss'],
    cut: 'Regular, set-in shoulder',
    lede: 'A four-pocket jacket in wet-finished linen canvas, unlined.',
    detail: `Unlined and flat-felled throughout, so it is finished on both faces. The
      linen softens across a season and holds a crease where it has been folded — the
      cloth records how it has been worn.`,
    ease: { bust: 14, waist: 15, hip: 13, shoulder: 1.5 },
    sizes: {
      xs: { bust: 96, waist: 90, hip: 100, shoulder: 39.5 },
      s: { bust: 101, waist: 95, hip: 105, shoulder: 41 },
      m: { bust: 106, waist: 100, hip: 110, shoulder: 42.5 },
      l: { bust: 112, waist: 106, hip: 116, shoulder: 44 },
      xl: { bust: 118, waist: 112, hip: 122, shoulder: 45.5 },
      xxl: { bust: 124, waist: 118, hip: 128, shoulder: 47 },
    },
    model: { size: 's', height: 178, bust: '84', waist: '66', hip: '92' },
    care: ['Machine wash 30°', 'Line dry', 'Press while damp'],
    featured: 5,
  },
  {
    slug: 'silk-crepe-dress',
    name: 'Silk Crepe Dress',
    category: 'dresses',
    cloth: 'silk-crepe',
    price: 62000,
    colours: ['ink', 'rust'],
    cut: 'Skimming, bias panels',
    lede: 'A bias-panelled dress in Como crepe, cut to skim rather than hold.',
    detail: `Six panels, four of them on the true bias, so the dress takes the body's
      line without gripping it. Crepe twist in both warp and weft keeps it off the
      skin — the reason a bias dress in flat silk clings and this one does not.`,
    ease: { bust: 6, waist: 7, hip: 5 },
    sizes: {
      xs: { bust: 88, waist: 71, hip: 95 },
      s: { bust: 93, waist: 76, hip: 100 },
      m: { bust: 98, waist: 81, hip: 105 },
      l: { bust: 104, waist: 87, hip: 111 },
      xl: { bust: 110, waist: 93, hip: 117 },
      xxl: { bust: 116, waist: 99, hip: 123 },
    },
    model: { size: 's', height: 178, bust: '84', waist: '66', hip: '92' },
    care: ['Dry clean only', 'Store on a padded hanger'],
    featured: 6,
  },
];

export const garmentBySlug = Object.fromEntries(garments.map((g) => [g.slug, g]));

/**
 * Per-size stock.
 *
 * Seeded from the slug so it is identical on every build and every reload —
 * the same reason the rest of this portfolio avoids Math.random(). Sizes that
 * are out of stock stay visible and disabled rather than disappearing, so the
 * grade still reads as a complete range.
 */
export function stockFor(slug, colour) {
  const seed = [...(slug + colour)].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const sizes = ['xs', 's', 'm', 'l', 'xl', 'xxl'];
  const out = {};
  sizes.forEach((size, index) => {
    const n = (seed >> (index * 3)) & 7;
    out[size] = n === 0 ? 0 : n;
  });
  return out;
}

/* ── Looks ───────────────────────────────────────────────────────────────────
 *
 * The marketing half. Each look names the garments in it, so the lookbook is
 * generated from the catalogue rather than maintained beside it — a piece that
 * is renamed or withdrawn cannot leave a broken reference behind.
 */
export const looks = [
  {
    slug: 'first-cold',
    index: '01',
    name: 'First Cold',
    season: 'Autumn/Winter',
    lede: 'The coat over almost nothing, which is how it was drawn.',
    note: `Volume at the top, nothing at the bottom. The coat carries 24 cm of ease
      through the body, so anything worn under it has to be flat or the shape closes up.`,
    pieces: ['sculpted-wool-coat', 'merino-rib-top', 'tailored-flannel-trouser'],
  },
  {
    slug: 'workroom',
    index: '02',
    name: 'Workroom',
    season: 'Year round',
    lede: 'What the cutting floor actually wears.',
    note: `Linen over poplin, both unlined, both washed. The jacket is a size up on the
      model on purpose — it is the one piece in the collection that reads better loose.`,
    pieces: ['linen-field-jacket', 'poplin-atelier-shirt', 'tailored-flannel-trouser'],
  },
  {
    slug: 'evening-nothing',
    index: '03',
    name: 'Evening, Nothing Formal',
    season: 'Autumn/Winter',
    lede: 'Crepe under flannel, which should not work and does.',
    note: `A bias dress under a coat cut for a body twice its width. The contrast is the
      point: the dress takes the line of the body, the coat refuses to.`,
    pieces: ['silk-crepe-dress', 'sculpted-wool-coat'],
  },
];

export const lookBySlug = Object.fromEntries(looks.map((l) => [l.slug, l]));

export const money = (minor, currency = brand.currency) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency, minimumFractionDigits: 0 })
    .format(minor / 100);
