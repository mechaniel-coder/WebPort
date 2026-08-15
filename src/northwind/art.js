/**
 * Northwind diagrams — original SVG.
 *
 * A marketing site for an infrastructure product needs to show the shape of the
 * system, not decorate around it. These are drawn from one vocabulary: rounded
 * nodes on a rail, a highlighted stage, and labelled edges.
 */
import { esc } from '../_lib/html.js';

/**
 * The ingest pipeline. `highlight` accents one stage so each feature page can
 * show where it sits without a bespoke drawing.
 */
export function pipeline({ highlight = null, title = null } = {}) {
  const stages = [
    { id: 'sources', label: 'Your services', sub: 'OTLP · Prometheus · syslog' },
    { id: 'collector', label: 'Collector', sub: 'Redact · sample · batch' },
    { id: 'store', label: 'Northwind', sub: 'Columnar store' },
    { id: 'consume', label: 'Query', sub: 'NWQL · dashboards · alerts' },
  ];

  const width = 900;
  const height = 190;
  const boxWidth = 186;
  const boxHeight = 76;
  const gap = (width - stages.length * boxWidth) / (stages.length - 1);
  const top = 58;

  const nodes = stages
    .map((stage, index) => {
      const x = index * (boxWidth + gap);
      const active = stage.id === highlight;
      return `<g>
        <rect x="${x}" y="${top}" width="${boxWidth}" height="${boxHeight}" rx="9"
          fill="${active ? 'rgba(79,143,247,0.14)' : '#161d2a'}"
          stroke="${active ? '#4f8ff7' : '#2a3345'}" stroke-width="1.5"/>
        <text x="${x + boxWidth / 2}" y="${top + 31}" text-anchor="middle"
          fill="#f2f5fa" font-size="15" font-weight="600"
          font-family="system-ui, sans-serif">${esc(stage.label)}</text>
        <text x="${x + boxWidth / 2}" y="${top + 53}" text-anchor="middle"
          fill="#7b88a0" font-size="11.5"
          font-family="ui-monospace, Menlo, monospace">${esc(stage.sub)}</text>
      </g>`;
    })
    .join('');

  const edges = stages
    .slice(0, -1)
    .map((unused, index) => {
      const x = index * (boxWidth + gap) + boxWidth;
      const y = top + boxHeight / 2;
      return `<g stroke="#39435a" stroke-width="1.5" fill="none">
        <line x1="${x + 6}" y1="${y}" x2="${x + gap - 12}" y2="${y}"/>
        <path d="M ${x + gap - 12} ${y} l -6 -4 v 8 Z" fill="#39435a" stroke="none"/>
      </g>`;
    })
    .join('');

  return `<svg class="diagram" viewBox="0 0 ${width} ${height}"
    xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"
    ${title ? 'role="img"' : 'aria-hidden="true" focusable="false"'}>
    ${title ? `<title>${esc(title)}</title>` : ''}
    <text x="0" y="26" fill="#7b88a0" font-size="11.5" letter-spacing="1.6"
      font-family="ui-monospace, Menlo, monospace">INGEST PATH</text>
    ${edges}
    ${nodes}
    <text x="0" y="${height - 8}" fill="#7b88a0" font-size="11.5"
      font-family="ui-monospace, Menlo, monospace">
      Redaction happens before data leaves your network
    </text>
  </svg>`;
}

/**
 * Sampling comparison — head sampling discards before it knows what matters,
 * tail sampling decides once the trace is whole. Drawn as two rows of spans.
 */
