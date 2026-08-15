/**
 * Aurelia's artwork — original SVG, generated.
 *
 * The site ships no photography, so the imagery has to be a deliberate part of
 * the design language rather than a stand-in for missing photos. Everything here
 * is built from the same coastal vocabulary: layered horizon bands, a low sun,
 * and the arched window motif taken from the 1974 building.
 *
 * Compositions are seeded, so a given room or article always renders the same
 * artwork, and the build is byte-for-byte reproducible.
 */

import { esc } from '../_lib/html.js';

/* ── Palettes ──────────────────────────────────────────────────────────────── */

export const PALETTES = {
  dawn: {
    sky: ['#f6e3d2', '#efc9ad'],
    sun: '#e8996b',
    bands: ['#c9a184', '#a87f66', '#7e5f4e', '#57443a', '#332924'],
  },
  noon: {
    sky: ['#dfeaea', '#bcd3d3'],
    sun: '#f2f0e6',
    bands: ['#9fb9b5', '#7d9d99', '#5c7d7a', '#415c5b', '#2b3d3e'],
  },
  dusk: {
    sky: ['#f0d9c4', '#d9a689'],
    sun: '#c96f4e',
    bands: ['#a9765f', '#87594b', '#65403a', '#452c2a', '#281b1c'],
  },
  fog: {
    sky: ['#e8e6df', '#cfd2cc'],
    sun: '#f4f2ea',
    bands: ['#b3b7b0', '#949a94', '#757c78', '#565c5a', '#383d3c'],
  },
  winter: {
    sky: ['#dde5ea', '#b9c9d4'],
    sun: '#eef3f5',
    bands: ['#9aadb9', '#7a8f9d', '#5c6f7e', '#42525e', '#2b363f'],
  },
  garden: {
    sky: ['#eeeade', '#d7d8c3'],
    sun: '#f4f1e4',
    bands: ['#b2b494', '#93976f', '#727856', '#535840', '#363a2c'],
  },
};

/* ── Seeded noise ──────────────────────────────────────────────────────────── */

function seedFrom(text) {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

/** Deterministic 0–1 generator. */
function rng(seed) {
  let state = seed || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 4294967296;
  };
}

/* ── Curve construction ────────────────────────────────────────────────────── */

/**
 * Convert a run of points into a smooth path using Catmull-Rom → cubic Bézier.
 * Straight polylines read as charts; these need to read as landforms.
 */
function smooth(points) {
  if (points.length < 2) return '';
  let path = `M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] || points[index];
    const current = points[index];
    const next = points[index + 1];
    const after = points[index + 2] || next;

    const c1x = current[0] + (next[0] - previous[0]) / 6;
    const c1y = current[1] + (next[1] - previous[1]) / 6;
    const c2x = next[0] - (after[0] - current[0]) / 6;
    const c2y = next[1] - (after[1] - current[1]) / 6;

    path +=
      ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)},` +
      ` ${c2x.toFixed(2)} ${c2y.toFixed(2)},` +
      ` ${next[0].toFixed(2)} ${next[1].toFixed(2)}`;
  }
  return path;
}

/** A horizon band: an organic ridge line closed down to the bottom edge. */
function band({ width, height, baseline, amplitude, random, samples = 9 }) {
  const points = [];
  const phase = random() * Math.PI * 2;
  const frequency = 1.1 + random() * 1.4;

  for (let index = 0; index <= samples; index += 1) {
    const t = index / samples;
    const wobble =
      Math.sin(phase + t * Math.PI * frequency) * amplitude +
      Math.sin(phase * 1.7 + t * Math.PI * frequency * 2.3) * amplitude * 0.32;
    points.push([t * width, baseline + wobble]);
  }

  return `${smooth(points)} L ${width} ${height} L 0 ${height} Z`;
}

/* ── Compositions ──────────────────────────────────────────────────────────── */

/**
 * The core landscape composition — a low sun over layered headlands.
 *
 * @param {object} options
 * @param {string} options.seed      stable identifier; same seed, same artwork
 * @param {string} options.palette   key of PALETTES
 * @param {string} [options.title]   accessible name; omit for decorative use
 * @param {number} [options.ratio]   height as a fraction of width
 */
