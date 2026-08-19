/**
 * Forma page components.
 */
import { each, esc, escJson } from '../_lib/html.js';
import { brand, categories, materials, products } from './data.js';
import { money, variantPrice } from './assets/commerce.js';
import { productArt } from './assets/render.js';

const label = (list, id) => list.find((entry) => entry.id === id)?.label || id;

/* ── Chrome ────────────────────────────────────────────────────────────────── */

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
 * `tag` renders after the heading, and only when it is a specification rather
 * than a label. A count of pieces, a material, a place: those belong in a
 * drawing's title block. "Checkout" over "Checkout." does not.
 */
export function pageHead({ tag, title, lede, trail, url }) {
  return `<section class="page-head">
    <div class="shell">
      ${trail ? crumbs(trail, url) : ''}
      <h1 class="h1 page-head__title">${esc(title)}</h1>
      ${tag ? `<p class="tag">${esc(tag)}</p>` : ''}
      ${lede ? `<p class="lede">${esc(lede)}</p>` : ''}
    </div>
  </section>`;
}

export function sectionHead({ tag, title, body, id, link, url }) {
  return `<div style="margin-bottom:var(--space-l)">
    <h2 class="h2"${id ? ` id="${esc(id)}"` : ''}>${esc(title)}</h2>
    ${tag ? `<p class="tag">${esc(tag)}</p>` : ''}
    ${body ? `<p class="lede" style="margin-top:var(--space-s)">${esc(body)}</p>` : ''}
    ${
      link
        ? `<a class="link-under" style="display:inline-block;margin-top:var(--space-s)"
             href="${esc(url(link.href))}">${esc(link.label)}</a>`
        : ''
    }
  </div>`;
}

export function accordion(items, idPrefix) {
  return `<div class="accordion" data-accordion>
    ${each(
      items,
      (item, index) => `<div class="accordion__item">
      <h3>
        <button class="accordion__trigger" type="button" id="${idPrefix}-t-${index}"
                aria-expanded="false" aria-controls="${idPrefix}-p-${index}"
                data-accordion-trigger>
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

export function strip(items) {
  return `<div class="strip">
    <div class="shell strip__inner">
      ${each(items, (item) => `<span>${esc(item)}</span>`)}
    </div>
  </div>`;
}

/* ── Product card ──────────────────────────────────────────────────────────── */

export function productCard(product, url) {
  return `<li class="product-card" data-slug="${esc(product.slug)}">
    <a href="${esc(url(`/forma/shop/${product.slug}/`))}">
      <span class="product-card__art">
        ${productArt({
          shape: product.shape,
          finish: product.finishes[0],
          title: `${product.name} — illustration`,
        })}
      </span>
      <span class="product-card__body">
        <span class="product-card__meta">${esc(label(categories, product.category))} ·
          ${esc(label(materials, product.material))}</span>
        <span class="product-card__name">${esc(product.name)}</span>
        <span class="product-card__price">${esc(money(product.price))}</span>
      </span>
    </a>
  </li>`;
}

export function productGrid(list, url, { columns = 3 } = {}) {
  // The reveal lives on the shared grid rather than on each page that uses one,
  // so every product listing on the site staggers in without nineteen pages
  // each having to remember to ask for it.
  return `<ul class="grid-products${columns === 4 ? ' grid-products--4' : ''}"
    data-reveal data-stagger="0.07">
    ${each(list, (product) => productCard(product, url))}
  </ul>`;
}

/* ── Data islands ──────────────────────────────────────────────────────────── */

/**
 * The catalogue the browser needs, emitted once per page that uses commerce.
 * Trimmed to the fields the client actually reads, and including a resolved
 * href so the cart can link back without knowing the base path.
 */
export function catalogueIsland(url) {
  const payload = {
    products: products.map((product) => ({
      slug: product.slug,
      name: product.name,
      price: product.price,
      shape: product.shape,
      category: product.category,
      material: product.material,
      featured: product.featured,
      finishes: product.finishes,
      sizes: product.sizes,
      href: url(`/forma/shop/${product.slug}/`),
    })),
  };
  return `<script type="application/json" id="catalogue-data">${escJson(payload)}</script>`;
}

export function facetLabelIsland() {
  const payload = {
    category: Object.fromEntries(categories.map((entry) => [entry.id, entry.label])),
    material: Object.fromEntries(materials.map((entry) => [entry.id, entry.label])),
    price: {
      'under-150': 'Under $150',
      '150-400': '$150 – $400',
      'over-400': 'Over $400',
    },
  };
  return `<script type="application/json" id="facet-labels">${escJson(payload)}</script>`;
}

/* ── CTA ───────────────────────────────────────────────────────────────────── */

export function cta({ url, title, body, primary, secondary }) {
  return `<section class="section section--ink">
    <div class="shell" style="display:grid;justify-items:center;gap:var(--space-s);
                              text-align:center">
      <h2 class="h2" style="max-width:18ch">${esc(title)}</h2>
      ${body ? `<p class="lede" style="color:var(--ink-2)">${esc(body)}</p>` : ''}
      <div style="display:flex;flex-wrap:wrap;gap:var(--space-xs);margin-top:var(--space-s)">
        <a class="btn btn--ghost" href="${esc(url(primary.href))}">${esc(primary.label)}</a>
        ${
          secondary
            ? `<a class="btn btn--ghost" href="${esc(url(secondary.href))}">${esc(secondary.label)}</a>`
            : ''
        }
      </div>
    </div>
  </section>`;
}

export { label, money, variantPrice, brand };
