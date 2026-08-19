/**
 * Vestra's size and fit engine.
 *
 * ── Why this is the signature system ────────────────────────────────────────
 *
 * Returns are the defining economic problem of clothing sold online, and the
 * single largest cause of them is buying the wrong size. Almost every fashion
 * site answers this with a static size chart — a table of numbers with no
 * opinion — which puts the whole burden of interpretation on someone who has
 * probably never measured their own hip.
 *
 * This module has an opinion, and shows its working.
 *
 * ── The model ───────────────────────────────────────────────────────────────
 *
 * The mistake most size charts make is publishing *body* measurements ("size M
 * fits a 96cm chest") when what matters is the *garment* measurement and the
 * gap between the two. That gap is `ease`, and it is a design decision, not a
 * tolerance:
 *
 *   ease = garment measurement − body measurement
 *
 * A tailored jacket wants ~8cm of ease at the chest. An oversized coat wants
 * 24cm. A rib-knit top wants *negative* ease — it is meant to stretch. Identical
 * body measurements therefore map to different sizes in different garments, and
 * a chart that hides this is the reason "I'm a medium" is not a fact.
 *
 * So each garment declares its intended ease per measurement point, and a size
 * is scored on how close its actual ease lands to that intention.
 *
 * ── What it returns ─────────────────────────────────────────────────────────
 *
 * Not just a size. A per-point verdict (snug / as intended / relaxed), and when
 * two sizes score closely, both — with the tradeoff stated in words. "Between
 * sizes" is the honest answer to a genuinely ambiguous question, and pretending
 * otherwise is how a customer ends up posting a parcel back.
 *
 * ── Shared, deliberately ────────────────────────────────────────────────────
 *
 * Imported by the build (to render size tables into static HTML) and by the
 * browser (to answer the fit finder live). One implementation, so the table a
 * search engine indexes and the recommendation a customer is given cannot
 * disagree.
 */

/* ── Units ─────────────────────────────────────────────────────────────────── */

export const CM_PER_INCH = 2.54;

export const toCm = (value, unit) => (unit === 'in' ? value * CM_PER_INCH : value);
export const fromCm = (cm, unit) => (unit === 'in' ? cm / CM_PER_INCH : cm);

/**
 * Format a measurement for display.
 *
 * Centimetres get no decimal — nobody measures a waist to a tenth of a
 * centimetre, and printing one implies a precision the tape does not have.
 * Inches get a half, because that is how garment inches are actually quoted.
 */
export function formatLength(cm, unit = 'cm') {
  if (unit === 'in') {
    const inches = cm / CM_PER_INCH;
    return `${(Math.round(inches * 2) / 2).toFixed(1)}"`;
  }
  return `${Math.round(cm)} cm`;
}

/* ── Size systems ──────────────────────────────────────────────────────────────
 *
 * The same garment carries a different label in every market. These are
 * alignments for this brand's own grade, not a universal conversion — there
 * isn't one, which is exactly why the site states the body measurements
 * alongside every label rather than relying on the letter.
 */
export const SIZE_SYSTEMS = ['UK', 'US', 'EU', 'IT', 'JP'];

export const SIZE_LABELS = {
  xs: { UK: '6', US: '2', EU: '34', IT: '38', JP: '5' },
  s: { UK: '8', US: '4', EU: '36', IT: '40', JP: '7' },
  m: { UK: '10', US: '6', EU: '38', IT: '42', JP: '9' },
  l: { UK: '12', US: '8', EU: '40', IT: '44', JP: '11' },
  xl: { UK: '14', US: '10', EU: '42', IT: '46', JP: '13' },
  xxl: { UK: '16', US: '12', EU: '44', IT: '48', JP: '15' },
};

export const sizeLabel = (size, system = 'UK') =>
  (SIZE_LABELS[size] && SIZE_LABELS[size][system]) || size.toUpperCase();

/* ── Measurement points ────────────────────────────────────────────────────── */

export const POINTS = {
  bust: { label: 'Bust', help: 'Around the fullest part, tape level under the arms.' },
  waist: { label: 'Waist', help: 'The narrowest point, usually just above the navel.' },
  hip: { label: 'Hip', help: 'Around the fullest part, roughly 20 cm below the waist.' },
  shoulder: { label: 'Shoulder', help: 'Seam to seam across the back.' },
  inseam: { label: 'Inseam', help: 'Crotch to floor, without shoes.' },
};

/**
 * How far actual ease may sit from the intended ease before it stops reading as
 * the cut the designer drew. Wider on the hip because hip measurement varies
 * most with how the tape is held; tightest on the shoulder, where a centimetre
 * is genuinely visible on the body.
 */
const TOLERANCE_CM = { bust: 3.5, waist: 3.5, hip: 4, shoulder: 1.2, inseam: 2.5 };

