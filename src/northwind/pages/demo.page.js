import { esc } from '../../_lib/html.js';
import { product } from '../data.js';
import { pageHead } from '../components.js';

export const meta = {
  title: 'Book a demo',
  description: `A demo is a working account with your own collector pointed at it, not a
    slide deck. Thirty minutes, a solutions engineer, and your actual telemetry.`,
  scripts: ['ui.js'],
  breadcrumbs: [
    { label: 'Northwind', href: '/northwind/' },
    { label: 'Book a demo', href: '/northwind/demo/' },
  ],
};

export function render({ url }) {
  return `
${pageHead({
  title: 'Thirty minutes, your own data.',
  lede: `We give you a working account and help you point a collector at it. If it does not
    tell you something useful about your system inside the call, we have wasted your time
    rather than earned it.`,
  trail: meta.breadcrumbs,
  url,
})}

<section class="section section--tight">
  <div class="shell">
    <div class="grid grid--2" style="gap:var(--space-2xl);align-items:start">
      <form class="form-grid form-grid--2" data-validate novalidate>
        <div class="field">
          <label class="field__label" for="d-name">Name</label>
          <input id="d-name" name="name" type="text" required data-label="Name"
                 autocomplete="name">
          <p class="field__error" aria-live="polite"></p>
        </div>

        <div class="field">
          <label class="field__label" for="d-email">Work email</label>
          <input id="d-email" name="email" type="email" required data-label="Work email"
                 autocomplete="email"
               spellcheck="false" autocapitalize="off">
          <p class="field__error" aria-live="polite"></p>
        </div>

        <div class="field">
          <label class="field__label" for="d-company">Company</label>
          <input id="d-company" name="company" type="text" required data-label="Company"
                 autocomplete="organization">
          <p class="field__error" aria-live="polite"></p>
        </div>

        <div class="field">
          <label class="field__label" for="d-size">Engineers</label>
          <select id="d-size" name="size">
            <option>1–10</option>
            <option selected>11–50</option>
            <option>51–200</option>
            <option>201–1,000</option>
            <option>More than 1,000</option>
          </select>
          <p class="field__error" aria-live="polite"></p>
        </div>

        <div class="field span-2">
          <label class="field__label" for="d-stack">What are you running today?</label>
          <input id="d-stack" name="stack" type="text" data-label="Current stack"
                 placeholder="Prometheus + Grafana, Datadog, homegrown ELK…">
          <p class="field__error" aria-live="polite"></p>
        </div>

        <div class="field span-2">
          <label class="field__label" for="d-notes">What would make this worth your time?</label>
          <textarea id="d-notes" name="notes" data-label="Notes"></textarea>
          <p class="field__hint">Bill you are trying to cut, audit you are trying to pass,
            incident you could not debug — anything specific helps.</p>
          <p class="field__error" aria-live="polite"></p>
        </div>

        <div class="span-2">
          <p class="form-status" data-form-status role="status"></p>
        </div>

        <div class="span-2">
          <button class="btn btn--lg" type="submit">Request a demo</button>
          <p class="field__hint" style="margin-top:var(--space-xs)">
            This is a demonstration site. Nothing is transmitted, stored or sent anywhere.
          </p>
        </div>
      </form>

      <aside>
        <div class="card">
          <h2 class="card__title">What happens next</h2>
          <ol class="checks" style="margin-top:var(--space-s)">
            <li>A solutions engineer replies within one business day with times</li>
            <li>We send an account and an API key before the call, so setup is not the call</li>
            <li>Thirty minutes on your telemetry, not our sample data</li>
            <li>A written summary of what we found, whether or not you buy anything</li>
          </ol>
        </div>

        <div class="card" style="margin-top:var(--space-m)">
          <h2 class="card__title">Would rather just try it?</h2>
          <p class="card__body">The free tier needs no card and no conversation. Five
            gigabytes a month, three hosts, seven-day retention.</p>
          <a class="btn btn--ghost" style="margin-top:var(--space-s)"
             href="${esc(url('/northwind/docs/'))}">Read the quickstart</a>
        </div>

        <div class="card" style="margin-top:var(--space-m)">
          <h2 class="card__title">Security review first?</h2>
          <p class="card__body">Send the questionnaire to
            <a href="mailto:${esc(product.email)}">${esc(product.email)}</a> and we will
            answer it before booking anything.</p>
          <a class="arrow-link" style="margin-top:var(--space-s)"
             href="${esc(url('/northwind/security/'))}">Security and compliance</a>
        </div>
      </aside>
    </div>
  </div>
</section>
`;
}
