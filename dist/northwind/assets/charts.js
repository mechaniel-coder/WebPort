/**
 * Northwind chart engine — hand-built SVG, no charting library.
 *
 * Like rates.js on the hospitality site, this module has two consumers and no
 * dependencies: the build imports it to render the dashboard's initial state
 * into the HTML (so the charts exist without JavaScript, and a table view is
 * always reachable), and the browser imports it to re-render on interaction.
 *
 * Mark specs follow one convention throughout:
 *   · lines 2px, round join and cap
 *   · end markers r=4 with a 2px ring in the surface colour
 *   · area fills at 10% opacity — a wash, never a block
 *   · bars capped at 24px with a 4px rounded data-end, square at the baseline
 *   · a 2px surface gap separates every touching mark
 *   · gridlines hairline, solid, one step off the surface
 *
 * Colours are emitted as CSS custom properties, so the palette lives in one
 * place in the stylesheet and the SVG never hard-codes a hex value.
 */

/* ── Seeded data generation ────────────────────────────────────────────────── */

/**
 * Deterministic generator. Real telemetry would come from an API; using
 * Math.random() here would make the charts rearrange themselves on every
 * render and the build non-reproducible.
 */
export function rng(seed) {
  let state = typeof seed === 'string' ? hash(seed) : seed || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 4294967296;
  };
}

