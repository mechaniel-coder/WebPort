/**
 * Product detail pages, generated from the catalogue.
 */
import { absolute, each, esc, escJson } from '../../../_lib/html.js';
import { FINISHES, categories, materials, products } from '../../data.js';
import { COMMERCE, money } from '../../assets/commerce.js';
import { productArt, swatch } from '../../assets/render.js';
import { catalogueIsland, crumbs, label, productGrid } from '../../components.js';

export const pages = products.map((product) => ({
  slug: product.slug,

  meta: {
    title: product.name,
    metaTitle: `${product.name} — Forma`,
    description: `${product.tagline} ${money(product.price)}. ${
      product.specs.find(([key]) => key === 'Material')?.[1] || ''
    }`.trim(),
    ogType: 'product',
    styles: ['shop.css'],
    scripts: ['ui.js', 'cart.js', 'product.js'],
    breadcrumbs: [
      { label: 'Forma', href: '/forma/' },
      { label: 'Shop', href: '/forma/shop/' },
      { label: product.name, href: `/forma/shop/${product.slug}/` },
    ],
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.tagline,
      url: absolute(`/forma/shop/${product.slug}/`),
      category: label(categories, product.category),
      material: label(materials, product.material),
      brand: { '@type': 'Brand', name: 'Forma' },
      offers: {
        '@type': 'Offer',
        price: (product.price / 100).toFixed(2),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: absolute(`/forma/shop/${product.slug}/`),
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: (COMMERCE.shippingFlat / 100).toFixed(2),
            currency: 'USD',
          },
        },
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          merchantReturnDays: COMMERCE.returnDays,
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        },
      },
    },
  },

  render: ({ url }) => renderProduct(product, url),
}));

function renderProduct(product, url) {
  const related = products
    .filter((other) => other.slug !== product.slug && other.category === product.category)
    .concat(products.filter((other) => other.slug !== product.slug))
    .filter((other, index, list) => list.indexOf(other) === index)
    .slice(0, 4);

  // Only what the variant picker needs on the client.
  const island = {
    slug: product.slug,
    name: product.name,
    shape: product.shape,
    price: product.price,
    sizes: product.sizes,
    finishes: product.finishes,
    finishLabels: Object.fromEntries(
      product.finishes.map((finish) => [finish, FINISHES[finish].label]),
    ),
  };

  return `
${catalogueIsland(url)}
<script type="application/json" id="product-data">${escJson(island)}</script>

<div class="shell" style="padding-top:var(--space-m)">
  ${crumbs(
    [
      { label: 'Forma', href: '/forma/' },
      { label: 'Shop', href: '/forma/shop/' },
      { label: product.name, href: `/forma/shop/${product.slug}/` },
    ],
    url,
  )}
</div>

<section class="section section--tight" style="padding-top:0">
  <div class="shell product" data-product>
    <div class="product__stage" data-stage>
      ${productArt({
        shape: product.shape,
        finish: product.finishes[0],
        title: `${product.name} in ${FINISHES[product.finishes[0]].label} — illustration`,
      })}
    </div>

    <div class="product__panel">
      <p class="tag">${esc(label(categories, product.category))} ·
        ${esc(label(materials, product.material))}</p>
      <h1 class="h1" style="margin-top:var(--space-2xs)">${esc(product.name)}</h1>
      <p class="lede">${esc(product.lede)}</p>

      <p class="product__price">
        <span data-price>${esc(money(product.price))}</span>
        <small data-premium></small>
      </p>

      <fieldset style="border:0;padding:0;margin:0">
        <legend class="option-group__label">Finish</legend>
        <ul class="swatches">
          ${each(
            product.finishes,
            (finish, index) => `<li class="swatch">
            <label>
              <input type="radio" name="finish" value="${esc(finish)}"
                     ${index === 0 ? 'checked' : ''}>
              <span class="swatch__face">
                ${swatch(finish)}
                <span>${esc(FINISHES[finish].label)}${
                  FINISHES[finish].premium
                    ? ` +${esc(money(FINISHES[finish].premium))}`
                    : ''
                }</span>
              </span>
            </label>
          </li>`,
          )}
        </ul>
      </fieldset>

      ${
        product.sizes.length > 1
          ? `<fieldset style="border:0;padding:0;margin:0">
        <legend class="option-group__label">Size</legend>
        <ul class="sizes">
          ${each(
            product.sizes,
            (size, index) => `<li class="size">
            <label>
              <input type="radio" name="size" value="${esc(size.id)}"
                     ${index === 0 ? 'checked' : ''}>
              <span class="size__face">${esc(size.label)}${
                size.premium ? ` +${esc(money(size.premium))}` : ''
              }</span>
            </label>
          </li>`,
          )}
        </ul>
      </fieldset>`
          : `<input type="hidden" name="size" value="${esc(product.sizes[0].id)}" checked>`
      }

      <div class="product__buy">
        <div class="qty">
          <button type="button" data-step="-1" aria-label="Decrease quantity">−</button>
          <input type="number" min="1" max="${COMMERCE.maxQuantity}" value="1"
                 data-quantity aria-label="Quantity">
          <button type="button" data-step="1" aria-label="Increase quantity">+</button>
        </div>
        <button class="btn" type="button" data-add>Add to cart</button>
      </div>

      <p class="product__note">
        Free shipping over ${esc(money(COMMERCE.freeShippingOver))} ·
        ${COMMERCE.returnDays}-day returns, postage paid ·
        Nothing on this site can actually be purchased.
      </p>

      <noscript>
        <p class="form-status" data-tone="error" style="margin-top:var(--space-s)">
          Choosing a finish and adding to the cart needs JavaScript. Every option and its
          price is listed above, and the specification below is complete.
        </p>
      </noscript>
    </div>
  </div>
</section>

<section class="section section--fill section--ruled" aria-labelledby="detail-heading">
  <div class="shell" style="display:grid;gap:var(--space-xl)">
    <div style="display:grid;gap:var(--space-l)">
      <div>
        <p class="tag">Detail</p>
        <h2 class="h2" id="detail-heading" style="margin-top:var(--space-2xs);max-width:20ch">
          ${esc(product.tagline)}</h2>
      </div>
      <div class="prose" style="margin:0">
        <p>${esc(product.detail)}</p>
        <p><strong>Care.</strong> ${esc(product.care)}</p>
      </div>
    </div>

    <table class="specs">
      <caption class="visually-hidden">${esc(product.name)} specification</caption>
      <tbody>
        ${each(
          product.specs,
          ([key, value]) => `<tr><th scope="row">${esc(key)}</th><td>${esc(value)}</td></tr>`,
        )}
      </tbody>
    </table>
  </div>
</section>

<section class="section" aria-labelledby="related-heading">
  <div class="shell">
    <p class="tag">Also</p>
    <h2 class="h2" id="related-heading" style="margin:var(--space-2xs) 0 var(--space-l)">
      You might want one of these too.</h2>
  </div>
  <div class="shell">
    ${productGrid(related, url, { columns: 4 })}
  </div>
</section>
`;
}
