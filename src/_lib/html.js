/**
 * Tiny HTML authoring helpers shared by every site.
 *
 * These exist so page modules can stay readable template literals without
 * hand-rolling escaping or path logic in forty different places.
 */
import { basePath, origin } from '../../site.config.js';

const ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escape a value for interpolation into HTML text or a quoted attribute. */
export function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (char) => ENTITIES[char]);
}

/** Escape a value for embedding inside a <script> block (JSON-LD, data islands). */
export function escJson(value) {
  // `<` can terminate a script element early; the line/paragraph separators are
  // valid JSON but invalid in a JavaScript string literal. Escaping all three as
  // unicode sequences keeps the JSON valid and the script element intact.
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/[\u2028\u2029]/g, (char) => `\\u${char.charCodeAt(0).toString(16)}`);
}

/**
 * Resolve a repo-root-relative path against the configured base path.
 * External URLs and fragments are returned untouched.
 *
 *   url('/aurelia/rooms/')  →  '/aurelia/rooms/'          (basePath '/')
 *   url('/aurelia/rooms/')  →  '/WebPort/aurelia/rooms/'  (basePath '/WebPort/')
 */
export function url(path = '/') {
  const value = String(path);
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value)) return value;
  return `${basePath}${value.replace(/^\/+/, '')}`.replace(/([^:])\/{2,}/g, '$1/');
}

/** Absolute URL for canonical tags, Open Graph and the sitemap. */
export function absolute(path = '/') {
  const value = String(path);
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return value;
  return `${origin}${url(value)}`;
}

/** Join class names, dropping falsy entries. */
export function cx(...names) {
  return names.filter(Boolean).join(' ');
}

/**
 * Build an attribute string from an object.
 * `true` renders a bare attribute, `false`/null/undefined omit it entirely.
 */
export function attrs(map = {}) {
  return Object.entries(map)
    .filter(([, value]) => value !== false && value !== null && value !== undefined)
    .map(([key, value]) => (value === true ? ` ${key}` : ` ${key}="${esc(value)}"`))
    .join('');
}

/** Render a list of items with a mapper, joined by newlines. */
export function each(items, fn) {
  return (items || []).map(fn).join('\n');
}

/** Format a number of cents as USD. Used by the pricing calculator and storefront. */
export function money(cents, { withCents = false } = {}) {
  const amount = cents / 100;
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: withCents ? 2 : 0,
    maximumFractionDigits: withCents ? 2 : 0,
  });
}

/** Machine-readable + human-readable date pair for <time> elements. */
export function dateParts(iso) {
  const date = new Date(`${iso}T12:00:00Z`);
  return {
    iso,
    label: date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }),
  };
}

/** Collapse whitespace — for meta descriptions authored across several lines. */
export function oneLine(text) {
  return String(text).replace(/\s+/g, ' ').trim();
}
