/**
 * Case studies, generated from data.js.
 */
import { absolute, each, esc } from '../../../_lib/html.js';
import { studies } from '../../data.js';
import { studio } from '../../../../site.config.js';

export const pages = studies.map((study) => ({
  slug: study.slug,

  meta: {
    title: `${study.name} — case study`,
    metaTitle: `${study.name} — ${studio.name} case study`,
    description: study.oneLiner,
    ogType: 'article',
    breadcrumbs: [
      { label: 'Work', href: '/' },
      { label: study.name, href: `/work/${study.slug}/` },
    ],
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: `${study.name} — ${study.sector} case study`,
      description: study.oneLiner,
      mainEntityOfPage: absolute(`/work/${study.slug}/`),
      author: { '@type': 'Organization', name: studio.name },
      about: { '@type': 'CreativeWork', name: study.name },
    },
  },

  render: ({ url }) => renderStudy(study, url),
}));

function renderStudy(study, url) {
  const others = studies.filter((other) => other.slug !== study.slug);

  return `
<article style="--accent: ${esc(study.accent)}">
  <header class="hero" style="border-bottom:1px solid var(--rule)">
    <div class="shell">
      <nav class="crumbs" aria-label="Breadcrumb" style="margin-bottom:var(--space-m)">
        <ol>
          <li><a href="${esc(url('/'))}">Work</a></li>
          <li><span aria-current="page">${esc(study.name)}</span></li>
        </ol>
      </nav>

      <p class="section__label" style="color:var(--accent)">
        ${esc(study.sector)} · ${esc(study.year)}</p>
      <h1 class="hero__title" style="font-size:var(--step-4);max-width:20ch">
        ${esc(study.name)}</h1>
      <p class="hero__lede">${esc(study.oneLiner)}</p>

      <dl class="case-facts">
        <div><dt>Role</dt><dd>${esc(study.role)}</dd></div>
        <div><dt>Pages</dt><dd>${study.pages}</dd></div>
        <div><dt>Signature system</dt><dd>${esc(study.signature)}</dd></div>
      </dl>

      <p style="margin-top:var(--space-l)">
        <a class="button" href="${esc(url(study.live))}">Open the live site</a>
      </p>
    </div>
  </header>

  <section class="section" aria-labelledby="brief-heading">
    <div class="shell case-grid">
      <h2 class="case-grid__label" id="brief-heading">The brief</h2>
      <div class="prose">
        <p>${esc(study.brief)}</p>
      </div>
    </div>
  </section>

  <section class="section section--tight" aria-labelledby="constraints-heading">
    <div class="shell case-grid">
      <h2 class="case-grid__label" id="constraints-heading">Constraints</h2>
      <ul class="constraints">
        ${each(study.constraints, (item) => `<li>${esc(item)}</li>`)}
      </ul>
    </div>
  </section>

  <section class="section" aria-labelledby="approach-heading">
    <div class="shell case-grid">
      <h2 class="case-grid__label" id="approach-heading">What we did</h2>
      <div class="approach">
        ${each(
          study.approach,
          (step, index) => `<section class="approach__item">
          <p class="approach__num">${String(index + 1).padStart(2, '0')}</p>
          <div>
            <h3 class="approach__title">${esc(step.title)}</h3>
            <p>${esc(step.text)}</p>
          </div>
        </section>`,
        )}
      </div>
    </div>
  </section>

  <section class="section section--tight" aria-labelledby="tradeoff-heading">
    <div class="shell case-grid">
      <h2 class="case-grid__label" id="tradeoff-heading">What it cost</h2>
      <div class="prose">
        <p class="tradeoff">${esc(study.tradeoff)}</p>
        <p class="text-muted" style="font-size:var(--step--1);margin-top:var(--space-m)">
          Every project trades something away. A case study that does not say what is a
          brochure.
        </p>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="verified-heading">
    <div class="shell case-grid">
      <h2 class="case-grid__label" id="verified-heading">How it was checked</h2>
      <ul class="verified">
        ${each(study.verified, (item) => `<li>${esc(item)}</li>`)}
      </ul>
    </div>
  </section>
</article>

<section class="section section--tight" aria-labelledby="next-heading">
  <div class="shell">
    <p class="section__label" id="next-heading">Next</p>
  </div>
  <ul class="work">
    ${each(
      others,
      (other, index) => `<li class="work__item" style="--accent: ${esc(other.accent)}">
      <div class="shell">
        <a class="work__link" href="${esc(url(`/work/${other.slug}/`))}">
          <span class="work__index">${String(index + 1).padStart(2, '0')}</span>
          <span class="work__name">${esc(other.name)}</span>
          <span class="work__summary">${esc(other.summary)}</span>
          <span class="work__sector">${esc(other.sector)}</span>
        </a>
      </div>
    </li>`,
    )}
  </ul>
</section>
`;
}
