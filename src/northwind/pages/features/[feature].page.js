/**
 * Feature deep-dives, generated from data.js.
 */
import { absolute, each, esc } from '../../../_lib/html.js';
import { features } from '../../data.js';
import { DIAGRAMS } from '../../art.js';
import { crumbs, cta, sectionHead } from '../../components.js';

const DIAGRAM_TITLES = {
  metrics:
    'The Northwind ingest path, with the storage stage highlighted: services send to a collector, which forwards to the columnar store, which is queried with NWQL.',
  traces:
    'Two rows of 14 traces, four containing errors. Head sampling at 30% keeps only one of the four error traces; tail sampling keeps all four.',
  logs: 'Two cost bars. An index-everything platform spends 72% of cost on the index; Northwind spends 14%, indexing metadata only and scanning bodies from compressed columns.',
};

export const pages = features.map((feature) => ({
  slug: feature.slug,

  meta: {
    title: feature.name,
    metaTitle: `${feature.name} — Northwind`,
    description: feature.summary,
    scripts: ['ui.js'],
    breadcrumbs: [
      { label: 'Northwind', href: '/northwind/' },
      { label: 'Platform', href: '/northwind/platform/' },
      { label: feature.name, href: `/northwind/features/${feature.slug}/` },
    ],
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: `${feature.name} — Northwind`,
      description: feature.summary,
      mainEntityOfPage: absolute(`/northwind/features/${feature.slug}/`),
    },
  },

  render: ({ url }) => renderFeature(feature, url),
}));

function renderFeature(feature, url) {
  const others = features.filter((other) => other.slug !== feature.slug);

  return `
<section class="page-head">
  <div class="shell">
    ${crumbs(
      [
        { label: 'Northwind', href: '/northwind/' },
        { label: 'Platform', href: '/northwind/platform/' },
        { label: feature.name, href: `/northwind/features/${feature.slug}/` },
      ],
      url,
    )}
    <h1 class="h1 page-head__title">${esc(feature.name)}</h1>
    <p class="note">${esc(feature.kicker)}</p>
    <p class="lede">${esc(feature.lede)}</p>
  </div>
</section>

<section class="section section--tight">
  <div class="shell">
    <figure style="margin:0">
      ${DIAGRAMS[feature.diagram]({ title: DIAGRAM_TITLES[feature.diagram] })}
    </figure>
  </div>
</section>

<section class="section" aria-labelledby="detail-heading">
  <div class="shell">
    <h2 class="visually-hidden" id="detail-heading">How ${esc(feature.name.toLowerCase())} works</h2>
    <div class="grid grid--3">
      ${each(
        feature.points,
        (point) => `<div>
        <h3 class="h3">${esc(point.title)}</h3>
        <p class="card__body" style="font-size:var(--step-0)">${esc(point.text)}</p>
      </div>`,
      )}
    </div>
  </div>
</section>

<section class="section section--raised" aria-labelledby="specs-heading">
  <div class="shell">
    <div class="grid grid--2" style="gap:var(--space-2xl);align-items:start">
      <div>
        ${sectionHead({
          title: 'The numbers that matter.',
          id: 'specs-heading',
        })}
        <p class="lede">Published rather than discovered during a proof of concept.</p>
      </div>

      <table class="spec-table">
        <caption class="visually-hidden">${esc(feature.name)} specifications</caption>
        <tbody>
          ${each(
            feature.specs,
            ([key, value]) => `<tr><th scope="row">${esc(key)}</th><td>${esc(value)}</td></tr>`,
          )}
        </tbody>
      </table>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="others-heading">
  <div class="shell">
    ${sectionHead({
      title: 'The other two signals.',
      id: 'others-heading',
    })}
    <div class="grid grid--2">
      ${each(
        others,
        (other) => `<a class="card card--link"
        href="${esc(url(`/northwind/features/${other.slug}/`))}">
        <h3 class="card__title">${esc(other.name)}</h3>
        <p class="note">${esc(other.kicker)}</p>
        <p class="card__body">${esc(other.summary)}</p>
      </a>`,
      )}
    </div>
  </div>
</section>

${cta({
  url,
  title: `See ${feature.name.toLowerCase()} on your own data.`,
  primary: { href: '/northwind/demo/', label: 'Book a demo' },
  secondary: { href: '/northwind/pricing/', label: 'See pricing' },
})}
`;
}