/** Points where a garment being *smaller* than intended matters more than larger. */
const SNUG_PENALTY = 1.35;

/* ── Scoring ───────────────────────────────────────────────────────────────── */

/**
 * Score one size against one set of body measurements.
 *
 * Lower is better; 0 is exactly the ease the garment was designed around.
 *
 * Only points the garment actually declares are considered. Scoring a shirt on
 * inseam would be noise, and — worse — would dilute the points that matter by
 * averaging a meaningless zero into them.
 */
export function scoreSize(garment, size, body) {
  const chart = garment.sizes[size];
  if (!chart) return null;

  const points = [];
  let total = 0;
  let counted = 0;

  for (const [point, garmentCm] of Object.entries(chart)) {
    const bodyCm = body[point];
    // A measurement the customer did not give tells us nothing. Treating a
    // missing value as zero would make every garment look enormous.
    if (typeof bodyCm !== 'number' || !Number.isFinite(bodyCm) || bodyCm <= 0) continue;

    const intended = garment.ease[point];
    if (typeof intended !== 'number') continue;

    const actual = garmentCm - bodyCm;
    const drift = actual - intended;
    const tolerance = TOLERANCE_CM[point] || 3;

    // Asymmetric: too tight is a worse outcome than too loose. A relaxed
    // garment is a style choice; one that does not close is a return.
    const weighted = drift < 0 ? Math.abs(drift) * SNUG_PENALTY : drift;

    let verdict = 'as intended';
    if (drift < -tolerance) verdict = 'snug';
    else if (drift > tolerance) verdict = 'relaxed';

    points.push({
      point,
      label: POINTS[point] ? POINTS[point].label : point,
      garmentCm,
      bodyCm,
      easeCm: actual,
      intendedCm: intended,
      driftCm: drift,
      verdict,
    });

    total += weighted;
    counted += 1;
  }

  if (!counted) return null;
  return { size, score: total / counted, points };
}

/**
 * Recommend a size.
 *
 * Returns the best size, and — when the runner-up is close enough that the
 * choice is genuinely a preference rather than a mistake — that too, with the
 * difference described in words.
 */
export function recommendSize(garment, body) {
  const scored = Object.keys(garment.sizes)
    .map((size) => scoreSize(garment, size, body))
    .filter(Boolean)
    .sort((a, b) => a.score - b.score);

  if (!scored.length) {
    return { status: 'insufficient', message: 'Add at least one measurement to see a size.' };
  }

  const best = scored[0];
  const next = scored[1];

  // Outside the grade entirely — say so rather than recommending the end of the
  // range and letting the customer discover it does not fit.
  const OFF_CHART = 7;
  if (best.score > OFF_CHART) {
    return {
      status: 'off-chart',
      best,
      all: scored,
      message:
        'These measurements sit outside this garment’s size range. Our atelier can cut ' +
        'to measure — the contact form is the quickest route.',
    };
  }

  // Close enough that either is defensible.
  const BETWEEN = 0.5;
  if (next && next.score - best.score < BETWEEN) {
    return {
      status: 'between',
      best,
      alternative: next,
      all: scored,
      message: describeTradeoff(best, next),
    };
  }

  return { status: 'confident', best, all: scored, message: describeFit(best) };
}

/** Plain-language summary of how one size sits. */
export function describeFit(result) {
  const off = result.points.filter((p) => p.verdict !== 'as intended');
  if (!off.length) return 'This is the fit the garment was cut for, at every point.';

  const parts = off.map((p) => `${p.verdict} at the ${p.label.toLowerCase()}`);
  return `As intended, except ${joinWords(parts)}.`;
}

/** Why someone might pick one of two close sizes over the other. */
export function describeTradeoff(best, next) {
  const diffs = [];
  for (const point of best.points) {
    const other = next.points.find((p) => p.point === point.point);
    if (!other || point.verdict === other.verdict) continue;
    diffs.push(
      `${point.label.toLowerCase()} is ${point.verdict} in ${best.size.toUpperCase()} and ` +
        `${other.verdict} in ${next.size.toUpperCase()}`,
    );
  }
  if (!diffs.length) {
    return `Both sizes fit. ${best.size.toUpperCase()} is the closer of the two.`;
  }
  return `You are between sizes: ${joinWords(diffs)}.`;
}

function joinWords(list) {
  if (list.length === 1) return list[0];
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

/** Model context: the size the pictured garment is shown in, and on what body. */
export function modelNote(garment) {
  const m = garment.model;
  if (!m) return null;
  return `Shown in size ${m.size.toUpperCase()} on a ${m.height} cm frame measuring ` +
    `${m.bust}–${m.waist}–${m.hip}.`;
}