export function samplingDiagram({ title = null } = {}) {
  const width = 900;
  const height = 230;
  const traces = 14;
  const traceWidth = 44;
  const gap = (width - traces * traceWidth) / (traces - 1);

  // Fixed pattern rather than random, so the drawing is stable between builds.
  const errors = new Set([2, 5, 9, 12]);
  const headKept = new Set([0, 4, 8, 11]);

  const row = (y, label, kept, note) => {
    const marks = Array.from({ length: traces }, (unused, index) => {
      const x = index * (traceWidth + gap);
      const isError = errors.has(index);
      const isKept = kept.has(index);
      const color = isError ? '#d95926' : '#199e70';
      return `<rect x="${x}" y="${y}" width="${traceWidth}" height="16" rx="4"
        fill="${isKept ? color : '#1c2433'}"
        stroke="${isKept ? 'none' : '#2a3345'}" stroke-width="1"/>`;
    }).join('');

    return `<g>
      <text x="0" y="${y - 12}" fill="#f2f5fa" font-size="13" font-weight="600"
        font-family="system-ui, sans-serif">${esc(label)}</text>
      <text x="${width}" y="${y - 12}" text-anchor="end" fill="#7b88a0" font-size="11.5"
        font-family="ui-monospace, Menlo, monospace">${esc(note)}</text>
      ${marks}
    </g>`;
  };

  return `<svg class="diagram" viewBox="0 0 ${width} ${height}"
    xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"
    ${title ? 'role="img"' : 'aria-hidden="true" focusable="false"'}>
    ${title ? `<title>${esc(title)}</title>` : ''}
    <text x="0" y="18" fill="#7b88a0" font-size="11.5" letter-spacing="1.6"
      font-family="ui-monospace, Menlo, monospace">100 TRACES, 4 CONTAINING ERRORS</text>
    ${row(64, 'Head sampling at 30%', headKept, '1 of 4 errors kept')}
    ${row(150, 'Tail sampling', new Set([...errors, 0, 4, 8, 11]), 'all 4 errors kept')}
    <g font-family="ui-monospace, Menlo, monospace" font-size="11.5" fill="#7b88a0">
      <rect x="0" y="200" width="11" height="11" rx="3" fill="#d95926"/>
      <text x="18" y="210">error trace</text>
      <rect x="110" y="200" width="11" height="11" rx="3" fill="#199e70"/>
      <text x="128" y="210">healthy trace</text>
      <rect x="238" y="200" width="11" height="11" rx="3" fill="#1c2433" stroke="#2a3345"/>
      <text x="256" y="210">discarded</text>
    </g>
  </svg>`;
}

/**
 * Storage model — what gets indexed versus what gets scanned. The argument for
 * why the bill is lower, drawn rather than asserted.
 */
export function storageDiagram({ title = null } = {}) {
  const width = 900;
  const height = 210;

  const bar = (y, label, segments) => {
    let x = 250;
    const parts = segments
      .map((segment) => {
        const w = segment.share * 560;
        const rect = `<rect x="${x}" y="${y}" width="${Math.max(0, w - 2)}" height="34" rx="4"
          fill="${segment.color}" fill-opacity="${segment.opacity ?? 1}"/>
        ${
          w > 74
            ? `<text x="${x + w / 2 - 1}" y="${y + 22}" text-anchor="middle" fill="#0b0e14"
                 font-size="11.5" font-weight="620"
                 font-family="ui-monospace, Menlo, monospace">${esc(segment.label)}</text>`
            : ''
        }`;
        x += w;
        return rect;
      })
      .join('');

    return `<g>
      <text x="0" y="${y + 22}" fill="#f2f5fa" font-size="13"
        font-family="system-ui, sans-serif">${esc(label)}</text>
      ${parts}
    </g>`;
  };

  return `<svg class="diagram" viewBox="0 0 ${width} ${height}"
    xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"
    ${title ? 'role="img"' : 'aria-hidden="true" focusable="false"'}>
    ${title ? `<title>${esc(title)}</title>` : ''}
    <text x="0" y="20" fill="#7b88a0" font-size="11.5" letter-spacing="1.6"
      font-family="ui-monospace, Menlo, monospace">WHERE THE COST GOES</text>
    ${bar(
      48,
      'Index-everything',
      [
        { share: 0.72, color: '#d95926', label: 'index' },
        { share: 0.28, color: '#3987e5', label: 'storage' },
      ],
    )}
    ${bar(
      110,
      'Northwind',
      [
        { share: 0.14, color: '#d95926', label: 'index' },
        { share: 0.34, color: '#3987e5', label: 'storage' },
      ],
    )}
    <text x="250" y="180" fill="#7b88a0" font-size="11.5"
      font-family="ui-monospace, Menlo, monospace">
      Metadata is indexed; bodies are scanned from compressed columns
    </text>
  </svg>`;
}

/**
 * Diagram by feature slug. Each accepts `{ title }` — supplying one switches the
 * SVG from decorative to `role="img"` with an accessible name, so the same
 * drawing can be used either way.
 */
export const DIAGRAMS = {
  metrics: (options = {}) => pipeline({ highlight: 'store', ...options }),
  traces: (options = {}) => samplingDiagram(options),
  logs: (options = {}) => storageDiagram(options),
};
