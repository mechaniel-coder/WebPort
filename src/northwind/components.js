/**
 * Northwind page components.
 *
 * The dashboard is rendered here, at build time, from the same chart module the
 * browser uses. That means the charts exist in the HTML before any JavaScript
 * runs — the demo is readable without scripting, and the client script upgrades
 * it with range switching, a crosshair and live updates rather than creating it.
 */
import { each, esc } from '../_lib/html.js';
import {
  RANGES,
  barChart,
  buildDataset,
  compact,
  dataTable,
  legend,
  lineChart,
  sparkline,
  stackedArea,
  summarize,
} from './assets/charts.js';

/* ── Small pieces ──────────────────────────────────────────────────────────── */

export function crumbs(trail, url) {
  return `<nav class="crumbs" aria-label="Breadcrumb">
    <ol>
      ${each(
        trail,
        (crumb, index) =>
          `<li>${
            index === trail.length - 1
              ? `<span aria-current="page">${esc(crumb.label)}</span>`
              : `<a href="${esc(url(crumb.href))}">${esc(crumb.label)}</a>`
          }</li>`,
      )}
    </ol>
  </nav>`;
}

/**
 * `note` renders after the heading, never before it.
 *
 * Every heading on this site used to carry a small label above it, and the
 * labels mostly restated the heading they sat on — "Documentation" over "The
 * docs", "Pricing" over "Billed on bytes, not on people." Where the line
 * genuinely adds something (a sector, a signal type) it belongs under the
 * title as a caption.
 */
export function pageHead({ note, title, lede, trail, url, actions = '' }) {
  return `<section class="page-head">
    <div class="shell">
      ${trail ? crumbs(trail, url) : ''}
      <h1 class="h1 page-head__title">${esc(title)}</h1>
      ${note ? `<p class="note">${esc(note)}</p>` : ''}
      ${lede ? `<p class="lede">${esc(lede)}</p>` : ''}
      ${actions}
    </div>
  </section>`;
}

export function sectionHead({ note, title, body, id, link, url, split = false }) {
  return `<div class="section-head${split ? ' section-head--split' : ''}">
    <div>
      <h2 class="h2"${id ? ` id="${esc(id)}"` : ''}>${esc(title)}</h2>
      ${note ? `<p class="note">${esc(note)}</p>` : ''}
      ${body ? `<p class="lede" style="margin-top:var(--space-xs)">${esc(body)}</p>` : ''}
    </div>
    ${link ? `<a class="arrow-link" href="${esc(url(link.href))}">${esc(link.label)}</a>` : ''}
  </div>`;
}

export function cta({ url, title, body, primary, secondary }) {
  return `<section class="cta">
    <div class="shell cta__inner">
      <h2 class="h2">${esc(title)}</h2>
      ${body ? `<p class="lede">${esc(body)}</p>` : ''}
      <div class="hero__actions">
        <a class="btn btn--lg" href="${esc(url(primary.href))}">${esc(primary.label)}</a>
        ${
          secondary
            ? `<a class="btn btn--ghost btn--lg" href="${esc(url(secondary.href))}">${esc(secondary.label)}</a>`
            : ''
        }
      </div>
    </div>
  </section>`;
}

export function accordion(items, idPrefix) {
  return `<div class="accordion" data-accordion>
    ${each(
      items,
      (item, index) => `<div class="accordion__item">
      <h3>
        <button class="accordion__trigger" type="button"
                id="${idPrefix}-t-${index}" aria-expanded="false"
                aria-controls="${idPrefix}-p-${index}" data-accordion-trigger>
          <span>${esc(item.question)}</span>
          <span class="accordion__icon" aria-hidden="true"></span>
        </button>
      </h3>
      <div class="accordion__panel" id="${idPrefix}-p-${index}" role="region"
           aria-labelledby="${idPrefix}-t-${index}">
        <p>${esc(item.answer)}</p>
      </div>
    </div>`,
    )}
  </div>`;
}

/**
 * Syntax-highlighted code block. The highlighter is a deliberate three-token
 * approximation — comments, strings and numbers — rather than a real parser,
 * because a marketing page does not need one and a real one is 40 KB.
 */
