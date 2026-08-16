/**
 * Cart — runs on every page.
 *
 * Owns the persisted cart and the header count, and exposes a tiny event-based
 * API the shop, product and checkout scripts use. State lives in localStorage
 * and is synchronised across tabs via the `storage` event, so opening a second
 * tab does not give you a second, disagreeing cart.
 */

import {
  CART_KEY,
  addToCart,
  cartCount,
  cartTotals,
  lineId,
  money,
  readCart,
  setQuantity,
  variantLabel,
  writeCart,
} from './commerce.js';
import { productArt } from './render.js';

const catalogue = readCatalogue();

function readCatalogue() {
  const island = document.getElementById('catalogue-data');
  if (!island) return {};
  const parsed = JSON.parse(island.textContent);
  return Object.fromEntries(parsed.products.map((product) => [product.slug, product]));
}

/* ── Store ─────────────────────────────────────────────────────────────────── */

let lines = readCart();

/** Subscribers re-render whenever the cart changes, from any source. */
const listeners = new Set();

export function getLines() {
  return lines;
}

export function subscribe(fn) {
  listeners.add(fn);
  fn(lines);
  return () => listeners.delete(fn);
}

function commit(next, { announce: message } = {}) {
  lines = next;
  writeCart(lines);
  for (const fn of listeners) fn(lines);
  renderCount();
  if (message) announce(message);
}

export function add(entry) {
  const product = catalogue[entry.slug];
  commit(addToCart(lines, entry), {
    announce: product
      ? `${product.name} added to cart. ${cartCount(lines) + entry.quantity} items total.`
      : 'Added to cart.',
  });
  toast(product ? `${product.name} added` : 'Added to cart');
}

export function update(id, quantity) {
  commit(setQuantity(lines, id, quantity), {
    announce: quantity <= 0 ? 'Item removed from cart.' : `Quantity updated to ${quantity}.`,
  });
}

export function clear() {
  commit([], { announce: 'Cart emptied.' });
}

export function totals(options) {
  return cartTotals(lines, catalogue, options);
}

export { catalogue, money, variantLabel, lineId, productArt };

/* ── Cross-tab synchronisation ─────────────────────────────────────────────── */

window.addEventListener('storage', (event) => {
  if (event.key !== CART_KEY) return;
  // Another tab changed the cart. Adopt its state rather than overwriting it.
  lines = readCart();
  for (const fn of listeners) fn(lines);
  renderCount();
});

/* ── Header count ──────────────────────────────────────────────────────────── */

function renderCount() {
  const count = cartCount(lines);
  const badge = document.querySelector('[data-cart-count]');
  const label = document.querySelector('[data-cart-label]');
  if (badge) badge.textContent = String(count);
  if (label) label.textContent = `${count} item${count === 1 ? '' : 's'} in cart`;
}

/* ── Announcements ─────────────────────────────────────────────────────────── */

function announcer() {
  let region = document.querySelector('[data-announcer]');
  if (!region) {
    region = document.createElement('p');
    region.className = 'announcer';
    region.dataset.announcer = '';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    document.body.append(region);
  }
  return region;
}

function announce(message) {
  announcer().textContent = message;
}

/* ── Toast ─────────────────────────────────────────────────────────────────── */

let toastTimer = null;

function toast(message) {
  let node = document.querySelector('[data-toast]');
  if (!node) {
    node = document.createElement('div');
    node.className = 'toast';
    node.dataset.toast = '';
    document.body.append(node);
  }

  node.textContent = '';
  const text = document.createElement('span');
  // Product names come from data; insert as text rather than markup.
  text.textContent = message;

  const link = document.createElement('a');
  link.href = document.querySelector('[data-cart-link]')?.getAttribute('href') || '#';
  link.textContent = 'View cart';

  node.append(text, link);
  node.dataset.show = 'true';

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    node.dataset.show = 'false';
  }, 4000);
}

renderCount();
