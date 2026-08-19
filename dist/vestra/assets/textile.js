/**
 * Woven cloth, drawn from its actual structure.
 *
 * ── Why not just a colour swatch ────────────────────────────────────────────
 *
 * A flat rectangle of #4a4d55 tells a customer nothing that the word "grey"
 * does not. What distinguishes flannel from poplin is not colour, it is
 * structure: which yarns pass over which, how often, and on what diagonal.
 * That is drawable, and drawing it is the difference between a swatch and a
 * paint chip.
 *
 * ── How a weave is defined ──────────────────────────────────────────────────
 *
 * Every structure here is a real one, expressed the way a weaver writes it: a
 * grid where 1 means the warp (vertical yarn) passes over the weft
 * (horizontal), and 0 means it passes under. That grid is the whole definition.
 *
 *   plain       1 0     the simplest interlacing, one over one
 *               0 1
 *
 *   twill       shifts by one each row, which is what produces the diagonal
 *   herringbone a twill that reverses direction every few ends
 *   rib         warp-faced columns, so it reads as vertical cords
 *
 * The renderer then paints one cell per crossing and tiles it as an SVG
 * pattern. Because it is a pattern rather than a bitmap, it stays sharp at any
 * size and costs a few hundred bytes.
 *
 * Shared by the build and the browser, so the swatch in the static HTML and the
 * one redrawn when a colourway changes come from the same structure.
 */

/**
 * Weave drafts. Each is a square matrix of 1 (warp over) and 0 (warp under).
 *
 * `scale` is how many pixels one crossing occupies at 1× — a heavier cloth
 * gets a coarser grid, because a 480 gsm tweed genuinely has fewer, thicker
 * ends per centimetre than a 110 gsm crepe.
 */
export const DRAFTS = {
  // One over, one under. Poplin, canvas, taffeta.
  plain: { scale: 4, grid: [
    [1, 0],
    [0, 1],
  ]},

  // Poplin is a plain weave with a much finer warp than weft, which is what
  // gives it the faint horizontal cord. Same interlacing, different proportion.
  poplin: { scale: 5, grid: [
    [1, 0],
    [0, 1],
  ], warpBias: 0.6 },

  // 2/2 twill, shifting one end per pick — the 45° line of flannel and denim.
  twill: { scale: 5, grid: [
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 1],
    [1, 0, 0, 1],
  ]},

  // The same 2/2 twill, reversed every four ends. The reversal is the point:
  // it is what makes the chevron.
  herringbone: { scale: 5, grid: [
    [1, 1, 0, 0, 0, 0, 1, 1],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 1, 1, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 1, 1, 0, 0, 1],
  ]},

  // 2×2 rib: columns of warp float, so it reads as vertical cords rather than
  // a surface. Knitted rather than woven in reality, but the draft notation
  // describes the face just as well.
  rib: { scale: 6, grid: [
    [1, 1, 0, 0],
    [1, 1, 0, 0],
    [1, 1, 0, 0],
    [1, 1, 0, 0],
  ]},

  // Crepe: a broken, deliberately irregular interlacing with no visible repeat
  // direction. That absence of direction is exactly what crepe is for — it is
  // why the cloth hangs without a grain line pulling it.
  crepe: { scale: 4, grid: [
    [1, 0, 1, 1, 0, 0],
    [0, 1, 0, 0, 1, 1],
    [1, 1, 0, 1, 0, 0],
    [0, 0, 1, 0, 1, 1],
    [1, 0, 0, 1, 1, 0],
    [0, 1, 1, 0, 0, 1],
  ]},
};

/** Nudge a hex colour toward white (positive) or black (negative). */
export function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const channel = (offset) => {
    const v = (n >> offset) & 255;
    const moved = amount >= 0 ? v + (255 - v) * amount : v * (1 + amount);
    return Math.max(0, Math.min(255, Math.round(moved)));
  };
  return `#${((1 << 24) | (channel(16) << 16) | (channel(8) << 8) | channel(0))
    .toString(16)
    .slice(1)}`;
}

let sequence = 0;