export function horizon({
  seed = 'aurelia',
  palette = 'dawn',
  title = null,
  ratio = 0.62,
  className = '',
  sun = true,
} = {}) {
  const width = 1000;
  const height = Math.round(width * ratio);
  const colors = PALETTES[palette] || PALETTES.dawn;
  const random = rng(seedFrom(seed));
  const id = `hz-${seedFrom(seed).toString(36)}`;

  const sunY = height * (0.3 + random() * 0.16);
  const sunX = width * (0.18 + random() * 0.64);
  const sunR = width * (0.055 + random() * 0.035);

  const bands = colors.bands
    .map((color, index) => {
      const depth = (index + 1) / colors.bands.length;
      const baseline = height * (0.5 + depth * 0.44);
      const amplitude = height * (0.075 - depth * 0.045);
      return `<path d="${band({ width, height, baseline, amplitude, random })}" fill="${color}"/>`;
    })
    .join('');

  return `<svg class="art ${esc(className)}" viewBox="0 0 ${width} ${height}"
    xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"
    ${title ? `role="img"` : 'aria-hidden="true" focusable="false"'}>
    ${title ? `<title>${esc(title)}</title>` : ''}
    <defs>
      <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${colors.sky[0]}"/>
        <stop offset="1" stop-color="${colors.sky[1]}"/>
      </linearGradient>
      <radialGradient id="${id}-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0" stop-color="${colors.sun}" stop-opacity="0.85"/>
        <stop offset="1" stop-color="${colors.sun}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#${id}-sky)"/>
    ${
      sun
        ? `<circle cx="${sunX.toFixed(0)}" cy="${sunY.toFixed(0)}" r="${(sunR * 3.4).toFixed(0)}"
             fill="url(#${id}-glow)"/>
           <circle cx="${sunX.toFixed(0)}" cy="${sunY.toFixed(0)}" r="${sunR.toFixed(0)}"
             fill="${colors.sun}"/>`
        : ''
    }
    ${bands}
  </svg>`;
}

/**
 * The arched window motif — the building's signature shape, used as a frame.
 * The arch is a clip path so any composition can be poured into it.
 */
export function arch({ seed = 'arch', palette = 'noon', title = null, className = '' } = {}) {
  const id = `arch-${seedFrom(seed).toString(36)}`;
  const width = 600;
  const height = 800;
  const colors = PALETTES[palette] || PALETTES.noon;
  const random = rng(seedFrom(seed));

  const bands = colors.bands
    .map((color, index) => {
      const depth = (index + 1) / colors.bands.length;
      return `<path d="${band({
        width,
        height,
        baseline: height * (0.52 + depth * 0.42),
        amplitude: height * (0.05 - depth * 0.03),
        random,
      })}" fill="${color}"/>`;
    })
    .join('');

  return `<svg class="art art--arch ${esc(className)}" viewBox="0 0 ${width} ${height}"
    xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"
    ${title ? `role="img"` : 'aria-hidden="true" focusable="false"'}>
    ${title ? `<title>${esc(title)}</title>` : ''}
    <defs>
      <clipPath id="${id}-clip">
        <path d="M0 ${width / 2} A ${width / 2} ${width / 2} 0 0 1 ${width} ${width / 2}
                 L ${width} ${height} L 0 ${height} Z"/>
      </clipPath>
      <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${colors.sky[0]}"/>
        <stop offset="1" stop-color="${colors.sky[1]}"/>
      </linearGradient>
    </defs>
    <g clip-path="url(#${id}-clip)">
      <rect width="${width}" height="${height}" fill="url(#${id}-sky)"/>
      <circle cx="${(width * 0.66).toFixed(0)}" cy="${(height * 0.34).toFixed(0)}"
              r="${(width * 0.11).toFixed(0)}" fill="${colors.sun}"/>
      ${bands}
    </g>
  </svg>`;
}

/**
 * A circular vignette used for experiences — the landscape reduced to a badge,
 * with one distinguishing line element drawn over it.
 */
export function vignette({ seed = 'v', palette = 'noon', motif = null, title = null } = {}) {
  const size = 400;
  const id = `vg-${seedFrom(seed).toString(36)}`;
  const colors = PALETTES[palette] || PALETTES.noon;
  const random = rng(seedFrom(seed));

  const bands = colors.bands
    .slice(1)
    .map((color, index) => {
      const depth = (index + 1) / 4;
      return `<path d="${band({
        width: size,
        height: size,
        baseline: size * (0.54 + depth * 0.4),
        amplitude: size * (0.05 - depth * 0.028),
        random,
      })}" fill="${color}"/>`;
    })
    .join('');

  return `<svg class="art art--vignette" viewBox="0 0 ${size} ${size}"
    xmlns="http://www.w3.org/2000/svg"
    ${title ? `role="img"` : 'aria-hidden="true" focusable="false"'}>
    ${title ? `<title>${esc(title)}</title>` : ''}
    <defs>
      <clipPath id="${id}-clip"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></clipPath>
      <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${colors.sky[0]}"/>
        <stop offset="1" stop-color="${colors.sky[1]}"/>
      </linearGradient>
    </defs>
    <g clip-path="url(#${id}-clip)">
      <rect width="${size}" height="${size}" fill="url(#${id}-sky)"/>
      <circle cx="${size * 0.68}" cy="${size * 0.3}" r="${size * 0.08}" fill="${colors.sun}"/>
      ${bands}
      ${motif ? MOTIFS[motif] || '' : ''}
    </g>
  </svg>`;
}

