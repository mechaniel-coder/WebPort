/**
 * Collection pages, generated from data.js.
 */
import { absolute, each, esc } from '../../../_lib/html.js';
import { collections, productBySlug } from '../../data.js';
import { catalogueIsland, crumbs, cta, productGrid } from '../../components.js';

export const pages = collections.map((collection) => ({
  slug: collection.slug,

  meta: {
    title: collection.name,
    metaTitle: `${collection.name} — Forma`,
    description: collection.blurb,
    styles: ['shop.css'],
    scripts: ['ui.js', 'cart.js'],
    breadcrumbs: [
      { label: 'Forma', href: '/forma/' },
      { label: 'Collections', href: '/forma/collections/' },
      { label: collection.name, href: `/forma/collections/${collection.slug}/` },
    ],
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: collection.name,
      description: collection.blurb,
      url: absolute(`/forma/collections/${collection.slug}/`),
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: collection.items.length,
        itemListElement: collection.items.map((slug, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: absolute(`/forma/shop/${slug}/`),
          name: productBySlug[slug].name,
        })),
      },
    },
  },

  render: ({ url }) => renderCollection(collection, url),
}));

function renderCollection(collection, url) {
  const items = collection.items.map((slug) => productBySlug[slug]);
  const others = collections.filter((other) => other.slug !== collection.slug);

  return `
${catalogueIsland(url)}

<section class="page-head">
  <div class="shell">
    ${crumbs(
      [
        { label: 'Forma', href: '/forma/' },
        { label: 'Collections', href: '/forma/collections/' },
        { label: collection.name, href: `/forma/collections/${collection.slug}/` },
      ],
      url,
    )}
    <h1 class="h1 page-head__title">${esc(collection.name)}</h1>
    <p class="tag">${items.length} pieces</p>
    <p class="lede">${esc(collection.blurb)}</p>
    <ul style="display:flex;gap:0.4rem;list-style:none;padding:0;margin:var(--space-m) 0 0">
      ${each(
        collection.palette,
        (color) => `<li style="width:2.25rem;height:2.25rem;background:${esc(color)};
          border:2px solid var(--rule)"><span class="visually-hidden">Finish
          ${esc(color)}</span></li>`,
      )}
    </ul>
  </div>
</section>

<section class="section section--tight">
  <div class="shell">
    ${productGrid(items, url)}
  </div>
</section>

<section class="section section--fill section--ruled" aria-labelledby="others-heading">
  <div class="shell">
    <h2 class="h2" id="others-heading" style="margin:var(--space-2xs) 0 var(--space-l)">
      The other collections.</h2>

    <div style="display:grid;gap:2px;background:var(--rule);border:2px solid var(--rule)">
      ${each(
        others,
        (other) => `<a href="${esc(url(`/forma/collections/${other.slug}/`))}"
        style="background:var(--paper);padding:var(--space-m);text-decoration:none;
               display:grid;gap:var(--space-2xs)">
        <span style="display:flex;gap:0.35rem">
          ${each(
            other.palette,
            (color) => `<span style="width:1.5rem;height:1.5rem;background:${esc(color)};
              border:2px solid var(--rule)" aria-hidden="true"></span>`,
          )}
        </span>
        <span class="h3" style="margin-top:var(--space-2xs)">${esc(other.name)}</span>
        <span class="muted">${esc(other.blurb)}</span>
      </a>`,
      )}
    </div>
  </div>
</section>

${cta({
  url,
  title: 'Everything is in stock in Brooklyn.',
  body: 'Except brass and smoked oak, which are made to order and add about three weeks.',
  primary: { href: '/forma/shop/', label: 'Shop all eight' },
  secondary: { href: '/forma/stockists/', label: 'Find a stockist' },
})}
`;
}