/**
 * Build the <defs> pattern for one cloth.
 *
 * Returns `{ id, defs }` so a caller can drop several swatches into one
 * document without their pattern ids colliding — SVG ids are document-global,
 * and `verify.js` fails the build on duplicates.
 */
/**
 * `scale` is the size of one yarn crossing, so it works *inversely* to how a
 * zoom control would: a larger scale means fewer, coarser crossings across the
 * same box. At 2.2 a swatch came out as a blocky checkerboard rather than
 * cloth — real fabric needs many fine repeats, which means a scale well under 1.
 */
export function weavePattern({ weave = 'plain', warp, weft, scale = 0.5 }) {
  const draft = DRAFTS[weave] || DRAFTS.plain;
  const grid = draft.grid;
  const rows = grid.length;
  const cols = grid[0].length;
  // Cells are square unless the draft says otherwise. Poplin's `warpBias`
  // narrows the warp columns without changing the interlacing, which is exactly
  // what makes poplin poplin: the same plain weave as canvas, but with a much
  // finer warp than weft, so the surface reads as a faint horizontal cord.
  const cellY = draft.scale * scale;
  const cellX = cellY * (draft.warpBias || 1);
  const id = `wv${(sequence += 1).toString(36)}`;

  // Warp yarns catch the light along their length and weft across it, so the
  // two are shaded in opposite directions. Without this the interlacing is
  // legible as a checkerboard but not as cloth — it is the light difference,
  // not the pattern, that makes it read as thread.
  const warpLit = shade(warp, 0.1);
  const warpDark = shade(warp, -0.16);
  const weftLit = shade(weft, 0.06);
  const weftDark = shade(weft, -0.12);

  const round = (n) => Math.round(n * 100) / 100;
  const cells = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const over = grid[y][x] === 1;
      const px = round(x * cellX);
      const py = round(y * cellY);
      cells.push(
        `<rect x="${px}" y="${py}" width="${round(cellX)}" height="${round(cellY)}" ` +
          `fill="${over ? warpLit : weftDark}"/>`,
      );
      // A one-pixel edge on the shadow side of each float. This is the whole
      // trick: it is what separates one yarn from the next at small sizes,
      // where the fills alone blur into a single average colour.
      cells.push(
        `<rect x="${px}" y="${round(py + cellY - 1)}" width="${round(cellX)}" height="1" ` +
          `fill="${over ? warpDark : weftLit}" opacity="0.55"/>`,
      );
    }
  }

  const defs =
    `<pattern id="${id}" width="${round(cols * cellX)}" height="${round(rows * cellY)}" ` +
    `patternUnits="userSpaceOnUse">${cells.join('')}</pattern>`;

  return { id, defs, cellX, cellY, cols, rows };
}

/**
 * A standalone swatch: the cloth, filling a rectangle, with a torn selvedge on
 * one edge so it reads as a cut piece rather than a colour field.
 */
export function swatch({ cloth, title = null, className = '', scale = 0.5 }) {
  const { id, defs } = weavePattern({
    weave: cloth.weave,
    warp: cloth.warp,
    weft: cloth.weft,
    scale,
  });
  const width = 400;
  const height = 260;

  return `<svg class="swatch ${className}" viewBox="0 0 ${width} ${height}"
    xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"
    ${title ? 'role="img"' : 'aria-hidden="true" focusable="false"'}>
    ${title ? `<title>${escapeSvg(title)}</title>` : ''}
    <defs>${defs}</defs>
    <rect width="${width}" height="${height}" fill="url(#${id})"/>
  </svg>`;
}

/** A small circular chip, for a colourway selector. */
export function chip(cloth, colourHex) {
  const { id, defs } = weavePattern({
    weave: cloth.weave,
    warp: colourHex,
    weft: shade(colourHex, 0.12),
    scale: 0.5,
  });
  return `<svg viewBox="0 0 24 24" class="chip__disc" aria-hidden="true" focusable="false">
    <defs>${defs}</defs>
    <circle cx="12" cy="12" r="11" fill="url(#${id})" stroke="rgba(0,0,0,0.35)" stroke-width="1"/>
  </svg>`;
}

function escapeSvg(value) {
  return String(value).replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch],
  );
}
