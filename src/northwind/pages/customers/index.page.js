import { each, esc } from '../../../_lib/html.js';
import { customers, logos, product } from '../../data.js';
import { cta, pageHead, sectionHead } from '../../components.js';

export const meta = {
  title: 'Customers',
  description: `What changed after teams migrated: a 63% lower bill on triple the retained
    volume, and a HITRUST audit passed in a single cycle with observability in scope.`,
  scripts: ['ui.js'],
  breadcrumbs: [
    { label: 'Northwind', href: '/northwind/' },
    { label: 'Customers', href: '/northwind/customers/' },
  ],
};

export function render({ url }) {
  return `
${pageHead({
  title: 'What actually changed.',
  lede: `Two migrations written up properly — the constraint, what we did about it, and the
    number afterwards. Both companies are fictional; the engineering problems are not.`,
  trail: meta.breadcrumbs,
  url,
})}

<section class="section section--tight">
  <div class="shell">
    <div class="grid grid--2">
      ${each(
        customers,
        (customer) => `<a class="card card--link"
        href="${esc(url(`/northwind/customers/${customer.slug}/`))}">
        <h2 class="card__title" style="font-size:var(--step-2)">${esc(customer.name)}</h2>
        <p class="note">${esc(customer.sector)}</p>
        <p class="card__body" style="font-size:var(--step-0)">${esc(customer.summary)}</p>

        <ul class="metrics" style="margin-top:var(--space-l)">
          ${each(
            customer.metrics,
            (metric) => `<li>
            <p class="metrics__value" style="font-size:var(--step-2)">${esc(metric.value)}</p>
            <p class="metrics__label">${esc(metric.label)}</p>
          </li>`,
          )}
        </ul>

        <p class="arrow-link" style="margin-top:var(--space-l)">Read the case study</p>
      </a>`,
      )}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="who-heading">
  <div class="shell">
    ${sectionHead({
      note: `${product.customers.toLocaleString('en-US')} teams`,
      title: 'Who runs on Northwind.',
      body: `Mostly platform and infrastructure teams between ten and four hundred engineers,
        in industries where an outage is a regulatory event rather than an inconvenience.`,
      id: 'who-heading',
    })}
    <ul class="logos" style="margin-top:var(--space-l)">
      ${each(logos, (name) => `<li>${esc(name)}</li>`)}
    </ul>
  </div>
</section>

${cta({
  url,
  title: 'Talk to one of them.',
  body: 'We will introduce you to a team with a similar shape before you commit to anything.',
  primary: { href: '/northwind/demo/', label: 'Book a demo' },
  secondary: { href: '/northwind/pricing/', label: 'See pricing' },
})}
`;
}