function hash(text) {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

/**
 * A plausible telemetry series: a daily sine cycle, slow drift, bounded noise
 * and the occasional spike.
 */
export function makeSeries({
  seed,
  points = 48,
  base = 100,
  amplitude = 0.25,
  drift = 0,
  noise = 0.08,
  spikes = 0,
  cycles = 2,
  floor = 0,
}) {
  const random = rng(seed);
  const spikeAt = new Set();
  for (let index = 0; index < spikes; index += 1) {
    spikeAt.add(Math.floor(random() * points));
  }

  const values = [];
  for (let index = 0; index < points; index += 1) {
    const t = index / (points - 1 || 1);
    const cycle = Math.sin(t * Math.PI * 2 * cycles - Math.PI / 2) * amplitude;
    const trend = drift * t;
    const jitter = (random() - 0.5) * 2 * noise;
    let value = base * (1 + cycle + trend + jitter);
    if (spikeAt.has(index)) value *= 1.5 + random() * 0.9;
    values.push(Math.max(floor, value));
  }
  return values;
}

/* ── Scales and helpers ────────────────────────────────────────────────────── */

/** Round an axis maximum up to a clean number. */
export function niceMax(value) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

export function ticksFor(max, count = 4) {
  return Array.from({ length: count + 1 }, (unused, index) => (max / count) * index);
}

export function compact(value) {
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${trim(value / 1e9)}B`;
  if (abs >= 1e6) return `${trim(value / 1e6)}M`;
  if (abs >= 1e3) return `${trim(value / 1e3)}K`;
  return trim(value);
}

function trim(value) {
  return Number(value.toFixed(value < 10 ? 1 : 0)).toLocaleString('en-US');
}

function escapeAttr(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
}

/* ── Geometry ──────────────────────────────────────────────────────────────── */

/**
 * Chart sizes are shared rather than defaulted per call.
 *
 * SVG text scales with the viewBox, so a chart whose viewBox is much narrower
 * than the box it renders into gets visibly larger axis labels than its
 * neighbours. Each size below is chosen to land near a 1:1 scale in the panel it
 * occupies, which keeps tick text the same size across the whole dashboard.
 */
export const CHART_SIZES = {
  line: { width: 720, height: 260 },
  area: { width: 1200, height: 300 },
  bars: { width: 460 },
};

const PAD = { top: 16, right: 18, bottom: 26, left: 46 };

function plot(width, height) {
  return {
    x0: PAD.left,
    y0: PAD.top,
    x1: width - PAD.right,
    y1: height - PAD.bottom,
    get w() {
      return this.x1 - this.x0;
    },
    get h() {
      return this.y1 - this.y0;
    },
  };
}

function pointsFor(values, area, max) {
  const step = values.length > 1 ? area.w / (values.length - 1) : 0;
  return values.map((value, index) => [
    area.x0 + index * step,
    area.y1 - (value / max) * area.h,
  ]);
}

function linePath(points) {
  return points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');
}

/** Gridlines and y-axis labels, drawn first so data always sits on top. */
function grid(area, max, format) {
  return ticksFor(max)
    .map((tick) => {
      const y = area.y1 - (tick / max) * area.h;
      return `<line x1="${area.x0}" y1="${y.toFixed(1)}" x2="${area.x1}" y2="${y.toFixed(1)}"
          stroke="var(--chart-grid)" stroke-width="1"/>
        <text x="${area.x0 - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end"
          class="chart__tick">${escapeAttr(format(tick))}</text>`;
    })
    .join('');
}

function xLabels(labels, area) {
  if (!labels.length) return '';
  const step = labels.length > 1 ? area.w / (labels.length - 1) : 0;
  // Thin the labels so they never collide at narrow widths.
  const every = Math.max(1, Math.ceil(labels.length / 6));
  return labels
    .map((label, index) => {
      if (index % every !== 0 && index !== labels.length - 1) return '';
      const x = area.x0 + index * step;
      const anchor = index === 0 ? 'start' : index === labels.length - 1 ? 'end' : 'middle';
      return `<text x="${x.toFixed(1)}" y="${area.y1 + 18}" text-anchor="${anchor}"
        class="chart__tick">${escapeAttr(label)}</text>`;
    })
    .join('');
}

/* ── Line chart ────────────────────────────────────────────────────────────── */

/**
 * Multi-series line chart with a crosshair layer.
 *
 * @param {object} options
 * @param {Array<{name:string, values:number[], slot:number}>} options.series
 * @param {string[]} options.labels   x-axis labels, one per point
 * @param {string}   options.titleId  id of the heading this chart is labelled by
 */
export function lineChart({
  series,
  labels,
  width = CHART_SIZES.line.width,
  height = CHART_SIZES.line.height,
  format = compact,
  titleId,
  showEndMarkers = true,
}) {
  const area = plot(width, height);
  const max = niceMax(Math.max(...series.flatMap((entry) => entry.values)) * 1.1);

  const paths = series
    .map((entry) => {
      const points = pointsFor(entry.values, area, max);
      const end = points[points.length - 1];
      return `<g>
        <path d="${linePath(points)}" fill="none" stroke="var(--series-${entry.slot})"
          stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
        ${
          showEndMarkers
            ? `<circle cx="${end[0].toFixed(1)}" cy="${end[1].toFixed(1)}" r="4"
                 fill="var(--series-${entry.slot})"
                 stroke="var(--chart-surface)" stroke-width="2"/>`
            : ''
        }
      </g>`;
    })
    .join('');

  return `<svg class="chart" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"
    preserveAspectRatio="xMidYMid meet" role="img"
    ${titleId ? `aria-labelledby="${escapeAttr(titleId)}"` : 'aria-hidden="true"'}
    data-chart="line" data-max="${max}"
    data-plot="${area.x0},${area.y0},${area.x1},${area.y1}">
    ${grid(area, max, format)}
    ${xLabels(labels, area)}
    <line x1="${area.x0}" y1="${area.y1}" x2="${area.x1}" y2="${area.y1}"
      stroke="var(--chart-axis)" stroke-width="1"/>
    ${paths}
    <g class="chart__crosshair" hidden>
      <line y1="${area.y0}" y2="${area.y1}" stroke="var(--chart-axis)" stroke-width="1"/>
      ${series
        .map(
          (entry) => `<circle r="4" fill="var(--series-${entry.slot})"
            stroke="var(--chart-surface)" stroke-width="2"/>`,
        )
        .join('')}
    </g>
  </svg>`;
}

/* ── Stacked area ──────────────────────────────────────────────────────────── */

/**
 * Stacked area. Bands are separated by a 2px stroke in the surface colour —
 * the surface gap — rather than an outline, so no non-data ink is added.
 */
export function stackedArea({
  series,
  labels,
  width = CHART_SIZES.area.width,
  height = CHART_SIZES.area.height,
  format = compact,
  titleId,
}) {
  const area = plot(width, height);
  const totals = series[0].values.map((unused, index) =>
    series.reduce((sum, entry) => sum + entry.values[index], 0),
  );
  const max = niceMax(Math.max(...totals) * 1.05);

  let running = series[0].values.map(() => 0);
  const bands = series
    .map((entry) => {
      const lower = pointsFor(running, area, max);
      running = running.map((value, index) => value + entry.values[index]);
      const upper = pointsFor(running, area, max);

      const shape = `${linePath(upper)} L ${lower[lower.length - 1][0].toFixed(1)} ${lower[
        lower.length - 1
      ][1].toFixed(1)} ${lower
        .slice()
        .reverse()
        .slice(1)
        .map(([x, y]) => `L ${x.toFixed(1)} ${y.toFixed(1)}`)
        .join(' ')} Z`;

      return `<g>
        <path d="${shape}" fill="var(--series-${entry.slot})" fill-opacity="0.22"/>
        <path d="${linePath(upper)}" fill="none" stroke="var(--chart-surface)"
          stroke-width="2" stroke-linejoin="round"/>
        <path d="${linePath(upper)}" fill="none" stroke="var(--series-${entry.slot})"
          stroke-width="2" stroke-linejoin="round" stroke-opacity="0.85"/>
      </g>`;
    })
    .join('');

  return `<svg class="chart" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"
    preserveAspectRatio="xMidYMid meet" role="img"
    ${titleId ? `aria-labelledby="${escapeAttr(titleId)}"` : 'aria-hidden="true"'}
    data-chart="area" data-max="${max}"
    data-plot="${area.x0},${area.y0},${area.x1},${area.y1}">
    ${grid(area, max, format)}
    ${xLabels(labels, area)}
    <line x1="${area.x0}" y1="${area.y1}" x2="${area.x1}" y2="${area.y1}"
      stroke="var(--chart-axis)" stroke-width="1"/>
    ${bands}
    <g class="chart__crosshair" hidden>
      <line y1="${area.y0}" y2="${area.y1}" stroke="var(--chart-axis)" stroke-width="1"/>
    </g>
  </svg>`;
}

/* ── Horizontal bars ───────────────────────────────────────────────────────── */

/**
 * Single-series horizontal bars — one colour, because rank is not identity.
 * Values ride the bar tip; the label sits outside when it will not fit inside.
 */
export function barChart({ rows, width = CHART_SIZES.bars.width, format = compact, titleId }) {
  const max = Math.max(...rows.map((row) => row.value));
  const barHeight = 18; // under the 24px cap
  const gap = 14; // includes the 2px surface gap plus air
  const labelWidth = 128;
  const valueWidth = 52;
  const height = rows.length * (barHeight + gap);
  const trackWidth = width - labelWidth - valueWidth;

  const bars = rows
    .map((row, index) => {
      const y = index * (barHeight + gap);
      const length = Math.max(3, (row.value / max) * trackWidth);
      // 4px rounded data-end, square at the baseline.
      const radius = Math.min(4, length / 2);
      const path =
        `M ${labelWidth} ${y} h ${length - radius} a ${radius} ${radius} 0 0 1 ${radius} ${radius}` +
        ` v ${barHeight - radius * 2} a ${radius} ${radius} 0 0 1 ${-radius} ${radius}` +
        ` h ${-(length - radius)} Z`;

      return `<g class="chart__bar" data-label="${escapeAttr(row.label)}"
          data-value="${escapeAttr(format(row.value))}" tabindex="0" role="listitem"
          aria-label="${escapeAttr(`${row.label}: ${format(row.value)}`)}">
        <rect x="0" y="${y - 4}" width="${width}" height="${barHeight + 8}" fill="transparent"/>
        <text x="0" y="${y + barHeight - 4}" class="chart__bar-label">${escapeAttr(row.label)}</text>
        <path d="${path}" fill="var(--series-1)"/>
        <text x="${labelWidth + length + 8}" y="${y + barHeight - 4}"
          class="chart__bar-value">${escapeAttr(format(row.value))}</text>
      </g>`;
    })
    .join('');

  return `<svg class="chart chart--bars" viewBox="0 0 ${width} ${height}"
    preserveAspectRatio="xMinYMin meet" role="list"
    ${titleId ? `aria-labelledby="${escapeAttr(titleId)}"` : ''}>
    ${bars}
  </svg>`;
}

/* ── Sparkline ─────────────────────────────────────────────────────────────── */

/** Twelve-point trend for a stat tile. Decorative — the value carries the meaning. */
export function sparkline(values, { width = 96, height = 28, slot = 1 } = {}) {
  const max = Math.max(...values) * 1.1 || 1;
  const min = Math.min(...values) * 0.9;
  const span = max - min || 1;
  const step = width / (values.length - 1 || 1);
  const points = values.map((value, index) => [
    index * step,
    height - ((value - min) / span) * height,
  ]);
  const last = points[points.length - 1];

  return `<svg class="spark" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"
    preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <path d="${linePath(points)}" fill="none" stroke="var(--series-${slot})" stroke-width="2"
      stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
    <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="2.5"
      fill="var(--series-${slot})"/>
  </svg>`;
}

/* ── Table view ────────────────────────────────────────────────────────────── */

/**
 * The non-visual route to the same numbers. Every chart on the dashboard has
 * one, so no value is reachable only by hovering.
 */
export function dataTable({ series, labels, caption, format = compact, unit = '' }) {
  const head = series
    .map((entry) => `<th scope="col">${escapeAttr(entry.name)}${unit ? ` (${escapeAttr(unit)})` : ''}</th>`)
    .join('');

  const body = labels
    .map(
      (label, index) => `<tr>
      <th scope="row">${escapeAttr(label)}</th>
      ${series.map((entry) => `<td>${escapeAttr(format(entry.values[index]))}</td>`).join('')}
    </tr>`,
    )
    .join('');

  return `<table class="data-table">
    <caption>${escapeAttr(caption)}</caption>
    <thead><tr><th scope="col">Time</th>${head}</tr></thead>
    <tbody>${body}</tbody>
  </table>`;
}

/* ── Legend ────────────────────────────────────────────────────────────────── */

/**
 * Always present for two or more series. A single series gets none — the
 * heading already names what is plotted.
 */
export function legend(series, { mark = 'line' } = {}) {
  if (series.length < 2) return '';
  return `<ul class="legend">
    ${series
      .map(
        (entry) => `<li class="legend__item">
        <span class="legend__key legend__key--${mark}" style="--key: var(--series-${entry.slot})"
          aria-hidden="true"></span>
        <span>${escapeAttr(entry.name)}</span>
      </li>`,
      )
      .join('')}
  </ul>`;
}

/* ── Dashboard dataset ─────────────────────────────────────────────────────── */

/**
 * The demo dataset, built once from a fixed seed so the server-rendered charts
 * and the client-side re-render always agree.
 */
export const RANGES = {
  '24h': { points: 48, stride: 30, unit: 'minute', label: 'Last 24 hours' },
  '7d': { points: 56, stride: 3, unit: 'hour', label: 'Last 7 days' },
  '30d': { points: 60, stride: 12, unit: 'hour', label: 'Last 30 days' },
};

export function buildDataset(range = '24h', tick = 0) {
  const config = RANGES[range] || RANGES['24h'];
  const { points } = config;
  const suffix = `${range}:${tick}`;

  const latency = [
    {
      name: 'p50',
      slot: 1,
      values: makeSeries({ seed: `p50:${suffix}`, points, base: 42, amplitude: 0.18, noise: 0.06 }),
    },
    {
      name: 'p95',
      slot: 2,
      values: makeSeries({
        seed: `p95:${suffix}`,
        points,
        base: 128,
        amplitude: 0.22,
        noise: 0.09,
        spikes: 2,
      }),
    },
    {
      name: 'p99',
      slot: 3,
      values: makeSeries({
        seed: `p99:${suffix}`,
        points,
        base: 265,
        amplitude: 0.26,
        noise: 0.12,
        spikes: 3,
      }),
    },
  ];

  const throughput = [
    {
      name: 'Metrics',
      slot: 1,
      values: makeSeries({ seed: `m:${suffix}`, points, base: 1_850_000, amplitude: 0.2 }),
    },
    {
      name: 'Traces',
      slot: 2,
      values: makeSeries({ seed: `t:${suffix}`, points, base: 940_000, amplitude: 0.24 }),
    },
    {
      name: 'Logs',
      slot: 3,
      values: makeSeries({ seed: `l:${suffix}`, points, base: 1_420_000, amplitude: 0.3 }),
    },
  ];

  const errorRandom = rng(`err:${suffix}`);
  const endpoints = [
    'POST /v1/ingest',
    'GET /v1/query',
    'POST /v1/traces',
    'GET /v1/dashboards',
    'POST /v1/alerts',
  ].map((label) => ({ label, value: Math.round(40 + errorRandom() * 780) }));
  endpoints.sort((a, b) => b.value - a.value);

  return { config, labels: makeLabels(config, tick), latency, throughput, endpoints };
}

/**
 * X-axis labels. Anchored to a fixed reference instant rather than `Date.now()`
 * so a build is byte-for-byte reproducible; the live ticker advances it.
 */
function makeLabels(config, tick) {
  const anchor = Date.UTC(2026, 7, 15, 12, 0, 0) + tick * config.stride * 60000;
  return Array.from({ length: config.points }, (unused, index) => {
    const offset = (config.points - 1 - index) * config.stride;
    const date = new Date(anchor - offset * 60000);
    if (config.unit === 'minute') {
      return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  });
}

/** Headline figures derived from the same dataset the charts draw. */
export function summarize(dataset) {
  const latest = (series) => series.values[series.values.length - 1];
  const previous = (series) => series.values[Math.max(0, series.values.length - 13)];
  const delta = (series) => ((latest(series) - previous(series)) / previous(series)) * 100;

  const throughputNow = dataset.throughput.reduce((sum, entry) => sum + latest(entry), 0);
  const errors = dataset.endpoints.reduce((sum, row) => sum + row.value, 0);

  return {
    ingest: {
      label: 'Events per second',
      value: compact(throughputNow),
      delta: dataset.throughput.reduce((sum, entry) => sum + delta(entry), 0) / 3,
      spark: dataset.throughput[0].values.slice(-12),
      goodWhenUp: true,
    },
    latency: {
      label: 'p95 latency',
      value: `${Math.round(latest(dataset.latency[1]))} ms`,
      delta: delta(dataset.latency[1]),
      spark: dataset.latency[1].values.slice(-12),
      goodWhenUp: false,
      slot: 2,
    },
    errors: {
      label: 'Errors in window',
      value: compact(errors),
      delta: -12.4,
      spark: dataset.latency[2].values.slice(-12),
      goodWhenUp: false,
      slot: 3,
    },
    uptime: {
      label: 'Availability',
      value: '99.982%',
      delta: 0.004,
      spark: dataset.throughput[2].values.slice(-12),
      goodWhenUp: true,
    },
  };
}
