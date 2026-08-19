import { each, esc } from '../../_lib/html.js';
import { brand, cloths, garments } from '../assets/data.js';
import { swatch } from '../assets/textile.js';
import { crumbs } from '../components.js';

export const meta = {
  title: 'Cloth',
  description: `The six cloths this collection is cut from, drawn from their actual
    weave structure — twill, herringbone, poplin, rib, plain and crepe.`,
  scripts: ['ui.js', 'bag-count.js'],
  breadcrumbs: [
    { label: brand.name, href: '/vestra/' },
    { label: 'Cloth', href: '/vestra/cloth/' },
  ],
};

export function render({ url }) {
  return `
<section class="page-head">
  <div class="shell">
    ${crumbs(meta.breadcrumbs, url)}
    <p class="label">Six cloths</p>
    <h1 class="h1" data-reveal="lines" data-stagger="0.07"
        style="margin-top:var(--s-2xs)">What the collection is made of.</h1>
    <p class="lede" data-reveal data-delay="0.28" style="margin-top:var(--s-m)">
      Every swatch below is drawn from its real weave — which yarns pass over which,
      and on what diagonal. A twill leans, a herringbone reverses, a rib runs in cords.
      None of them is a flat colour, because none of them is flat.
    </p>
  </div>
</section>

<section class="section section--tight">
  <div class="shell cloth-list">
    ${each(
      Object.entries(cloths),
      ([key, cloth]) => {
        const cut = garments.filter((g) => g.cloth === key);
        return `<article class="cloth-entry" id="${esc(key)}">
        <div class="cloth-entry__art" data-reveal="clip">
          ${swatch({ cloth, title: `${cloth.name}, ${cloth.weave} weave`, scale: 0.5 })}
        </div>
        <div class="cloth-entry__text">
          <p class="label">${esc(cloth.weave)} weave</p>
          <h2 class="h2" style="margin-top:var(--s-2xs)">${esc(cloth.name)}</h2>
          <dl class="spec">
            <div><dt>Weight</dt><dd class="figure">${esc(cloth.weight)}</dd></div>
            <div><dt>Mill</dt><dd>${esc(cloth.mill)}</dd></div>
          </dl>
          <p class="muted measure" style="margin-top:var(--s-s)">${esc(cloth.note)}</p>
          ${
            cut.length
              ? `<p class="label" style="margin-top:var(--s-m)">Cut into</p>
          <ul class="ticks">
            ${each(
              cut,
              (g) => `<li><a href="${esc(url(`/vestra/shop/${g.slug}/`))}">${esc(g.name)}</a></li>`,
            )}
          </ul>`
              : ''
          }
        </div>
      </article>`;
      },
    )}
  </div>
</section>
`;
}
