import { esc } from '../../../_lib/html.js';
import { brand, garments } from '../../assets/data.js';
import { crumbs, garmentGrid } from '../../components.js';

export const meta = {
  title: 'The collection',
  description: `Every garment in the current collection, with the cloth it is cut from
    and the full size grade published for each.`,
  scripts: ['ui.js', 'bag-count.js'],
  breadcrumbs: [
    { label: brand.name, href: '/vestra/' },
    { label: 'Shop', href: '/vestra/shop/' },
  ],
};

export function render({ url }) {
  return `
<section class="page-head">
  <div class="shell">
    ${crumbs(meta.breadcrumbs, url)}
    <h1 class="h1" data-reveal="lines" data-stagger="0.07">The collection.</h1>
    <p class="label">${garments.length} garments</p>
    <p class="lede" data-reveal data-delay="0.28" style="margin-top:var(--s-m)">
      Six cloths, nine styles, graded across six sizes. Each garment lists the cloth it
      is cut from, because that is the decision everything else follows from.
    </p>
  </div>
</section>

<section class="section section--tight">
  <div class="shell">
    ${garmentGrid(garments, url)}
  </div>
</section>
`;
}
