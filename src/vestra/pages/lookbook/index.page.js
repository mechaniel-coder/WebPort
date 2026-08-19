import { each, esc } from '../../../_lib/html.js';
import { brand, looks, garmentBySlug, cloths } from '../../assets/data.js';
import { swatch } from '../../assets/textile.js';
import { crumbs } from '../../components.js';

export const meta = {
  title: 'Lookbook',
  description: `Three looks from the current collection, each annotated with the
    garments in it and why they are worn together.`,
  scripts: ['ui.js', 'bag-count.js'],
  breadcrumbs: [
    { label: brand.name, href: '/vestra/' },
    { label: 'Lookbook', href: '/vestra/lookbook/' },
  ],
};

export function render({ url }) {
  return `
<section class="page-head">
  <div class="shell">
    ${crumbs(meta.breadcrumbs, url)}
    <h1 class="h1" data-reveal="lines" data-stagger="0.07"
        style="margin-top:var(--s-2xs)">Worn together.</h1>
    <p class="lede" data-reveal data-delay="0.28" style="margin-top:var(--s-m)">
      Three looks, each one a note about why these pieces work in the same outfit —
      usually because of what the cloth is doing rather than what the colour is.
    </p>
  </div>
</section>

<section class="section section--tight">
  <div class="shell looks" data-reveal data-stagger="0.09">
    ${each(
      looks,
      (look) => `<article class="look">
      <a class="look__link" href="${esc(url(`/vestra/lookbook/${look.slug}/`))}">
        <span class="look__cloths">
          ${each(
            look.pieces.slice(0, 2),
            (slug) => swatch({ cloth: cloths[garmentBySlug[slug].cloth], scale: 0.5 }),
          )}
        </span>
        <span class="look__body">
          <span class="look__index">${esc(look.index)}</span>
          <span class="look__name">${esc(look.name)}</span>
          <span class="look__lede">${esc(look.lede)}</span>
          <span class="look__count">${look.pieces.length} pieces</span>
        </span>
      </a>
    </article>`,
    )}
  </div>
</section>
`;
}