/**
 * Line motifs overlaid on vignettes. Drawn in the same weight as the building's
 * window mullions, so they sit with the architecture rather than on top of it.
 */
const MOTIFS = {
  kayak: `<g fill="none" stroke="#f6f1e6" stroke-width="7" stroke-linecap="round">
    <path d="M112 250 q88 34 176 0 q-88 -26 -176 0Z"/>
    <path d="M150 214 l40 36 M250 214 l-40 36"/>
    <path d="M96 232 l208 0" stroke-width="4" opacity="0.6"/>
  </g>`,
  glass: `<g fill="none" stroke="#f6f1e6" stroke-width="7" stroke-linecap="round">
    <path d="M162 176 h76 l-10 52 a28 28 0 0 1 -56 0Z"/>
    <path d="M200 256 v40 M176 296 h48"/>
  </g>`,
  loaf: `<g fill="none" stroke="#f6f1e6" stroke-width="7" stroke-linecap="round">
    <path d="M132 262 q68 -66 136 0 Z"/>
    <path d="M164 236 l18 -22 M200 226 l16 -22 M234 236 l16 -20" stroke-width="5"/>
  </g>`,
  steam: `<g fill="none" stroke="#f6f1e6" stroke-width="7" stroke-linecap="round">
    <path d="M144 292 h112 v-18 h-112Z"/>
    <path d="M172 246 q-14 -22 0 -44 M200 252 q-14 -26 0 -50 M228 246 q-14 -22 0 -44"
          stroke-width="5" opacity="0.85"/>
  </g>`,
  star: `<g fill="none" stroke="#f6f1e6" stroke-width="6" stroke-linecap="round">
    <circle cx="200" cy="252" r="20"/>
    <path d="M200 212 v-26 M200 292 v26 M160 252 h-26 M240 252 h26
             M172 224 l-18 -18 M228 224 l18 -18 M172 280 l-18 18 M228 280 l18 18"/>
  </g>`,
  basket: `<g fill="none" stroke="#f6f1e6" stroke-width="7" stroke-linecap="round">
    <path d="M140 246 h120 l-14 60 h-92Z"/>
    <path d="M166 246 a34 34 0 0 1 68 0" stroke-width="5"/>
    <path d="M176 262 v30 M200 262 v30 M224 262 v30" stroke-width="4" opacity="0.7"/>
  </g>`,
};

/**
 * The cypress windbreak — the property's most recognisable feature, and a useful
 * horizontal rule between sections. Every tree leans inland at the same angle,
 * which is the point of the drawing.
 */
export function cypressRow({ count = 9, className = '' } = {}) {
  const width = 1200;
  const height = 200;
  const random = rng(seedFrom('cypress'));

  const trees = Array.from({ length: count }, (unused, index) => {
    const x = ((index + 0.5) / count) * width;
    const scale = 0.72 + random() * 0.5;
    const lean = 13;
    return `<g transform="translate(${x.toFixed(1)} ${height}) rotate(${lean}) scale(${scale.toFixed(2)})">
      <path d="M0 0 C -26 -34 -30 -78 -12 -116 C -6 -128 6 -128 12 -116
               C 30 -78 26 -34 0 0Z" fill="#3f4a3f" opacity="0.9"/>
      <path d="M0 0 V -104" stroke="#2b332b" stroke-width="3"/>
    </g>`;
  }).join('');

  return `<svg class="art art--cypress ${esc(className)}" viewBox="0 0 ${width} ${height}"
    xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet"
    aria-hidden="true" focusable="false">${trees}</svg>`;
}

/** A repeating wave rule, used to separate sections. */
export function waveRule() {
  return `<svg class="art art--rule" viewBox="0 0 1200 40" xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <path d="M0 28 q50 -18 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0"
      fill="none" stroke="currentColor" stroke-width="2" opacity="0.4"/>
    <path d="M0 14 q50 -18 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0"
      fill="none" stroke="currentColor" stroke-width="2" opacity="0.2"/>
  </svg>`;
}

/** Palette assignment per room and per article, so artwork is stable and varied. */
export const ROOM_PALETTE = { dune: 'dawn', cliff: 'dusk', garden: 'garden' };
export const JOURNAL_PALETTE = { winter: 'winter', oyster: 'fog', trail: 'noon' };
export const EXPERIENCE_ART = {
  tide: { palette: 'fog', motif: 'star' },
  kelp: { palette: 'noon', motif: 'kayak' },
  cellar: { palette: 'dusk', motif: 'glass' },
  bread: { palette: 'dawn', motif: 'loaf' },
  sauna: { palette: 'garden', motif: 'steam' },
  forage: { palette: 'winter', motif: 'basket' },
};
