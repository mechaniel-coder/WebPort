import { each, esc } from '../../_lib/html.js';
import { brand, collections, materialNotes, products } from '../data.js';
import { productArt } from '../assets/render.js';
import { catalogueIsland, cta, productGrid, sectionHead, strip } from '../components.js';

export const meta = {
  title: 'Design objects',
  metaTitle: `${brand.name} — objects with one idea each`,
  description: `Lighting, furniture and tableware made in small runs from aluminium, oak,
    glass and stoneware. Designed and shipped from Brooklyn.`,
  priority: 1.0,
  styles: ['shop.css'],
  scripts: ['ui.js', 'cart.js'],
};

export function render({ url }) {
  const featured = [...products].sort((a, b) => a.featured - b.featured).slice(0, 6);
  const hero = products.find((product) => product.slug === 'halo-pendant');

  return `
${catalogueIsland(url)}

<section class="hero">
  <div class="shell hero__grid">
    <div>
      <h1 class="display hero__title" data-reveal="lines" data-stagger="0.08">
        Objects with one idea each.</h1>
      <p class="tag" data-reveal data-delay="0.24"
         style="margin-top:var(--space-s)">Since ${brand.founded} · Brooklyn</p>
      <p class="lede" data-reveal data-delay="0.3" style="margin-top:var(--space-m)">${esc(brand.lede)}</p>
      <div class="hero__actions" data-reveal data-delay="0.42">
        <a class="btn" href="${esc(url('/forma/shop/'))}">Shop everything</a>
        <a class="btn btn--ghost" href="${esc(url('/forma/materials/'))}">How it is made</a>
      </div>
    </div>
    <div class="hero__art" data-reveal="clip" data-delay="0.15">
      ${productArt({
        shape: hero.shape,
        finish: 'ochre',
        title: `${hero.name} in Ochre — illustration`,
      })}
    </div>
  </div>
</section>

${strip([
  'Free shipping over $250',
  '30-day returns, postage paid',
  'Made in runs of 200 or fewer',
])}

<section class="section" aria-labelledby="featured-heading">
  <div class="shell">
    ${sectionHead({
        title: 'Six things we would put in our own flat.',
      id: 'featured-heading',
      link: { href: '/forma/shop/', label: 'All eight products' },
      url,
    })}
  </div>
  <div class="shell">
    ${productGrid(featured, url)}
  </div>
</section>

<section class="section section--fill section--ruled" aria-labelledby="collections-heading">
  <div class="shell">
    ${sectionHead({
        title: 'Grouped by the problem they solve.',
      id: 'collections-heading',
    })}

    <div style="display:grid;gap:2px;background:var(--rule);border:2px solid var(--rule)">
      ${each(
        collections,
        (collection) => `<a href="${esc(url(`/forma/collections/${collection.slug}/`))}"
        style="background:var(--paper);padding:var(--space-m);text-decoration:none;
               display:grid;gap:var(--space-2xs)">
        <span style="display:flex;gap:0.35rem">
          ${each(
            collection.palette,
            (color) => `<span style="width:1.5rem;height:1.5rem;background:${esc(color)};
              border:2px solid var(--rule)" aria-hidden="true"></span>`,
          )}
        </span>
        <span class="h3" style="margin-top:var(--space-2xs)">${esc(collection.name)}</span>
        <span class="muted">${esc(collection.blurb)}</span>
        <span class="tag">${collection.items.length} pieces</span>
      </a>`,
      )}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="materials-heading">
  <div class="shell">
    <div style="display:grid;gap:var(--space-xl)">
      ${sectionHead({
            title: 'Five materials, chosen for how they age.',
        body: `Nothing here is finished to look new forever. Oak darkens, steel patinas at the
          edges, and the aluminium picks up a satin from being handled.`,
        id: 'materials-heading',
        link: { href: '/forma/materials/', label: 'Read the material notes' },
        url,
      })}

      <ul class="rows" style="margin:0">
        ${each(
          materialNotes.slice(0, 3),
          (note) => `<li>
          <span class="rows__key">${esc(note.name)}</span>
          <span class="rows__value">${esc(note.text)}</span>
        </li>`,
        )}
      </ul>
    </div>
  </div>
</section>

${cta({
  url,
  title: 'Come and pick one up.',
  body: `The Brooklyn studio is open Thursday to Saturday, and eleven stockists carry parts of
    the range.`,
  primary: { href: '/forma/stockists/', label: 'Find a stockist' },
  secondary: { href: '/forma/shop/', label: 'Shop online' },
})}
`;
}
