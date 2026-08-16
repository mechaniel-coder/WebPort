/**
 * Forma commerce layer — pricing, faceting and the cart.
 *
 * Dependency-free and shared between the build (which renders the catalogue and
 * product pages) and the browser (which filters, prices variants and keeps the
 * cart). One implementation means the price on a card, the price on a product
 * page and the price in the cart cannot disagree.
 */

import { FINISHES } from './render.js';

export const COMMERCE = {
  freeShippingOver: 25000,
  shippingFlat: 1800,
  shippingExpress: 3500,
  taxRate: 0.085,
  returnDays: 30,
  maxQuantity: 10,
};

/* ── Pricing ───────────────────────────────────────────────────────────────── */

/**
 * Price of one unit with the chosen options.
 * Finish premiums and size premiums both add to the base price.
 */
export function variantPrice(product, { finish, size } = {}) {
  const finishPremium = FINISHES[finish]?.premium ?? 0;
  const sizePremium = product.sizes.find((entry) => entry.id === size)?.premium ?? 0;
  return product.price + finishPremium + sizePremium;
}

/** Human label for a variant, used in the cart and on the review step. */
export function variantLabel(product, { finish, size } = {}) {
  const parts = [];
  if (finish && FINISHES[finish]) parts.push(FINISHES[finish].label);
  const sizeEntry = product.sizes.find((entry) => entry.id === size);
  if (sizeEntry && product.sizes.length > 1) parts.push(sizeEntry.label);
  return parts.join(' · ');
}

export function money(cents, { withCents = false } = {}) {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: withCents ? 2 : 0,
    maximumFractionDigits: withCents ? 2 : 0,
  });
}

/* ── Faceting ──────────────────────────────────────────────────────────────── */

export const PRICE_BANDS = {
  'under-150': { min: 0, max: 15000 },
  '150-400': { min: 15000, max: 40000 },
  'over-400': { min: 40000, max: Infinity },
};

/**
 * Apply the active facets. Values within a facet are OR'd (show lighting OR
 * furniture); separate facets are AND'd (lighting AND under $150) — which is
 * what people expect and the opposite of what a naive implementation does.
 */
export function filterProducts(products, facets = {}) {
  return products.filter((product) => {
    if (facets.category?.length && !facets.category.includes(product.category)) return false;
    if (facets.material?.length && !facets.material.includes(product.material)) return false;

    if (facets.price?.length) {
      const inBand = facets.price.some((id) => {
        const band = PRICE_BANDS[id];
        return band && product.price >= band.min && product.price < band.max;
      });
      if (!inBand) return false;
    }
    return true;
  });
}

export function sortProducts(products, sort = 'featured') {
  const sorted = [...products];
  if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
  else if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
  else sorted.sort((a, b) => a.featured - b.featured);
  return sorted;
}

/** How many products each facet value would yield, for the counts beside them. */
export function facetCounts(products, facets, key, values) {
  // Count against every OTHER facet, so a value's count shows what selecting it
  // would give rather than always reading zero once its own group is filtered.
  const rest = { ...facets, [key]: [] };
  const pool = filterProducts(products, rest);

  return Object.fromEntries(
    values.map((value) => [
      value,
      filterProducts(pool, { [key]: [value] }).length,
    ]),
  );
}

/* ── URL state ─────────────────────────────────────────────────────────────── */

const FACET_KEYS = ['category', 'material', 'price'];

/** Read facets and sort out of a query string. */
export function readQuery(search) {
  const params = new URLSearchParams(search);
  const facets = {};
  for (const key of FACET_KEYS) {
    const value = params.get(key);
    facets[key] = value ? value.split(',').filter(Boolean) : [];
  }
  return { facets, sort: params.get('sort') || 'featured' };
}

/**
 * Serialise state back to a query string. Empty facets and the default sort are
 * omitted, so a cleared filter set gives a clean URL rather than `?category=`.
 */
export function writeQuery({ facets, sort }) {
  const params = new URLSearchParams();
  for (const key of FACET_KEYS) {
    if (facets[key]?.length) params.set(key, facets[key].join(','));
  }
  if (sort && sort !== 'featured') params.set('sort', sort);
  const query = params.toString();
  return query ? `?${query}` : '';
}

/* ── Cart ──────────────────────────────────────────────────────────────────── */

export const CART_KEY = 'forma:cart';

/** A stable identity for a product + options combination. */
export function lineId({ slug, finish, size }) {
  return `${slug}:${finish}:${size}`;
}

export function readCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(raw) ? raw.filter(isValidLine) : [];
  } catch {
    return [];
  }
}

function isValidLine(line) {
  return (
    line &&
    typeof line.slug === 'string' &&
    Number.isFinite(line.quantity) &&
    line.quantity > 0
  );
}

export function writeCart(lines) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(lines));
  } catch {
    /* Storage unavailable (private mode, quota) — the cart still works in-page. */
  }
}

export function addToCart(lines, entry) {
  const id = lineId(entry);
  const existing = lines.find((line) => lineId(line) === id);

  if (existing) {
    existing.quantity = Math.min(COMMERCE.maxQuantity, existing.quantity + entry.quantity);
    return [...lines];
  }
  return [...lines, { ...entry, quantity: Math.min(COMMERCE.maxQuantity, entry.quantity) }];
}

export function setQuantity(lines, id, quantity) {
  if (quantity <= 0) return lines.filter((line) => lineId(line) !== id);
  return lines.map((line) =>
    lineId(line) === id
      ? { ...line, quantity: Math.min(COMMERCE.maxQuantity, quantity) }
      : line,
  );
}

export function cartCount(lines) {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

/**
 * Order totals.
 *
 * Tax is charged on goods plus shipping, which is how most US states actually
 * work and is the detail storefront demos usually get wrong.
 */
export function cartTotals(lines, catalogue, { express = false } = {}) {
  const priced = lines
    .map((line) => {
      const product = catalogue[line.slug];
      if (!product) return null;
      const unit = variantPrice(product, line);
      return { ...line, product, unit, total: unit * line.quantity };
    })
    .filter(Boolean);

  const subtotal = priced.reduce((sum, line) => sum + line.total, 0);

  let shipping = 0;
  if (subtotal > 0) {
    if (express) shipping = COMMERCE.shippingExpress;
    else shipping = subtotal >= COMMERCE.freeShippingOver ? 0 : COMMERCE.shippingFlat;
  }

  const tax = Math.round((subtotal + shipping) * COMMERCE.taxRate);

  return {
    lines: priced,
    subtotal,
    shipping,
    tax,
    total: subtotal + shipping + tax,
    freeShippingGap: Math.max(0, COMMERCE.freeShippingOver - subtotal),
    qualifiesForFree: subtotal >= COMMERCE.freeShippingOver,
  };
}
