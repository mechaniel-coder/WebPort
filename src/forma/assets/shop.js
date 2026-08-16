/**
 * Shop — faceted filtering, sorting and URL state.
 *
 * The full catalogue is rendered server-side; this script hides and reorders it
 * rather than rebuilding it, so the shop works without JavaScript and filtering
 * never blanks the page.
 *
 * Filter state lives in the query string, which means a filtered view is
 * shareable, bookmarkable, and correct under the back button — the three things
 * a client-side filter usually breaks.
 */

import {
  facetCounts,
  filterProducts,
  readQuery,
  sortProducts,
  writeQuery,
} from './commerce.js';

const root = document.querySelector('[data-shop]');
if (root) init(root);

function init(root) {
  const products = JSON.parse(document.getElementById('catalogue-data').textContent).products;
  const labels = JSON.parse(document.getElementById('facet-labels').textContent);

  const grid = root.querySelector('[data-grid]');
  // `[data-empty-state]`, not `[data-empty]`: every facet label carries
  // `data-empty` for its dimming rule and they appear first in the document, so
  // the looser selector matched a facet label and toggled `hidden` on that
  // instead — leaving the real no-results panel permanently inert.
  const empty = root.querySelector('[data-empty-state]');
  const countOut = root.querySelector('[data-count]');
  const sortSelect = root.querySelector('[data-sort]');
  const chips = root.querySelector('[data-chips]');
  const clearButton = root.querySelector('[data-clear]');
  const inputs = [...root.querySelectorAll('[data-facet]')];

  let state = readQuery(window.location.search);

  /* ── Apply ───────────────────────────────────────────────────────────────── */

  function apply({ push = true } = {}) {
    const matched = sortProducts(filterProducts(products, state.facets), state.sort);
    const visible = new Set(matched.map((product) => product.slug));

    // Reorder by moving nodes rather than re-rendering, so nothing flashes and
    // no server-rendered markup is thrown away.
    for (const product of matched) {
      const node = grid.querySelector(`[data-slug="${product.slug}"]`);
      if (node) grid.append(node);
    }
    for (const node of grid.querySelectorAll('[data-slug]')) {
      node.hidden = !visible.has(node.dataset.slug);
    }

    grid.hidden = matched.length === 0;
    empty.hidden = matched.length > 0;
    countOut.textContent =
      matched.length === products.length
        ? `${products.length} products`
        : `${matched.length} of ${products.length} products`;

    renderCounts();
    renderChips();
    syncInputs();

    if (push) {
      const query = writeQuery(state);
      window.history.replaceState(null, '', `${window.location.pathname}${query}`);
    }
  }

  /** Counts show what selecting a value WOULD give, not what is left after it. */
  function renderCounts() {
    for (const key of ['category', 'material', 'price']) {
      const values = inputs
        .filter((input) => input.dataset.facet === key)
        .map((input) => input.value);
      const counts = facetCounts(products, state.facets, key, values);

      for (const input of inputs.filter((entry) => entry.dataset.facet === key)) {
        const count = counts[input.value] ?? 0;
        const option = input.closest('.facet__option');
        option.querySelector('[data-facet-count]').textContent = String(count);
        option.dataset.empty = String(count === 0 && !input.checked);
      }
    }
  }

  function renderChips() {
    chips.textContent = '';
    const active = [];
    for (const key of ['category', 'material', 'price']) {
      for (const value of state.facets[key] || []) {
        active.push({ key, value, label: labels[key]?.[value] || value });
      }
    }

    for (const entry of active) {
      const li = document.createElement('li');
      li.className = 'chip';

      const text = document.createElement('span');
      text.textContent = entry.label;

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.setAttribute('aria-label', `Remove filter ${entry.label}`);
      remove.textContent = '×';
      remove.addEventListener('click', () => {
        state.facets[entry.key] = state.facets[entry.key].filter((v) => v !== entry.value);
        apply();
        // Focus the checkbox the chip stood for, so keyboard focus is never lost.
        root.querySelector(`[data-facet="${entry.key}"][value="${entry.value}"]`)?.focus();
      });

      li.append(text, remove);
      chips.append(li);
    }

    clearButton.hidden = active.length === 0;
  }

  function syncInputs() {
    for (const input of inputs) {
      input.checked = Boolean(state.facets[input.dataset.facet]?.includes(input.value));
    }
    sortSelect.value = state.sort;
  }

  /* ── Wiring ──────────────────────────────────────────────────────────────── */

  for (const input of inputs) {
    input.addEventListener('change', () => {
      const key = input.dataset.facet;
      const current = state.facets[key] || [];
      state.facets[key] = input.checked
        ? [...current, input.value]
        : current.filter((value) => value !== input.value);
      apply();
    });
  }

  sortSelect.addEventListener('change', () => {
    state.sort = sortSelect.value;
    apply();
  });

  clearButton.addEventListener('click', () => {
    state = { facets: { category: [], material: [], price: [] }, sort: state.sort };
    apply();
    inputs[0]?.focus();
  });

  // Back and forward move through filter states rather than leaving the page.
  window.addEventListener('popstate', () => {
    state = readQuery(window.location.search);
    apply({ push: false });
  });

  apply({ push: false });
}