export function codeBlock({ language, filename, code }) {
  return `<div class="code">
    <div class="code__head">
      <span>${esc(filename)}</span>
      <span>${esc(language)}</span>
    </div>
    <pre data-scroll-region tabindex="0" role="region"
         aria-label="${esc(filename)}, scrollable code"><code>${highlight(code)}</code></pre>
  </div>`;
}

function highlight(code) {
  return esc(code)
    .replace(/(#.*$)/gm, '<span class="tok-com">$1</span>')
    .replace(/(&quot;[^&]*?&quot;)/g, '<span class="tok-str">$1</span>')
    .replace(/\b(\d+(?:\.\d+)?[a-z]*)\b/g, '<span class="tok-num">$1</span>')
    .replace(/^(\s*)([\w.-]+)(:)/gm, '$1<span class="tok-key">$2</span>$3');
}

/* ── Dashboard ─────────────────────────────────────────────────────────────── */

const INCIDENTS = [
  { when: '14:02', tone: 'good', what: '<strong>checkout-api</strong> recovered — p95 back under 200 ms' },
  { when: '13:58', tone: 'warning', what: '<strong>checkout-api</strong> p95 above objective for 4 min' },
  { when: '13:31', tone: 'good', what: 'Deploy <strong>v2026.8.3</strong> completed across 3 regions' },
  { when: '12:47', tone: 'good', what: '<strong>ingest-eu</strong> autoscaled 18 → 24 nodes' },
  { when: '11:20', tone: 'critical', what: '<strong>trace-store</strong> shard 7 failover, 41 s of degraded writes' },
];

const ms = (value) => `${Math.round(value)}`;

/**
 * The full dashboard, server-rendered at the default range.
 * `data-dashboard` is the hook the client script upgrades.
 */
export function dashboard({ range = '24h' } = {}) {
  const dataset = buildDataset(range, 0);
  const stats = summarize(dataset);

  return `<div class="dashboard" data-dashboard data-range="${esc(range)}">
    <div class="dash-bar">
      <p class="dash-bar__title">
        <span class="status-dot" aria-hidden="true"></span>
        Production
        <span class="dash-bar__env">us-east-1</span>
      </p>

      <div class="segmented" role="group" aria-label="Time range">
        ${each(
          Object.entries(RANGES),
          ([key, config]) => `<button type="button" data-range-button="${esc(key)}"
          aria-pressed="${key === range}">
          <span class="visually-hidden">${esc(config.label)}</span>
          <span aria-hidden="true">${esc(key)}</span>
        </button>`,
        )}
      </div>

      <button class="live-toggle" type="button" aria-pressed="false" data-live>
        <span class="live-toggle__dot" aria-hidden="true"></span>
        <span>Live</span>
      </button>
    </div>

    <div class="stats" data-stats>${statTiles(stats)}</div>

    <div class="panels">
      ${latencyPanel(dataset)}
      ${errorsPanel(dataset)}
      ${throughputPanel(dataset)}
    </div>
  </div>`;
}

function statTiles(stats) {
  return each(Object.entries(stats), ([key, stat]) => {
    const up = stat.delta >= 0;
    const good = up === stat.goodWhenUp;
    return `<div class="stat" data-stat="${esc(key)}">
      <p class="stat__label">${esc(stat.label)}</p>
      <div class="stat__row">
        <p class="stat__value">${esc(stat.value)}</p>
        ${sparkline(stat.spark, { slot: stat.slot || 1 })}
      </div>
      <p class="stat__delta" data-sentiment="${good ? 'good' : 'bad'}">
        <span aria-hidden="true">${up ? '↑' : '↓'}</span>
        ${Math.abs(stat.delta).toFixed(1)}%
        <span class="visually-hidden">${up ? 'up' : 'down'}, which is
          ${good ? 'good' : 'not good'},</span>
        <span style="color:var(--text-muted)">vs previous period</span>
      </p>
    </div>`;
  });
}

function latencyPanel(dataset) {
  return `<section class="panel" aria-labelledby="p-latency">
    <div class="panel__head">
      <h3 class="panel__title" id="p-latency">Request latency</h3>
      <p class="panel__sub" data-range-label>milliseconds ·
        ${esc(dataset.config.label.toLowerCase())}</p>
    </div>

    <figure class="panel__figure" data-figure="latency" tabindex="0" role="group"
            aria-label="Request latency over time. Use arrow keys to read values.">
      ${lineChart({ series: dataset.latency, labels: dataset.labels, titleId: 'p-latency', format: ms })}
      <div class="chart-tip" data-tip hidden></div>
    </figure>

    <div class="panel__legend">
      ${legend(dataset.latency, { mark: 'line' })}
      <button class="table-toggle" type="button" data-table-toggle="latency"
              aria-expanded="false" aria-controls="table-latency">Table view</button>
    </div>

    <div class="table-wrap" id="table-latency" data-table="latency" hidden>
      ${dataTable({
        series: dataset.latency,
        labels: dataset.labels,
        caption: 'Request latency by percentile',
        format: ms,
        unit: 'ms',
      })}
    </div>
  </section>`;
}

function errorsPanel(dataset) {
  return `<section class="panel" aria-labelledby="p-errors">
    <div class="panel__head">
      <h3 class="panel__title" id="p-errors">Errors by endpoint</h3>
      <p class="panel__sub">5xx responses</p>
    </div>

    <figure class="panel__figure" data-figure="errors">
      ${barChart({ rows: dataset.endpoints, titleId: 'p-errors' })}
    </figure>

    <div class="panel__legend">
      <p class="panel__sub">Top 5 of 214 endpoints</p>
      <button class="table-toggle" type="button" data-table-toggle="errors"
              aria-expanded="false" aria-controls="table-errors">Table view</button>
    </div>

    <div class="table-wrap" id="table-errors" data-table="errors" hidden>
      <table class="data-table">
        <caption>5xx responses by endpoint</caption>
        <thead><tr><th scope="col">Endpoint</th><th scope="col">Errors</th></tr></thead>
        <tbody>
          ${each(
            dataset.endpoints,
            (row) => `<tr><th scope="row">${esc(row.label)}</th><td>${esc(compact(row.value))}</td></tr>`,
          )}
        </tbody>
      </table>
    </div>
  </section>`;
}

function throughputPanel(dataset) {
  return `<section class="panel panel--wide" aria-labelledby="p-throughput">
    <div class="panel__head">
      <h3 class="panel__title" id="p-throughput">Ingest by signal</h3>
      <p class="panel__sub">events per second</p>
    </div>

    <figure class="panel__figure" data-figure="throughput" tabindex="0" role="group"
            aria-label="Ingest volume by signal type over time. Use arrow keys to read values.">
      ${stackedArea({
        series: dataset.throughput,
        labels: dataset.labels,
        titleId: 'p-throughput',
      })}
      <div class="chart-tip" data-tip hidden></div>
    </figure>

    <div class="panel__legend">
      ${legend(dataset.throughput, { mark: 'rect' })}
      <button class="table-toggle" type="button" data-table-toggle="throughput"
              aria-expanded="false" aria-controls="table-throughput">Table view</button>
    </div>

    <div class="table-wrap" id="table-throughput" data-table="throughput" hidden>
      ${dataTable({
        series: dataset.throughput,
        labels: dataset.labels,
        caption: 'Ingest by signal type',
        unit: 'eps',
      })}
    </div>

    <h4 class="panel__title" style="margin-top:var(--space-m)">Recent activity</h4>
    <ul class="feed" style="margin-top:var(--space-2xs)">
      ${each(
        INCIDENTS,
        (entry) => `<li>
        <span class="feed__when">${esc(entry.when)}</span>
        <span class="feed__what">
          <span class="feed__badge">
            <span class="status-dot" data-tone="${esc(entry.tone)}" aria-hidden="true"></span>
            <span class="visually-hidden">${esc(entry.tone)}:</span>
          </span>
          ${entry.what}
        </span>
      </li>`,
      )}
    </ul>
  </section>`;
}
