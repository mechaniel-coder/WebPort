/**
 * Forma product renderer.
 *
 * Every product is drawn rather than photographed, from one vocabulary: flat
 * geometry, a hard 3px contour, and two tones per object (body and shade) taken
 * from the selected finish.
 *
 * This module is dependency-free and imported by both the build (to render the
 * catalogue and product pages into HTML) and the browser (to redraw when a
 * finish is chosen). Choosing "Ochre" genuinely re-renders the object, which is
 * the honest version of a swatch — a tinted photograph is not.
 */

export const FINISHES = {
  chalk: { label: "Chalk", body: "#e9e5dd", shade: "#cdc7bb", premium: 0 },
  ochre: { label: "Ochre", body: "#d8973c", shade: "#b57a26", premium: 0 },
  ink: { label: "Ink", body: "#23252a", shade: "#15171a", premium: 0 },
  moss: { label: "Moss", body: "#5d7355", shade: "#485b41", premium: 0 },
  rust: { label: "Rust", body: "#b4553c", shade: "#94422d", premium: 0 },
  brass: { label: "Brass", body: "#c9a227", shade: "#a2811b", premium: 4000 },
  oak: { label: "Natural oak", body: "#d9b98a", shade: "#bd9a6b", premium: 0 },
  smoked: { label: "Smoked oak", body: "#8a6a4c", shade: "#6d5139", premium: 6000 },
  clear: { label: "Clear", body: "#dfe8e6", shade: "#c2d2cf", premium: 0 },
  amber: { label: "Amber", body: "#dda85e", shade: "#bd8840", premium: 0 },
};

const LINE = '#101010';
const STROKE = 3;

/* ── Shapes ────────────────────────────────────────────────────────────────── */

/**
 * Each shape draws into a 400×400 box. `body` is the lit face, `shade` the
 * turned-away one — enough to read as an object without pretending to be a
 * render.
 */
