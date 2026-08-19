import { each, esc } from '../../_lib/html.js';
import { brand, garments, cloths } from '../assets/data.js';
import { faqPage } from '../../_lib/seo.js';
import { crumbs } from '../components.js';

const FAQ = [
  {
    question: 'What if it does not fit?',
    answer: `Thirty days, postage paid, no reason needed. We would rather you sent it
      back than kept something that does not work — but the fit page exists so that
      happens as rarely as possible.`,
  },
  {
    question: 'Why is the rib top so small on the hanger?',
    answer: `Because it is meant to be. It is cut 6 cm under the body measurement and
      stretches to meet it. Sizing up gives you a looser top, not a better-fitting one.`,
  },
  {
    question: 'Do you restock?',
    answer: `Not usually. Runs are cut once, in the quantity the cloth allows, and when
      a cloth is finished the garment is finished with it.`,
  },
  {
    question: 'Will the linen crease?',
    answer: `Yes, and it is supposed to. It is wet-finished so it softens and marks
      where it has been worn. If you want linen that stays flat, this is not it.`,
  },
  {
    question: 'Can you alter something?',
    answer: `Hems and sleeve length, yes, in the Porto workshop, at cost. Anything
      structural is usually better cut new — write to us and we will say honestly
      which of the two it is.`,
  },
];

export const meta = {
  title: 'Care & returns',
  description: `How to look after each cloth, and how returns work: ${brand.returnDays}
    days, postage paid, no reason needed.`,
  scripts: ['ui.js', 'bag-count.js'],
  jsonld: faqPage(FAQ),
  breadcrumbs: [
    { label: brand.name, href: '/vestra/' },
    { label: 'Care & returns', href: '/vestra/care/' },
  ],
};

export function render({ url }) {
  return `
<section class="page-head">
  <div class="shell">
    ${crumbs(meta.breadcrumbs, url)}
    <p class="label">Care</p>
    <h1 class="h1" data-reveal="lines" data-stagger="0.07"
        style="margin-top:var(--s-2xs)">Keeping it.</h1>
    <p class="lede" data-reveal data-delay="0.28" style="margin-top:var(--s-m)">
      Natural cloth changes with wear. Most of what follows is about letting it do
      that in the right direction.
    </p>
  </div>
</section>

<section class="section section--tight">
  <div class="shell">
    <p class="label">By cloth</p>
    <div class="grade-scroll" data-scroll-region tabindex="0" role="region" aria-label="Care by garment, scrollable">
      <table class="grade" style="margin-top:var(--s-m)">
        <caption class="visually-hidden">Cloth and care instruction by garment</caption>
        <thead>
          <tr><th scope="col">Garment</th><th scope="col">Cloth</th><th scope="col">Care</th></tr>
        </thead>
        <tbody>
          ${each(
            garments,
            (g) => `<tr>
            <th scope="row"><a href="${esc(url(`/vestra/shop/${g.slug}/`))}">${esc(g.name)}</a></th>
            <td style="text-align:left">${esc(cloths[g.cloth].name)}</td>
            <td style="text-align:left">${esc(g.care.join(' · '))}</td>
          </tr>`,
          )}
        </tbody>
      </table>
    </div>
  </div>
</section>

<section class="section section--fill" aria-labelledby="faq-heading">
  <div class="shell shell--narrow">
    <p class="label">Questions</p>
    <h2 class="h2" id="faq-heading" style="margin-top:var(--s-2xs)">Asked often.</h2>
    <div class="accordion" data-accordion style="margin-top:var(--s-l)">
      ${each(
        FAQ,
        (item, i) => `<div class="accordion__item">
        <h3>
          <button class="accordion__trigger" type="button" aria-expanded="false"
                  aria-controls="faq-${i}" id="faq-t-${i}">
            <span>${esc(item.question)}</span>
            <span class="accordion__icon" aria-hidden="true"></span>
          </button>
        </h3>
        <div class="accordion__panel" id="faq-${i}" role="region" aria-labelledby="faq-t-${i}" hidden>
          <p>${esc(item.answer)}</p>
        </div>
      </div>`,
      )}
    </div>
  </div>
</section>
`;
}
