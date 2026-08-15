import { each, esc, escJson } from '../../_lib/html.js';
import { ANNUAL_DISCOUNT, RETENTION, plans, pricingFaqs } from '../data.js';
import { faqPage } from '../../_lib/seo.js';
import { accordion, cta, pageHead, sectionHead } from '../components.js';

export const meta = {
  title: 'Pricing',
  description: `Billed on ingest rather than per seat. Free to 5 GB a month, then $89 for
    Team and $499 for Business — work out your exact bill with the calculator.`,
  styles: ['pricing.css'],
  scripts: ['ui.js', 'pricing.js'],
  priority: 0.9,
  breadcrumbs: [
    { label: 'Northwind', href: '/northwind/' },
    { label: 'Pricing', href: '/northwind/pricing/' },
  ],
  jsonld: faqPage(pricingFaqs),
};

/** Only what the calculator needs; the page renders the rest server-side. */
const pricingData = {
  plans: plans.map(
    ({ id, name, base, includedGb, includedHosts, gbRate, hostRate, maxGb, maxHosts, retention }) => ({
      id,
      name,
      base,
      includedGb,
      includedHosts,
      gbRate,
      hostRate,
      maxGb,
      maxHosts,
      retention,
    }),
  ),
  retention: RETENTION,
  annualDiscount: ANNUAL_DISCOUNT,
};

