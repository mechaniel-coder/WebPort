import { each, esc } from '../../../_lib/html.js';
import { SORTS, categories, materials, priceBands, products } from '../../data.js';
import { filterProducts, sortProducts } from '../../assets/commerce.js';
import {
  catalogueIsland,
  crumbs,
  facetLabelIsland,
  productCard,
} from '../../components.js';

export const meta = {
  title: 'Shop',
  description: `Eight products across lighting, furniture, objects and tableware. Filter by
    category, material and price — the filters are reflected in the URL.`,
  styles: ['shop.css'],
  scripts: ['ui.js', 'cart.js', 'shop.js'],
  priority: 0.9,
  breadcrumbs: [
    { label: 'Forma', href: '/forma/' },
    { label: 'Shop', href: '/forma/shop/' },
  ],
};

const FACETS = [
  { key: 'category', legend: 'Category', values: categories },
  { key: 'material', legend: 'Material', values: materials },
  { key: 'price', legend: 'Price', values: priceBands },
];

export function render({ url }) {
  // Rendered in the default order; the client reorders and hides rather than
  // rebuilding, so the full catalogue is in the HTML for crawlers and for
  // anyone without JavaScript.
  const ordered = sortProducts(products, 'featured');

  return `
${catalogueIsland(url)}
${facetLabelIsland()}

<section class="page-head">
  <div class="shell">
    ${crumbs(meta.breadcrumbs, url)}
    <h1 class="h1 page-head__title">Shop.</h1>
    <p class="tag">${products.length} products</p>
  </div>
</section>

<section class="section section--tight">
  <div class="shell shop" data-shop>
    <form class="facets" data-facets>
      <h2 class="visually-hidden">Filter products</h2>

      ${each(
        FACETS,
        (facet) => `<fieldset class="facet">
        <legend class="facet__legend">${esc(facet.legend)}</legend>
        <ul class="facet__list">
          ${each(facet.values, (value) => {
            const count = filterProducts(products, { [facet.key]: [value.id] }).length;
            return `<li>
              <label class="facet__option" data-empty="false">
                <input type="checkbox" data-facet="${esc(facet.key)}" value="${esc(value.id)}">
                <span>${esc(value.label)}</span>
                <span class="facet__count" data-facet-count>${count}</span>
              </label>
            </li>`;
          })}
        </ul>
      </fieldset>`,
      )}

      <button class="btn btn--ghost btn--sm facet__clear" type="button" data-clear hidden>
        Clear all filters
      </button>
    </form>

    <div>
      <div class="shop__bar">
        <p class="shop__count" data-count role="status">${products.length} products</p>
        <label class="shop__sort">
          <span>Sort</span>
          <select data-sort>
            ${each(
              SORTS,
              (sort) => `<option value="${esc(sort.id)}">${esc(sort.label)}</option>`,
            )}
          </select>
        </label>
      </div>

      <ul class="active-filters" data-chips></ul>

      <ul class="grid-products" data-grid>
        ${each(ordered, (product) => productCard(product, url))}
      </ul>

      <div class="shop__empty" data-empty-state hidden>
        <p class="h3">Nothing matches those filters.</p>
        <p class="muted" style="margin-top:var(--space-2xs)">
          There are only eight products — try removing one.</p>
      </div>
    </div>
  </div>
</section>
`;
}
