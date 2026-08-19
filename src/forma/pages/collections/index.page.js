import { each, esc } from '../../../_lib/html.js';
import { collections, productBySlug } from '../../data.js';
import { productArt } from '../../assets/render.js';
import { catalogueIsland, cta, pageHead } from '../../components.js';

export const meta = {
  title: 'Collections',
  description: `Three groupings — the lamps, the oak pieces, and the things that get used
    every day and are therefore allowed to be plain.`,
  styles: ['shop.css'],
  scripts: ['ui.js', 'cart.js'],
  breadcrumbs: [
    { label: 'Forma', href: '/forma/' },
    { label: 'Collections', href: '/forma/collections/' },
  ],
};

export function render({ url }) {
  return `
${catalogueIsland(url)}

${pageHead({
  tag: `${collections.length} collections`,
  title: 'Grouped by the problem they solve.',
  lede: `Not by room and not by season — by what you would actually be trying to do when you
    went looking.`,
  trail: meta.breadcrumbs,
  url,
})}

<section class="section section--tight">
  <div class="shell" style="display:grid;gap:var(--space-2xl)">
    ${each(collections, (collection, index) => {
      const items = collection.items.map((slug) => productBySlug[slug]);
      return `<article style="display:grid;gap:var(--space-m)">
      <div style="display:flex;flex-wrap:wrap;align-items:baseline;
                  justify-content:space-between;gap:var(--space-s)">
        <div>
          <h2 class="h2">
            <a href="${esc(url(`/forma/collections/${collection.slug}/`))}"
               style="text-decoration:none">${esc(collection.name)}</a>
          </h2>
          <p class="tag">${items.length} pieces</p>
        </div>
        <a class="link-under" href="${esc(url(`/forma/collections/${collection.slug}/`))}">
          See the collection</a>
      </div>

      <p class="lede" style="margin:0">${esc(collection.blurb)}</p>

      <ul style="display:grid;gap:2px;background:var(--rule);border:2px solid var(--rule);
                 grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));list-style:none;
                 padding:0;margin:0">
        ${each(
          items,
          (product) => `<li style="background:var(--paper-2);padding:var(--space-m)">
          <a href="${esc(url(`/forma/shop/${product.slug}/`))}"
             style="text-decoration:none;display:grid;gap:var(--space-xs)">
            ${productArt({
              shape: product.shape,
              finish: product.finishes[0],
              title: `${product.name} — illustration`,
            })}
            <span class="product-card__name" style="font-size:var(--step-0)">
              ${esc(product.name)}</span>
          </a>
        </li>`,
        )}
      </ul>
    </article>`;
    })}
  </div>
</section>

${cta({
  url,
  title: 'Or just look at everything.',
  primary: { href: '/forma/shop/', label: 'Shop all eight' },
  secondary: { href: '/forma/materials/', label: 'Material notes' },
})}
`;
}
