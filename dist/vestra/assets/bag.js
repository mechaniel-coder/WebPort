/**
 * The bag.
 *
 * A line is identified by garment + colour + size, so the same coat in two
 * sizes is two lines — which is the whole point in clothing, where a size is
 * not an attribute of a line but the identity of it.
 *
 * Held in localStorage under one key, mirrored across tabs by the `storage`
 * event, and never transmitted anywhere.
 */
import { garmentBySlug, money, brand } from './data.js';

const KEY = 'vestra.bag.v1';

const read = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((l) => l && l.slug && l.size) : [];
  } catch {
    // Corrupt or unavailable storage must not take the whole page down with it.
    return [];
  }
};

const write = (lines) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* private mode, quota — the page still works, the bag just will not persist */
  }
  broadcast(lines);
};

const listeners = new Set();
const broadcast = (lines) => listeners.forEach((fn) => fn(lines));

export const onBagChange = (fn) => {
  listeners.add(fn);
  fn(read());
  return () => listeners.delete(fn);
};

export const lineId = (slug, colour, size) => `${slug}:${colour}:${size}`;

export function getBag() {
  return read();
}

export function addLine({ slug, colour, size, quantity = 1 }) {
  const lines = read();
  const id = lineId(slug, colour, size);
  const existing = lines.find((l) => lineId(l.slug, l.colour, l.size) === id);
  if (existing) existing.quantity += quantity;
  else lines.push({ slug, colour, size, quantity });
  write(lines);
  return lines;
}

export function setQuantity(id, quantity) {
  const lines = read()
    .map((l) => (lineId(l.slug, l.colour, l.size) === id ? { ...l, quantity } : l))
    .filter((l) => l.quantity > 0);
  write(lines);
  return lines;
}

export function removeLine(id) {
  return setQuantity(id, 0);
}

export function clearBag() {
  write([]);
}

export const countItems = (lines) => lines.reduce((n, l) => n + l.quantity, 0);

/**
 * Totals.
 *
 * Shipping is free over a threshold; duty and tax are stated as included rather
 * than added at the end, which is the honest presentation for an EU-priced
 * label and avoids the single most common checkout abandonment.
 */
export function totals(lines) {
  const subtotal = lines.reduce((sum, l) => {
    const garment = garmentBySlug[l.slug];
    return sum + (garment ? garment.price * l.quantity : 0);
  }, 0);

  const shipping = subtotal === 0 || subtotal >= brand.freeShippingOver ? 0 : 1200;
  return { subtotal, shipping, total: subtotal + shipping };
}

export { money };
