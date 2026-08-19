/**
 * The hero: a length of cloth, hanging.
 *
 * ── Why this and not a photograph ───────────────────────────────────────────
 *
 * This site sells cloth, and every other site in this portfolio solved its
 * missing-photography problem by drawing something. A garment cannot be drawn
 * convincingly at hero size — but cloth is not an object to be depicted, it is
 * a *behaviour*. How it falls, where it gathers, how long it takes to settle:
 * that is what distinguishes 420 gsm flannel from 110 gsm crepe, and it is
 * something a still photograph cannot show at all.
 *
 * So the hero simulates it. The panel hangs from a rail, sways when pushed,
 * and settles at a rate set by the cloth's own weight and stiffness. Drag it
 * and it responds.
 *
 * ── What it reuses ──────────────────────────────────────────────────────────
 *
 * The Verlet solver in /shared/verlet.js, which was written for the lab and is
 * now doing commercial work — the same constraint relaxation, driven with
 * per-cloth parameters instead of GUI sliders.
 *
 * ── The honest limits, and what follows from them ───────────────────────────
 *
 * This is a 2D mass-spring sheet, not a cloth solver. That is not a detail: a
 * flat sheet seen face-on *cannot* show folds, because a fold is depth, and no
 * amount of shading recovers a dimension the simulation does not have. Two
 * earlier versions of this hero tried — shading by area, then by horizontal
 * compression — and both produced a flat grey rectangle, because that is
 * genuinely all the information there is.
 *
 * So it does not pretend. What a 2D sheet can show truthfully is its
 * *silhouette* — where it sags, how it swags between its pins, how it moves —
 * and what the cloth actually is, which is a weave. The panel is therefore
 * filled with the real weave draft from textile.js and shaded only gently, and
 * the simulation is left to do the thing it can do honestly: shape and motion.
 *
 * There is still no bending resistance, no self-collision and no shear
 * stiffness. It would not survive being asked to drape over a form.
 */
import { World, buildCloth } from '../../shared/verlet.js';
import { DRAFTS, shade as shadeHex } from './textile.js';

/**
 * Per-cloth simulation parameters.
 *
 * These are the numbers that make one cloth feel unlike another, and they are
 * derived from the real properties rather than picked by eye:
 *
 *   gravity     scales with fabric weight — a 480 gsm tweed falls harder
 *   iterations  stands in for stiffness; a canvas resists deformation, a
 *               crepe does not, and iteration count is how a position-based
 *               solver expresses that
 *   damping     how quickly motion bleeds away; heavy fulled wool settles in
 *               about a second, silk keeps moving
 *   spacing     grid resolution; finer for light cloth so it can form more folds
 */
export const CLOTH_PHYSICS = {
  twill: { gravity: 1150, iterations: 8, damping: 0.986, spacing: 20 },
  herringbone: { gravity: 1300, iterations: 10, damping: 0.982, spacing: 22 },
  plain: { gravity: 900, iterations: 9, damping: 0.99, spacing: 19 },
  poplin: { gravity: 700, iterations: 6, damping: 0.994, spacing: 17 },
  rib: { gravity: 950, iterations: 4, damping: 0.992, spacing: 21 },
  crepe: { gravity: 560, iterations: 3, damping: 0.997, spacing: 15 },
};

const STEP = 1 / 60;

