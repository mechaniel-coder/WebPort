import { each, esc } from '../../../_lib/html.js';
import { brand, cloths, garmentBySlug, looks, money } from '../../assets/data.js';
import { swatch } from '../../assets/textile.js';
import { crumbs } from '../../components.js';

/** One page per look, with the pieces resolved from the catalogue. */
export const pages = looks.map((look) => ({
  slug: look.slug,
  meta: {
    title: look.name,
    metaTitle: `${look.name} — ${brand.name} lookbook`,
    description: look.lede,
    scripts: ['ui.js', 'bag-count.js'],
    breadcrumbs: [
      { label: brand.name, href: '/vestra/' },
      { label: 'Lookbook', href: '/vestra/lookbook/' },
      { label: look.name, href: `/vestra/lookbook/${look.slug}/` },
    ],
  },

  render({ url }) {
    const pieces = look.pieces.map((slug) => garmentBySlug[slug]).filter(Boolean);
    const total = pieces.reduce((sum, g) => sum + g.price, 0);

    return `
<section class="page-head page-head--tight">
  <div class="shell">${crumbs(this.meta.breadcrumbs, url)}</div>
</section>

<section class="section section--tight">
  <div class="shell look-detail">
    <div class="look-detail__art" data-reveal="clip">
      ${each(
        pieces,
        (g) => swatch({ cloth: cloths[g.cloth], title: `${cloths[g.cloth].name}`, scale: 0.5 }),
      )}
    </div>

    <div class="look-detail__text">
      <h1 class="h1">${esc(look.name)}</h1>
      <p class="label">Look ${esc(look.index)} · ${esc(look.season)}</p>
      <p class="lede" style="margin-top:var(--s-s)">${esc(look.lede)}</p>
      <div class="prose muted" style="margin-top:var(--s-m)"><p>${esc(look.note)}</p></div>

      <p class="label" style="margin-top:var(--s-l)">In this look</p>
      <ul class="look-pieces">
        ${each(
          pieces,
          (g) => `<li>
          <a href="${esc(url(`/vestra/shop/${g.slug}/`))}">
            <span class="look-pieces__name">${esc(g.name)}</span>
            <span class="look-pieces__cloth">${esc(cloths[g.cloth].name)} · ${esc(g.cut)}</span>
            <span class="look-pieces__price figure">${esc(money(g.price))}</span>
          </a>
        </li>`,
        )}
      </ul>
      <p class="look-detail__total figure">
        Look total <strong>${esc(money(total))}</strong>
      </p>
    </div>
  </div>
</section>
`;
  },
}));