const money = (cents) =>
  (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

export function render({ url }) {
  return `
<script type="application/json" id="pricing-data">${escJson(pricingData)}</script>

${pageHead({
  kicker: 'Pricing',
  title: 'Billed on bytes, not on people.',
  lede: `Unlimited users, dashboards and alerts on every plan. You pay for what you ingest
    and how long you keep it, and both numbers are on this page.`,
  trail: meta.breadcrumbs,
  url,
})}

<section class="section section--tight">
  <div class="shell">
    <ul class="plans" style="list-style:none;padding:0;margin:0">
      ${each(
        plans,
        (plan) => `<li class="plan" data-popular="${Boolean(plan.popular)}">
        ${plan.popular ? '<span class="plan__flag">Most chosen</span>' : ''}
        <h2 class="plan__name">${esc(plan.name)}</h2>
        <p class="plan__price">
          <span class="plan__amount">${esc(money(plan.base))}</span>
          <span class="plan__period">${plan.base === 0 ? 'forever' : 'per month'}</span>
        </p>
        <p class="plan__blurb">${esc(plan.blurb)}</p>
        <ul class="checks">
          ${each(plan.features, (feature) => `<li>${esc(feature)}</li>`)}
        </ul>
        <a class="btn${plan.popular ? '' : ' btn--ghost'}" style="margin-top:var(--space-2xs)"
           href="${esc(url('/northwind/demo/'))}">
          ${plan.base === 0 ? 'Start free' : `Choose ${esc(plan.name)}`}</a>
      </li>`,
      )}
    </ul>

    <p class="hero__note" style="margin-top:var(--space-m)">
      Beyond ${plans[2].maxGb.toLocaleString('en-US')} GB or
      ${plans[2].maxHosts.toLocaleString('en-US')} hosts it becomes an Enterprise
      conversation — volume commit, private regions and a named engineer.
      <a href="${esc(url('/northwind/demo/'))}">Talk to us</a>.
    </p>
  </div>
</section>

<section class="section" aria-labelledby="calc-heading">
  <div class="shell">
    ${sectionHead({
      kicker: 'Calculator',
      title: 'Work out your actual bill.',
      body: `Real tiered arithmetic against the rates above — including the crossover where
        Business stops being the expensive option.`,
      id: 'calc-heading',
    })}

    <div class="calculator" data-calculator>
      <div class="calculator__grid">
        <div class="calculator__controls">
          <div class="control">
            <div class="control__head">
              <label class="control__label" for="calc-gb">Monthly ingest</label>
              <output class="control__value" data-output="gb" for="calc-gb">100 GB</output>
            </div>
            <input id="calc-gb" type="range" min="0" max="11" step="1" value="5"
                   data-input="gb" aria-describedby="calc-gb-scale">
            <p class="control__scale" id="calc-gb-scale"><span>1 GB</span><span>10 TB</span></p>
          </div>

          <div class="control">
            <div class="control__head">
              <label class="control__label" for="calc-hosts">Monitored hosts</label>
              <output class="control__value" data-output="hosts" for="calc-hosts">25</output>
            </div>
            <input id="calc-hosts" type="range" min="0" max="10" step="1" value="4"
                   data-input="hosts" aria-describedby="calc-hosts-scale">
            <p class="control__scale" id="calc-hosts-scale"><span>1</span><span>1,000</span></p>
          </div>

          <fieldset class="control" style="border:0;padding:0;margin-top:var(--space-m)">
            <legend class="control__label" style="padding:0;margin-bottom:0.4rem">Retention</legend>
            <div class="radio-row">
              ${each(
                RETENTION,
                (entry, index) => `<label class="radio-chip">
                <input type="radio" name="retention" value="${entry.days}"
                       ${index === 1 ? 'checked' : ''}>
                <span>${esc(entry.label)}</span>
              </label>`,
              )}
            </div>
          </fieldset>

          <div class="control">
            <label class="switch">
              <input type="checkbox" data-input="annual">
              <span class="switch__track" aria-hidden="true"></span>
              <span>Billed annually — save ${Math.round(ANNUAL_DISCOUNT * 100)}%</span>
            </label>
          </div>
        </div>

        <div class="calculator__output">
          <h3 class="panel__title" style="margin-bottom:var(--space-s)">Monthly cost</h3>
          <div class="results" data-results role="status"></div>
          <div class="recommendation" data-recommendation></div>
        </div>
      </div>
    </div>

    <noscript>
      <p class="form-status" style="margin-top:var(--space-m)">
        The calculator needs JavaScript. The rates it uses are published in full in the
        comparison table below, so the arithmetic can be done by hand.
      </p>
    </noscript>
  </div>
</section>

<section class="section section--raised" aria-labelledby="compare-heading">
  <div class="shell">
    ${sectionHead({
      kicker: 'Comparison',
      title: 'Every rate, in one table.',
      id: 'compare-heading',
    })}

    <div class="compare-wrap">
      <table class="compare">
        <caption class="visually-hidden">Plan limits and rates</caption>
        <thead>
          <tr>
            <th scope="col">&nbsp;</th>
            ${each(plans, (plan) => `<th scope="col">${esc(plan.name)}</th>`)}
          </tr>
        </thead>
        <tbody>
          ${each(
            [
              ['Platform fee', (plan) => `${money(plan.base)}/mo`],
              ['Included ingest', (plan) => `${plan.includedGb} GB`],
              ['Ingest overage', (plan) => (plan.gbRate ? `${money(plan.gbRate)}/GB` : '—')],
              ['Included hosts', (plan) => String(plan.includedHosts)],
              ['Host overage', (plan) => (plan.hostRate ? `${money(plan.hostRate)}/host` : '—')],
              ['Max ingest', (plan) => `${plan.maxGb.toLocaleString('en-US')} GB`],
              ['Max hosts', (plan) => plan.maxHosts.toLocaleString('en-US')],
              [
                'Retention options',
                (plan) =>
                  plan.retention
                    .map((days) => RETENTION.find((entry) => entry.days === days).label)
                    .join(', '),
              ],
              ['Users', () => 'Unlimited'],
            ],
            ([label, value]) => `<tr>
            <th scope="row">${esc(label)}</th>
            ${each(plans, (plan) => `<td>${esc(value(plan))}</td>`)}
          </tr>`,
          )}
        </tbody>
      </table>
    </div>

    <p class="hero__note" style="margin-top:var(--space-m)">
      Retention beyond 30 days multiplies the storage component only:
      ${each(
        RETENTION.filter((entry) => entry.multiplier > 1),
        (entry) => `${esc(entry.label)} ×${entry.multiplier}`,
      )
        .split('\n')
        .join(', ')}. The platform fee and per-host charge are unaffected.
    </p>
  </div>
</section>

<section class="section" aria-labelledby="faq-heading">
  <div class="shell" style="max-width:52rem">
    ${sectionHead({ kicker: 'Questions', title: 'Before you commit.', id: 'faq-heading' })}
    ${accordion(pricingFaqs, 'pfaq')}
  </div>
</section>

${cta({
  url,
  title: 'Start on the free tier.',
  body: 'Five gigabytes a month, three hosts, no card. Move up when the bill would be worth paying.',
  primary: { href: '/northwind/demo/', label: 'Book a demo' },
  secondary: { href: '/northwind/docs/', label: 'Read the docs' },
})}
`;
}
