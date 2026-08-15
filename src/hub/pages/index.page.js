import { each, esc } from '../../_lib/html.js';
import { studio } from '../../../site.config.js';
import { work } from '../site.js';

export const meta = {
  title: 'Work',
  metaTitle: `${studio.name} — website design and engineering`,
  description: `Three commissioned website builds by ${studio.name}: a coastal hotel with a
    bespoke booking engine, a B2B observability platform, and a design-object storefront.`,
  priority: 1.0,
};

export function render({ url }) {
  return `
<section class="hero">
  <div class="shell">
    <h1 class="hero__title">We build the website the business actually needed.</h1>
    <p class="hero__lede">
      ${esc(studio.name)} designs and engineers marketing sites and storefronts for companies
      where the website <em>is</em> the first impression. Every project below was designed,
      built and shipped end to end — design system, front end, interaction, accessibility.
    </p>
    <div class="hero__meta">
      <span>Three case studies</span>
      <span>Design systems built from scratch</span>
      <span>No templates, no page builders</span>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="work-heading">
  <div class="shell">
    <p class="section__label" id="work-heading">Selected work</p>
  </div>
  <ul class="work">
    ${each(
      work,
      (item, index) => `<li class="work__item" style="--accent: ${esc(item.accent)}">
      <div class="shell">
        <a class="work__link" href="${esc(url(`/work/${item.slug}/`))}">
          <span class="work__index">${String(index + 1).padStart(2, '0')}</span>
          <span class="work__name">${esc(item.name)}</span>
          <span class="work__summary">${esc(item.summary)}</span>
          <span class="work__sector">${esc(item.sector)}</span>
        </a>
      </div>
    </li>`,
    )}
  </ul>
</section>
`;
}
