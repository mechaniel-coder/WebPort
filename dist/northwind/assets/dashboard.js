/**
 * Dashboard interaction layer.
 *
 * The charts are already in the HTML — rendered at build time by the same
 * module imported here. This script upgrades them: range switching, a snapping
 * crosshair with a keyboard equivalent, per-bar tooltips, table views, and an
 * opt-in live ticker.
 */
import {
  RANGES,
  barChart,
  buildDataset,
  compact,
  dataTable,
  lineChart,
  sparkline,
  stackedArea,
  summarize,
} from './charts.js';

const root = document.querySelector('[data-dashboard]');
if (root) init(root);

function init(root) {
  let range = root.dataset.range || '24h';
  let tick = 0;
  let dataset = buildDataset(range, tick);
  let timer = null;

  const ms = (value) => `${Math.round(value)}`;
  const el = {
    stats: root.querySelector('[data-stats]'),
    live: root.querySelector('[data-live]'),
  };

  /* ── Rendering ───────────────────────────────────────────────────────────── */

  function figure(name) {
    return root.querySelector(`[data-figure="${name}"]`);
  }

  function renderCharts() {
    const latency = figure('latency');
    latency.querySelector('svg').outerHTML = lineChart({
      series: dataset.latency,
      labels: dataset.labels,
      titleId: 'p-latency',
      format: ms,
    });

    const throughput = figure('throughput');
    throughput.querySelector('svg').outerHTML = stackedArea({
      series: dataset.throughput,
      labels: dataset.labels,
      titleId: 'p-throughput',
    });

    const errors = figure('errors');
    errors.querySelector('svg').outerHTML = barChart({
      rows: dataset.endpoints,
      titleId: 'p-errors',
    });
    bindBars();
  }

  function renderStats() {
    const stats = summarize(dataset);
    for (const [key, stat] of Object.entries(stats)) {
      const tile = el.stats.querySelector(`[data-stat="${key}"]`);
      if (!tile) continue;

      tile.querySelector('.stat__value').textContent = stat.value;
      tile.querySelector('.spark').outerHTML = sparkline(stat.spark, { slot: stat.slot || 1 });

      const up = stat.delta >= 0;
      const good = up === stat.goodWhenUp;
      const delta = tile.querySelector('.stat__delta');
      delta.dataset.sentiment = good ? 'good' : 'bad';
      delta.firstElementChild.textContent = up ? '↑' : '↓';
      // Replace only the numeric text node, leaving the assistive spans intact.
      delta.childNodes[2].nodeValue = ` ${Math.abs(stat.delta).toFixed(1)}% `;
    }
  }

  function renderTables() {
    root.querySelector('[data-table="latency"]').innerHTML = dataTable({
      series: dataset.latency,
      labels: dataset.labels,
      caption: 'Request latency by percentile',
      format: ms,
      unit: 'ms',
    });
    root.querySelector('[data-table="throughput"]').innerHTML = dataTable({
      series: dataset.throughput,
      labels: dataset.labels,
      caption: 'Ingest by signal type',
      unit: 'eps',
    });

    const rows = dataset.endpoints
      .map(
        (row) =>
          `<tr><th scope="row">${escapeHtml(row.label)}</th><td>${escapeHtml(compact(row.value))}</td></tr>`,
      )
      .join('');
    root.querySelector('[data-table="errors"] tbody').innerHTML = rows;
  }

  function renderAll() {
    renderCharts();
    renderStats();
    renderTables();

    const rangeLabel = root.querySelector('[data-range-label]');
    if (rangeLabel) rangeLabel.textContent = `milliseconds · ${dataset.config.label.toLowerCase()}`;
  }

  function escapeHtml(value) {
    return String(value).replace(
      /[&<>"']/g,
      (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
    );
  }

  /* ── Range filter — scopes everything below it ───────────────────────────── */

  for (const button of root.querySelectorAll('[data-range-button]')) {
    button.addEventListener('click', () => {
      range = button.dataset.rangeButton;
      root.dataset.range = range;
      tick = 0;
      dataset = buildDataset(range, tick);

      for (const other of root.querySelectorAll('[data-range-button]')) {
        other.setAttribute('aria-pressed', String(other === button));
      }
      renderAll();
    });
  }

  /* ── Live ticker ─────────────────────────────────────────────────────────── */

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  el.live.addEventListener('click', () => {
    const on = el.live.getAttribute('aria-pressed') === 'true';
    el.live.setAttribute('aria-pressed', String(!on));

    if (on) {
      clearInterval(timer);
      timer = null;
    } else {
      timer = setInterval(() => {
        tick += 1;
        dataset = buildDataset(range, tick);
        renderCharts();
        renderStats();
      }, reducedMotion.matches ? 10000 : 4000);
    }
  });

  // Never leave a timer running against a hidden tab.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && timer) {
      clearInterval(timer);
      timer = null;
      el.live.setAttribute('aria-pressed', 'false');
    }
  });

  /* ── Table views ─────────────────────────────────────────────────────────── */

  for (const toggle of root.querySelectorAll('[data-table-toggle]')) {
    toggle.addEventListener('click', () => {
      const target = root.querySelector(`[data-table="${toggle.dataset.tableToggle}"]`);
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      target.hidden = open;
      toggle.textContent = open ? 'Table view' : 'Hide table';
    });
  }

  /* ── Crosshair ───────────────────────────────────────────────────────────── */

  /**
   * The crosshair snaps to the nearest data index, so the reader aims at a point
   * in time rather than at a 2px line. The same readout is produced by keyboard
   * arrows, which is why the index is state rather than a pointer position.
   */
  function bindCrosshair(name, getSeries, format, unit) {
    const fig = figure(name);
    const tip = fig.querySelector('[data-tip]');
    let index = null;

    const geometry = () => {
      const svg = fig.querySelector('svg');
      const [x0, y0, x1] = svg.dataset.plot.split(',').map(Number);
      const box = svg.getBoundingClientRect();
      const viewWidth = svg.viewBox.baseVal.width;
      const scale = box.width / viewWidth;
      return { svg, x0, y0, x1, box, scale };
    };

    const show = (nextIndex, { fromPointer = false } = {}) => {
      const series = getSeries();
      const count = series[0].values.length;
      index = Math.max(0, Math.min(count - 1, nextIndex));

      const { svg, x0, x1, box, scale } = geometry();
      const step = count > 1 ? (x1 - x0) / (count - 1) : 0;
      const x = x0 + index * step;

      const cross = svg.querySelector('.chart__crosshair');
      cross.hidden = false;
      const line = cross.querySelector('line');
      line.setAttribute('x1', x);
      line.setAttribute('x2', x);

      // Line charts carry a dot per series; the stacked area carries none.
      const dots = cross.querySelectorAll('circle');
      const max = Number(svg.dataset.max);
      const [, plotTop, , plotBottom] = svg.dataset.plot.split(',').map(Number);
      dots.forEach((dot, seriesIndex) => {
        const value = series[seriesIndex]?.values[index] ?? 0;
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', plotBottom - (value / max) * (plotBottom - plotTop));
      });

      tip.hidden = false;
      tip.textContent = '';

      const when = document.createElement('p');
      when.className = 'chart-tip__when';
      when.textContent = dataset.labels[index];
      tip.append(when);

      for (const entry of series) {
        const row = document.createElement('p');
        row.className = 'chart-tip__row';

        const key = document.createElement('span');
        key.className = 'chart-tip__key';
        key.style.setProperty('--key', `var(--series-${entry.slot})`);

        const name = document.createElement('span');
        name.className = 'chart-tip__name';
        // Series names are data; insert them as text, never as markup.
        name.textContent = entry.name;

        const value = document.createElement('span');
        value.className = 'chart-tip__value';
        value.textContent = `${format(entry.values[index])}${unit}`;

        row.append(key, name, value);
        tip.append(row);
      }

      tip.style.left = `${x * scale}px`;
      tip.style.top = `${(plotTop + 6) * scale}px`;
      if (!fromPointer) fig.setAttribute('aria-activedescendant', '');
    };

    const hide = () => {
      const svg = fig.querySelector('svg');
      svg.querySelector('.chart__crosshair').hidden = true;
      tip.hidden = true;
      index = null;
    };

    fig.addEventListener('pointermove', (event) => {
      const { x0, x1, box, scale } = geometry();
      const series = getSeries();
      const count = series[0].values.length;
      const local = (event.clientX - box.left) / scale;
      const step = count > 1 ? (x1 - x0) / (count - 1) : 1;
      show(Math.round((local - x0) / step), { fromPointer: true });
    });

    fig.addEventListener('pointerleave', hide);
    fig.addEventListener('blur', hide);

    fig.addEventListener('keydown', (event) => {
      const series = getSeries();
      const count = series[0].values.length;
      const moves = { ArrowRight: 1, ArrowLeft: -1 };
      if (event.key in moves) {
        event.preventDefault();
        show((index === null ? count - 1 : index) + moves[event.key]);
      } else if (event.key === 'Home') {
        event.preventDefault();
        show(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        show(count - 1);
      } else if (event.key === 'Escape') {
        hide();
      }
    });
  }

  bindCrosshair('latency', () => dataset.latency, (value) => Math.round(value), ' ms');
  bindCrosshair('throughput', () => dataset.throughput, compact, '/s');

  /* ── Bar tooltips ────────────────────────────────────────────────────────── */

  /** Bars are their own hit target — no crosshair, a tooltip per mark. */
  function bindBars() {
    const fig = figure('errors');
    let tip = fig.querySelector('[data-tip]');
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'chart-tip';
      tip.dataset.tip = '';
      tip.hidden = true;
      fig.append(tip);
    }

    for (const bar of fig.querySelectorAll('.chart__bar')) {
      const reveal = () => {
        tip.textContent = '';
        const name = document.createElement('span');
        name.className = 'chart-tip__name';
        name.textContent = bar.dataset.label;
        const value = document.createElement('span');
        value.className = 'chart-tip__value';
        value.textContent = bar.dataset.value;

        const row = document.createElement('p');
        row.className = 'chart-tip__row';
        row.append(name, value);
        tip.append(row);
        tip.hidden = false;

        const box = bar.getBoundingClientRect();
        const parent = fig.getBoundingClientRect();
        tip.style.left = `${box.left - parent.left + box.width / 2}px`;
        tip.style.top = `${box.top - parent.top}px`;
      };

      const dismiss = () => {
        tip.hidden = true;
      };

      bar.addEventListener('pointerenter', reveal);
      bar.addEventListener('focus', reveal);
      bar.addEventListener('pointerleave', dismiss);
      bar.addEventListener('blur', dismiss);
    }
  }

  bindBars();
}