const SHAPES = {
  pendant: ({ body, shade }) => `
    <line x1="200" y1="30" x2="200" y2="132" stroke="${LINE}" stroke-width="${STROKE}"/>
    <rect x="188" y="24" width="24" height="12" rx="3" fill="${LINE}"/>
    <path d="M92 262 A108 130 0 0 1 308 262 Z" fill="${body}"/>
    <path d="M200 132 A108 130 0 0 1 308 262 L200 262 Z" fill="${shade}"/>
    <path d="M92 262 A108 130 0 0 1 308 262 Z" fill="none" stroke="${LINE}"
      stroke-width="${STROKE}" stroke-linejoin="round"/>
    <line x1="92" y1="262" x2="308" y2="262" stroke="${LINE}" stroke-width="${STROKE}"/>
    <ellipse cx="200" cy="278" rx="34" ry="12" fill="${shade}" stroke="${LINE}"
      stroke-width="${STROKE}"/>`,

  arclamp: ({ body, shade }) => `
    <path d="M96 342 C 96 150 210 92 318 118" fill="none" stroke="${body}" stroke-width="14"
      stroke-linecap="round"/>
    <path d="M96 342 C 96 150 210 92 318 118" fill="none" stroke="${LINE}" stroke-width="${STROKE}"
      stroke-linecap="round" fill-opacity="0"/>
    <path d="M282 108 h72 l-14 62 h-44 Z" fill="${body}" stroke="${LINE}"
      stroke-width="${STROKE}" stroke-linejoin="round"/>
    <path d="M318 108 h36 l-14 62 h-22 Z" fill="${shade}"/>
    <path d="M282 108 h72 l-14 62 h-44 Z" fill="none" stroke="${LINE}"
      stroke-width="${STROKE}" stroke-linejoin="round"/>
    <ellipse cx="96" cy="346" rx="74" ry="20" fill="${shade}" stroke="${LINE}"
      stroke-width="${STROKE}"/>
    <ellipse cx="96" cy="338" rx="74" ry="20" fill="${body}" stroke="${LINE}"
      stroke-width="${STROKE}"/>`,

  sidetable: ({ body, shade }) => `
    <ellipse cx="200" cy="118" rx="104" ry="26" fill="${body}" stroke="${LINE}"
      stroke-width="${STROKE}"/>
    <path d="M96 118 v26 a104 26 0 0 0 208 0 v-26" fill="${shade}" stroke="${LINE}"
      stroke-width="${STROKE}" stroke-linejoin="round"/>
    <path d="M138 152 v98 a62 20 0 0 0 124 0 v-98" fill="${body}" stroke="${LINE}"
      stroke-width="${STROKE}" stroke-linejoin="round"/>
    <ellipse cx="200" cy="152" rx="62" ry="20" fill="${shade}" stroke="${LINE}"
      stroke-width="${STROKE}"/>
    <path d="M158 256 v76 a42 16 0 0 0 84 0 v-76" fill="${shade}" stroke="${LINE}"
      stroke-width="${STROKE}" stroke-linejoin="round"/>`,

  stool: ({ body, shade }) => `
    <path d="M124 132 v168 a76 22 0 0 0 152 0 v-168" fill="${body}" stroke="${LINE}"
      stroke-width="${STROKE}" stroke-linejoin="round"/>
    <path d="M200 110 v212 a76 22 0 0 0 76 -22 v-168" fill="${shade}"/>
    <path d="M124 132 v168 a76 22 0 0 0 152 0 v-168" fill="none" stroke="${LINE}"
      stroke-width="${STROKE}" stroke-linejoin="round"/>
    <ellipse cx="200" cy="132" rx="76" ry="22" fill="${shade}" stroke="${LINE}"
      stroke-width="${STROKE}"/>
    <path d="M140 130 q60 26 120 0" fill="none" stroke="${LINE}" stroke-width="${STROKE}"
      opacity="0.55"/>`,

  vase: ({ body, shade }) => `
    <path d="M152 116 h96 l22 42 v130 l-30 34 h-80 l-30 -34 v-130 Z"
      fill="${body}" stroke="${LINE}" stroke-width="${STROKE}" stroke-linejoin="round"/>
    <path d="M200 116 h48 l22 42 v130 l-30 34 h-40 Z" fill="${shade}"/>
    <path d="M152 116 h96 l22 42 v130 l-30 34 h-80 l-30 -34 v-130 Z"
      fill="none" stroke="${LINE}" stroke-width="${STROKE}" stroke-linejoin="round"/>
    <path d="M130 158 h140 M170 116 v206 M230 116 v206" stroke="${LINE}"
      stroke-width="${STROKE}" opacity="0.35" fill="none"/>
    <ellipse cx="200" cy="116" rx="48" ry="15" fill="${shade}" stroke="${LINE}"
      stroke-width="${STROKE}"/>`,

  mirror: ({ body, shade }) => `
    <line x1="200" y1="42" x2="200" y2="330" stroke="${LINE}" stroke-width="${STROKE}"/>
    <circle cx="200" cy="42" r="9" fill="${LINE}"/>
    <circle cx="200" cy="204" r="112" fill="${body}" stroke="${LINE}" stroke-width="${STROKE}"/>
    <path d="M200 92 a112 112 0 0 1 0 224 Z" fill="${shade}"/>
    <circle cx="200" cy="204" r="112" fill="none" stroke="${LINE}" stroke-width="${STROKE}"/>
    <circle cx="200" cy="204" r="92" fill="none" stroke="${LINE}" stroke-width="${STROKE}"
      opacity="0.4"/>
    <path d="M150 258 L242 152" stroke="#ffffff" stroke-width="16" opacity="0.28"
      stroke-linecap="round"/>`,

  bowl: ({ body, shade }) => `
    <path d="M76 168 h248 a124 96 0 0 1 -248 0 Z" fill="${body}" stroke="${LINE}"
      stroke-width="${STROKE}" stroke-linejoin="round"/>
    <path d="M200 264 a124 96 0 0 0 124 -96 h-124 Z" fill="${shade}"/>
    <path d="M76 168 h248 a124 96 0 0 1 -248 0 Z" fill="none" stroke="${LINE}"
      stroke-width="${STROKE}" stroke-linejoin="round"/>
    <ellipse cx="200" cy="168" rx="124" ry="34" fill="${shade}" stroke="${LINE}"
      stroke-width="${STROKE}"/>
    <ellipse cx="200" cy="168" rx="104" ry="27" fill="${body}" opacity="0.8"/>
    <path d="M164 262 h72 v14 h-72 Z" fill="${shade}" stroke="${LINE}" stroke-width="${STROKE}"
      stroke-linejoin="round"/>`,

  carafe: ({ body, shade }) => `
    <path d="M170 92 h60 v46 l30 44 v128 a24 24 0 0 1 -24 24 h-72 a24 24 0 0 1 -24 -24
      v-128 l30 -44 Z" fill="${body}" stroke="${LINE}" stroke-width="${STROKE}"
      stroke-linejoin="round"/>
    <path d="M200 92 h30 v46 l30 44 v128 a24 24 0 0 1 -24 24 h-36 Z" fill="${shade}"/>
    <path d="M170 92 h60 v46 l30 44 v128 a24 24 0 0 1 -24 24 h-72 a24 24 0 0 1 -24 -24
      v-128 l30 -44 Z" fill="none" stroke="${LINE}" stroke-width="${STROKE}"
      stroke-linejoin="round"/>
    <path d="M140 182 h120 M176 182 v152 M224 182 v152" stroke="${LINE}" stroke-width="${STROKE}"
      opacity="0.3" fill="none"/>
    <path d="M230 92 q22 -6 26 12" fill="none" stroke="${LINE}" stroke-width="${STROKE}"
      stroke-linecap="round"/>`,
};

/* ── Public API ────────────────────────────────────────────────────────────── */

/**
 * Render a product as inline SVG.
 *
 * @param {object} options
 * @param {string} options.shape   key of SHAPES
 * @param {string} options.finish  key of FINISHES
 * @param {string} [options.title] accessible name; omit for decorative use
 */
export function productArt({ shape, finish = 'chalk', title = null, className = '' }) {
  const palette = FINISHES[finish] || FINISHES.chalk;
  const draw = SHAPES[shape] || SHAPES.vase;

  return `<svg class="product-art ${className}" viewBox="0 0 400 400"
    xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"
    data-shape="${shape}" data-finish="${finish}"
    ${title ? 'role="img"' : 'aria-hidden="true" focusable="false"'}>
    ${title ? `<title>${escapeSvg(title)}</title>` : ''}
    ${draw(palette)}
  </svg>`;
}

/** A small swatch disc for the finish picker. */
export function swatch(finish) {
  const palette = FINISHES[finish] || FINISHES.chalk;
  return `<svg viewBox="0 0 24 24" class="swatch__disc" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="11" fill="${palette.body}" stroke="${LINE}" stroke-width="1.5"/>
    <path d="M12 1 a11 11 0 0 1 0 22 Z" fill="${palette.shade}"/>
    <circle cx="12" cy="12" r="11" fill="none" stroke="${LINE}" stroke-width="1.5"/>
  </svg>`;
}

function escapeSvg(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
}