export function createDrape(canvas, { weave = 'twill', warp, weft }) {
  const context = canvas.getContext('2d');
  if (!context) return null;

  /**
   * The cloth itself, as a repeating canvas pattern.
   *
   * Built from the same weave drafts the SVG swatches use, so the fabric in the
   * hero and the swatch on the product page are the same structure — a twill
   * leans the same way in both.
   */
  function buildWeaveTile(pixelRatio) {
    const draft = DRAFTS[weave] || DRAFTS.plain;
    const grid = draft.grid;
    const rows = grid.length;
    const cols = grid[0].length;
    const cell = Math.max(2, Math.round(draft.scale * pixelRatio * 0.75));

    const tile = document.createElement('canvas');
    tile.width = cols * cell;
    tile.height = rows * cell;
    const tc = tile.getContext('2d');

    const warpLit = shadeHex(warp, 0.12);
    const weftDark = shadeHex(weft, -0.14);

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        tc.fillStyle = grid[y][x] === 1 ? warpLit : weftDark;
        tc.fillRect(x * cell, y * cell, cell, cell);
      }
    }
    return context.createPattern(tile, 'repeat');
  }

  let weavePatternFill = null;

  const physics = CLOTH_PHYSICS[weave] || CLOTH_PHYSICS.twill;

  /** How much wider the cloth is than the rail it hangs from. 0.86 ≈ 1.16:1. */
  const GATHER = 0.86;

  let world = null;
  let cols = 0;
  let rows = 0;
  let ratio = 1;

  function build() {
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(canvas.clientWidth * ratio);
    const height = Math.round(canvas.clientHeight * ratio);
    canvas.width = width;
    canvas.height = height;

    const spacing = physics.spacing * ratio;
    // Fill the frame with a margin, and keep the panel taller than it is wide —
    // a hanging length of cloth, not a square of it.
    // Wide enough to fill the frame once gathered — a gathered panel loses
    // roughly a third of its width, so it has to start wider than the target.
    cols = Math.max(10, Math.round((width * 0.95) / spacing));
    rows = Math.max(10, Math.round((height * 0.86) / spacing));

    world = new World({
      gravity: physics.gravity * ratio,
      damping: physics.damping,
      iterations: physics.iterations,
      bounds: { width, height },
    });

    buildCloth(world, {
      cols,
      rows,
      spacing,
      originX: (width - cols * spacing) / 2,
      originY: height * 0.06,
      // A hero that can be torn in half is a bug, not a feature. The lab keeps
      // tearing; here the links hold whatever the visitor does to them.
      tearAt: Infinity,
      // Few, wide swags. At the solver's default of every fourth point the
      // panel came out as a row of small sharp peaks — a saw blade rather than
      // a curtain. The swag has to be wide relative to the drop to read as
      // cloth taking its own weight.
      pinEvery: Math.max(6, Math.round(cols / 5)),
    });

    gather();
    weavePatternFill = buildWeaveTile(ratio);
  }

  /**
   * Gather the cloth on its rail.
   *
   * A flat sheet pinned along a straight line at its own rest spacing has no
   * reason to fold — it just hangs flat, which is what made the first version
   * of this hero read as a wireframe grid rather than fabric.
   *
   * Real hanging cloth folds because there is more of it than there is rail:
   * a curtain is gathered to something like 2:1. So the pinned points are
   * pulled toward the centre, leaving the links between them longer than the
   * gap they now span. The excess has nowhere to go but out of line, and the
   * sheet buckles into vertical folds on its own — no noise, no fake
   * displacement, just the constraint solver resolving too much cloth.
   */
  function gather() {
    const centre = canvas.width / 2;
    for (let i = 0; i < world.count; i += 1) {
      if (!world.pinned[i]) continue;
      const pulled = centre + (world.x[i] - centre) * GATHER;
      world.x[i] = pulled;
      // Move the previous position with it, or the pin starts with a velocity
      // and the whole sheet snaps sideways on the first frame.
      world.px[i] = pulled;
    }
  }

  build();

  /**
   * Draw the panel.
   *
   * Two passes. First the silhouette is filled with the weave pattern in one
   * path, which is what makes it read as cloth — real interlaced yarn, not a
   * colour. Then a light per-quad shading pass on top, kept deliberately subtle
   * because it is standing in for depth the simulation does not have, and
   * overdoing it is what made the earlier versions look like a wireframe.
   */
  function draw() {
    const { width, height } = canvas;
    context.clearRect(0, 0, width, height);

    const { x, y } = world;
    const rest = physics.spacing * ratio;
    const idx = (r, c) => r * cols + c;

    // ── Silhouette, filled with the weave ──────────────────────────────────
    context.save();
    context.beginPath();
    // Down the left edge, across the bottom, back up the right, then across
    // the top — one closed path, so the scalloped hem and swagged head are
    // both part of the outline rather than approximated by a rectangle.
    context.moveTo(x[idx(0, 0)], y[idx(0, 0)]);
    for (let r = 0; r < rows; r += 1) context.lineTo(x[idx(r, 0)], y[idx(r, 0)]);
    for (let c = 0; c < cols; c += 1) context.lineTo(x[idx(rows - 1, c)], y[idx(rows - 1, c)]);
    for (let r = rows - 1; r >= 0; r -= 1) context.lineTo(x[idx(r, cols - 1)], y[idx(r, cols - 1)]);
    for (let c = cols - 1; c >= 0; c -= 1) context.lineTo(x[idx(0, c)], y[idx(0, c)]);
    context.closePath();
    context.clip();

    if (weavePatternFill) {
      context.fillStyle = weavePatternFill;
      context.fillRect(0, 0, width, height);
    } else {
      context.fillStyle = warp;
      context.fillRect(0, 0, width, height);
    }

    // ── Shading pass ───────────────────────────────────────────────────────
    // Horizontal compression, drawn as translucent shadow. Gathered cloth is
    // compressed nearly everywhere, so the reference is the gather ratio.
    for (let r = 0; r < rows - 1; r += 1) {
      for (let c = 0; c < cols - 1; c += 1) {
        const i = idx(r, c);
        const right = i + 1;
        const down = i + cols;
        const diag = down + 1;

        const top = Math.hypot(x[right] - x[i], y[right] - y[i]);
        const bottom = Math.hypot(x[diag] - x[down], y[diag] - y[down]);
        const squeeze = (top + bottom) / 2 / rest;

        // 0 where the cloth is at its most compressed, 1 where it is open.
        const open = Math.max(0, Math.min(1, (squeeze - GATHER * 0.8) / (1.02 - GATHER * 0.8)));
        const darkness = (1 - open) * 0.45;
        if (darkness < 0.01) continue;

        context.fillStyle = `rgba(12, 12, 14, ${darkness.toFixed(3)})`;
        context.beginPath();
        context.moveTo(x[i], y[i]);
        context.lineTo(x[right], y[right]);
        context.lineTo(x[diag], y[diag]);
        context.lineTo(x[down], y[down]);
        context.closePath();
        context.fill();
      }
    }

    context.restore();
  }

  let accumulator = 0;
  let lastSeconds = 0;

  function advance(dt) {
    accumulator += dt;
    // Capped, for the same reason as the lab stage: a long frame must not be
    // consumed in one enormous step, or the constraints overshoot and the
    // sheet detonates.
    let steps = 0;
    while (accumulator >= STEP && steps < 5) {
      world.step(STEP);
      accumulator -= STEP;
      steps += 1;
    }
    if (steps === 5) accumulator = 0;
    draw();
  }

  /** Settle the sheet without drawing, so the first painted frame is at rest. */
  function settle(seconds = 2.5) {
    const iterations = Math.round(seconds / STEP);
    for (let i = 0; i < iterations; i += 1) world.step(STEP);
    draw();
  }

  function push(clientX, clientY, strength = 1) {
    const rect = canvas.getBoundingClientRect();
    const px = (clientX - rect.left) * (canvas.width / rect.width);
    const py = (clientY - rect.top) * (canvas.height / rect.height);
    world.repel(px, py, 90 * ratio, 900 * strength * ratio);
  }

  function resize() {
    build();
    settle();
    lastSeconds = 0;
  }

  /**
   * The shared surface contract: `draw(seconds)` with an absolute elapsed time,
   * plus `resize()`. Conforming to it means this hero inherits the whole
   * lifecycle in /shared/surface.js — pause off-screen, pause on a hidden tab,
   * one still frame under reduced motion, and context-loss recovery — instead
   * of reimplementing all of it with its own bugs.
   *
   * The absolute time is converted to a delta here, and clamped: `surface.js`
   * draws a single frame at a fixed arbitrary timestamp to produce its
   * reduced-motion still, which would otherwise ask the solver to advance
   * twelve seconds in one step and tear the sheet apart.
   */
  function drawAt(seconds) {
    const dt = Math.max(0, Math.min(seconds - lastSeconds, 0.05));
    lastSeconds = seconds;
    advance(dt);
  }

  return {
    draw: drawAt,
    resize,
    settle,
    push,
    canvas,
    get world() {
      return world;
    },
  };
}

/** Blend two hex colours. */
function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (offset) => {
    const va = (pa >> offset) & 255;
    const vb = (pb >> offset) & 255;
    return Math.round(va + (vb - va) * t);
  };
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}
