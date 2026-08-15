/**
 * Customer case studies, generated from data.js.
 */
import { absolute, each, esc } from '../../../_lib/html.js';
import { customers } from '../../data.js';
import { crumbs, cta } from '../../components.js';

export const pages = customers.map((customer) => ({
  slug: customer.slug,

  meta: {
    title: customer.name,
    metaTitle: `${customer.name} — Northwind case study`,
    description: customer.summary,
    ogType: 'article',
    scripts: ['ui.js'],
    breadcrumbs: [
      { label: 'Northwind', href: '/northwind/' },
      { label: 'Customers', href: '/northwind/customers/' },
      { label: customer.name, href: `/northwind/customers/${customer.slug}/` },
    ],
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: `${customer.name} — Northwind case study`,
      description: customer.summary,
      mainEntityOfPage: absolute(`/northwind/customers/${customer.slug}/`),
      about: { '@type': 'Organization', name: customer.name },
    },
  },

  render: ({ url }) => renderStudy(customer, url),
}));

function renderStudy(customer, url) {
  const others = customers.filter((other) => other.slug !== customer.slug);

  return `
<article>
  <header class="page-head">
    <div class="shell">
      ${crumbs(
        [
          { label: 'Northwind', href: '/northwind/' },
          { label: 'Customers', href: '/northwind/customers/' },
          { label: customer.name, href: `/northwind/customers/${customer.slug}/` },
        ],
        url,
      )}
      <p class="kicker">${esc(customer.sector)}</p>
      <h1 class="h1 page-head__title">${esc(customer.name)}</h1>
      <p class="lede">${esc(customer.summary)}</p>
    </div>
  </header>

  <section class="section section--tight">
    <div class="shell">
      <ul class="metrics">
        ${each(
          customer.metrics,
          (metric) => `<li>
          <p class="metrics__value">${esc(metric.value)}</p>
          <p class="metrics__label">${esc(metric.label)}</p>
        </li>`,
        )}
      </ul>
    </div>
  </section>

  <section class="section section--raised">
    <div class="shell">
      <blockquote class="quote" style="max-width:52rem">
        <p>“${esc(customer.quote)}”</p>
        <footer>${esc(customer.attribution)}, ${esc(customer.name)}</footer>
      </blockquote>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      <div class="prose">
        <h2>The constraint</h2>
        <p>${esc(customer.challenge)}</p>

        <h2>What we changed</h2>
        <p>${esc(customer.approach)}</p>

        <h2>Where it landed</h2>
        <p>${esc(customer.outcome)}</p>
      </div>
    </div>
  </section>
</article>

<section class="section section--raised" aria-labelledby="more-heading">
  <div class="shell">
    <h2 class="h2" id="more-heading" style="margin-bottom:var(--space-l)">Another migration.</h2>
    <div class="grid grid--2">
      ${each(
        others,
        (other) => `<a class="card card--link"
        href="${esc(url(`/northwind/customers/${other.slug}/`))}">
        <p class="kicker">${esc(other.sector)}</p>
        <h3 class="card__title" style="margin-top:var(--space-2xs)">${esc(other.name)}</h3>
        <p class="card__body">${esc(other.summary)}</p>
      </a>`,
      )}
    </div>
  </div>
</section>

${cta({
  url,
  title: 'Run the same exercise on your own bill.',
  primary: { href: '/northwind/pricing/', label: 'Open the calculator' },
  secondary: { href: '/northwind/demo/', label: 'Book a demo' },
})}
`;
}
