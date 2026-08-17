import { each, esc } from '../../_lib/html.js';
import { customers, features, logos, product } from '../data.js';
import { cta, dashboard, sectionHead } from '../components.js';

export const meta = {
  title: 'Observability platform',
  metaTitle: `${product.name} — observability for systems that cannot go down`,
  description: `Metrics, traces and logs in one query language, priced on ingest rather than
    per seat. Ten-second resolution kept at full fidelity for the whole retention window.`,
  priority: 1.0,
  styles: ['dashboard.css'],
  scripts: ['ui.js', 'dashboard.js', 'hero.js'],
};

export function render({ url }) {
  return `
<section class="hero">
  <!-- Decoration over a CSS gradient that stands alone: if WebGL is missing the
       canvas hides itself and the gradient is what remains. aria-hidden because
       describing an abstract field of moving light to a screen-reader user
       conveys nothing they can use, and the kicker below already names what the
       product does. -->
  <canvas class="hero__surface" data-signal aria-hidden="true"></canvas>

  <div class="shell">
    <p class="kicker">Metrics · Traces · Logs</p>
    <h1 class="h1 hero__title" data-reveal="lines" data-stagger="0.07"
        style="margin-top:var(--space-xs)">
      Observability that does not roll up your data the week you need it.</h1>
    <p class="lede" data-reveal data-delay="0.3" style="margin-top:var(--space-m)">
      ${esc(product.lede)} Ten-second resolution stays ten-second resolution for the whole
      retention window — including the 87th day, which is when the incident review happens.
    </p>
    <div class="hero__actions" data-reveal data-delay="0.42">
      <a class="btn btn--lg" href="${esc(url('/northwind/demo/'))}">Book a demo</a>
      <a class="btn btn--ghost btn--lg" href="${esc(url('/northwind/docs/'))}">
        Read the docs</a>
    </div>
    <p class="hero__note" data-reveal data-delay="0.5">Free up to 5 GB a month. No card, no
      seat count, no sales call.</p>
  </div>
</section>

<section class="section--tight" aria-labelledby="demo-heading">
  <div class="shell">
    <h2 class="visually-hidden" id="demo-heading">Live dashboard demonstration</h2>
    ${dashboard({ range: '24h' })}
    <p class="hero__note" style="margin-top:var(--space-s)">
      A working dashboard running on generated data — switch the range, hover or arrow
      through the series, or open any chart's table view. Nothing here is a screenshot.
    </p>
  </div>
</section>

<section class="section--tight" aria-label="Customers">
  <div class="shell">
    <p class="kicker" style="margin-bottom:var(--space-s)">
      Trusted by ${esc(product.customers.toLocaleString('en-US'))} engineering teams</p>
    <ul class="logos">
      ${each(logos, (name) => `<li>${esc(name)}</li>`)}
    </ul>
  </div>
</section>

<section class="section section--raised" aria-labelledby="signals-heading">
  <div class="shell">
    ${sectionHead({
      kicker: 'One platform',
      title: 'Three signals, one query language.',
      body: `You stop translating between three dialects during an incident, because the same
        NWQL expression filters all of them.`,
      id: 'signals-heading',
      split: true,
      link: { href: '/northwind/platform/', label: 'How it fits together' },
      url,
    })}

    <div class="grid grid--3">
      ${each(
        features,
        (feature) => `<a class="card card--link" href="${esc(url(`/northwind/features/${feature.slug}/`))}">
        <p class="kicker">${esc(feature.kicker)}</p>
        <h3 class="card__title" style="margin-top:var(--space-2xs)">${esc(feature.name)}</h3>
        <p class="card__body">${esc(feature.summary)}</p>
        <p class="arrow-link" style="margin-top:var(--space-s)">Read more</p>
      </a>`,
      )}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="pricing-heading">
  <div class="shell">
    <div class="grid grid--2" style="align-items:center;gap:var(--space-2xl)">
      <div>
        ${sectionHead({
          kicker: 'Pricing',
          title: 'Billed on bytes, not on people.',
          id: 'pricing-heading',
        })}
        <p class="lede">Charging per seat pushes teams to share logins, which is the
          opposite of what a security team wants. Every plan includes unlimited users,
          dashboards and alerts.</p>
        <ul class="checks" style="margin-top:var(--space-m)">
          <li>Ingest measured in compressed bytes, so one unit covers all three signals</li>
          <li>Overage billed at the plan rate, or hard-capped if you prefer a ceiling</li>
          <li>Twenty percent off for annual, including the overage rates</li>
        </ul>
        <a class="btn" style="margin-top:var(--space-l)"
           href="${esc(url('/northwind/pricing/'))}">Work out your bill</a>
      </div>

      <div class="card">
        <p class="kicker">Typical</p>
        <p style="font-size:var(--step-4);font-weight:660;letter-spacing:-0.035em;line-height:1;
                  margin-top:var(--space-2xs)">$233<span
          style="font-size:var(--step-0);color:var(--text-muted);font-weight:400">/month</span></p>
        <p class="card__body">A fifteen-engineer team on the Team plan: 130 GB of ingest,
          22 hosts, 30-day retention.</p>
        <hr style="border:0;border-top:1px solid var(--border);margin-block:var(--space-s)">
        <p class="card__body">The same configuration on a per-host vendor at $23 a host
          runs about $506 before a single byte of log storage.</p>
      </div>
    </div>
  </div>
</section>

<section class="section section--raised" aria-labelledby="proof-heading">
  <div class="shell">
    ${sectionHead({
      kicker: 'Customers',
      title: 'What changed after the migration.',
      id: 'proof-heading',
      split: true,
      link: { href: '/northwind/customers/', label: 'All case studies' },
      url,
    })}

    <div class="grid grid--2">
      ${each(
        customers,
        (customer) => `<a class="card card--link"
        href="${esc(url(`/northwind/customers/${customer.slug}/`))}">
        <p class="kicker">${esc(customer.sector)}</p>
        <h3 class="card__title" style="margin-top:var(--space-2xs)">${esc(customer.name)}</h3>
        <p class="card__body">${esc(customer.summary)}</p>
        <ul class="metrics" style="margin-top:var(--space-m)">
          ${each(
            customer.metrics,
            (metric) => `<li>
            <p class="metrics__value" style="font-size:var(--step-2)">${esc(metric.value)}</p>
            <p class="metrics__label">${esc(metric.label)}</p>
          </li>`,
          )}
        </ul>
      </a>`,
      )}
    </div>
  </div>
</section>

${cta({
  url,
  title: 'Point a collector at it and see.',
  body: 'Five gigabytes a month free, forever. The collector config is eleven lines.',
  primary: { href: '/northwind/demo/', label: 'Book a demo' },
  secondary: { href: '/northwind/docs/', label: 'Read the quickstart' },
})}
`;
}
