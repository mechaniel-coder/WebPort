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

<section class="section" aria-labelledby="lab-heading">
  <div class="shell">
    <div class="case-grid">
      <p class="section__label" id="lab-heading">In-house research</p>
      <div>
        <h2 class="hero__title" style="font-size:var(--step-3);max-width:18ch">
          The lab is where the techniques get worked out.</h2>
        <p class="hero__lede" style="margin-top:var(--space-s)">
          Four experiments in methods that normally arrive with a library attached — a WebGL
          renderer, a Verlet physics solver, scroll-driven storytelling and frontier CSS —
          each written without one. Not client work; the reason the client work goes quickly.
        </p>
        <ul class="constraints" style="margin-top:var(--space-m)">
          <li>A 3D renderer written from the matrix maths up, no three.js</li>
          <li>Cloth and constraint physics with a hand-written integrator</li>
          <li>Scrollytelling that never takes the scrollbar</li>
        </ul>
        <p style="margin-top:var(--space-l)">
          <a class="button button--ghost" href="${esc(url('/lab/'))}">Open the lab</a>
        </p>
      </div>
    </div>
  </div>
</section>
`;
}
