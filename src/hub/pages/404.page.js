import { each, esc } from '../../_lib/html.js';
import { studies } from '../data.js';

export const meta = {
  title: 'Page not found',
  description: 'That page does not exist. Here is everything that does.',
  // Kept out of the sitemap; also the target most hosts are pointed at for 404s.
  noindex: true,
};

export function render({ url }) {
  return `
<section class="hero">
  <div class="shell">
    <p class="section__label">404</p>
    <h1 class="hero__title" style="font-size:var(--step-4);max-width:16ch">
      That page does not exist.</h1>
    <p class="hero__lede">
      Either the link was wrong or something moved. Everything that does exist is below.
    </p>
    <p style="margin-top:var(--space-l)">
      <a class="button" href="${esc(url('/'))}">Back to the work</a>
      <a class="button button--ghost" style="margin-left:var(--space-xs)"
         href="${esc(url('/contact/'))}">Tell us what broke</a>
    </p>
  </div>
</section>

<section class="section" aria-labelledby="everything-heading">
  <div class="shell">
    <p class="section__label" id="everything-heading">The four sites</p>
  </div>
  <ul class="work">
    ${each(
      studies,
      (study, index) => `<li class="work__item" style="--accent: ${esc(study.accent)}">
      <div class="shell">
        <a class="work__link" href="${esc(url(study.live))}">
          <span class="work__index">${String(index + 1).padStart(2, '0')}</span>
          <span class="work__name">${esc(study.name)}</span>
          <span class="work__summary">${esc(study.summary)}</span>
          <span class="work__sector">${esc(study.sector)}</span>
        </a>
      </div>
    </li>`,
    )}
  </ul>
</section>
`;
}
