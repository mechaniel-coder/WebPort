import { each, esc } from '../../_lib/html.js';
import { brand, cloths } from '../assets/data.js';
import { swatch } from '../assets/textile.js';
import { crumbs } from '../components.js';

export const meta = {
  title: 'Atelier',
  description: `How Vestra works: nine styles a season, six cloths, one grading rule,
    and a workshop of forty-one people in Porto.`,
  scripts: ['ui.js', 'bag-count.js'],
  breadcrumbs: [
    { label: brand.name, href: '/vestra/' },
    { label: 'Atelier', href: '/vestra/atelier/' },
  ],
};

const PRINCIPLES = [
  {
    title: 'The cloth is bought first',
    body: `We buy from six mills and design into what arrives. It is the opposite of
      the usual order, and it is why the collection is small — you cannot design
      ninety pieces around cloth you have actually seen.`,
  },
  {
    title: 'One grading rule, published',
    body: `Every garment is graded on the same rule and every finished measurement is
      on its page. If a size is wrong for you, you should be able to see that before
      it arrives rather than after.`,
  },
  {
    title: 'Ease is a decision',
    body: `A coat with 24 cm of ease and a rib top with minus 6 are not different
      sizes of the same idea. They are different intentions, and we say which is
      which rather than leaving it to the photograph.`,
  },
  {
    title: 'Nothing is made twice',
    body: `Runs are cut once, in the quantity the cloth allows. When a cloth is gone
      the garment goes with it, and we do not re-cut it in something similar.`,
  },
];

export function render({ url }) {
  return `
<section class="page-head">
  <div class="shell">
    ${crumbs(meta.breadcrumbs, url)}
    <h1 class="h1" data-reveal="lines" data-stagger="0.07">Forty-one people, nine styles.</h1>
    <p class="label">Since ${brand.founded}</p>
    <p class="lede" data-reveal data-delay="0.28" style="margin-top:var(--s-m)">
      ${esc(brand.lede)}
    </p>
  </div>
</section>

<section class="section section--tight">
  <div class="shell split grid">
    <div class="prose muted measure">
      <p>Vestra started because two of us could not buy a coat that fitted either of
        us, and had spent long enough in production to know exactly why. The problem
        was never the size range. It was that nobody would tell us what the garment
        actually measured.</p>
      <p>So that is the thing this label is organised around. The cloth is bought
        before the garment is drawn, the grade is published in full, and the intended
        ease is stated for every cut. None of it is generous — it is just legible.</p>
    </div>
    <div data-reveal="clip">
      ${swatch({ cloth: cloths['linen-canvas'], title: 'Linen canvas, wet-finished at 260 gsm', scale: 0.5 })}
    </div>
  </div>
</section>

<section class="section section--fill" aria-labelledby="how-heading">
  <div class="shell">
    <h2 class="h2" id="how-heading" style="margin-top:var(--s-2xs)">Four rules.</h2>
    <ul class="principles" data-reveal data-stagger="0.08">
      ${each(
        PRINCIPLES,
        (p, i) => `<li>
        <p class="principles__index figure">${String(i + 1).padStart(2, '0')}</p>
        <h3 class="h3">${esc(p.title)}</h3>
        <p class="muted">${esc(p.body)}</p>
      </li>`,
      )}
    </ul>
  </div>
</section>

<section class="section">
  <div class="shell shell--narrow">
    <h2 class="h2" style="margin-top:var(--s-2xs)">${esc(brand.city)}, and a workshop in Porto.</h2>
    <address class="prose muted" style="margin-top:var(--s-m);font-style:normal">
      <p>${esc(brand.address.street)}<br>
        ${esc(brand.address.postal)} ${esc(brand.address.locality)}</p>
      <p><a href="mailto:${esc(brand.email)}">${esc(brand.email)}</a><br>
        <a href="tel:${esc(brand.phone.replace(/\s/g, ''))}">${esc(brand.phone)}</a></p>
    </address>
  </div>
</section>
`;
}
