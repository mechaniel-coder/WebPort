import { esc } from '../../_lib/html.js';
import { faqs, hotel } from '../data.js';
import { faqPage } from '../../_lib/seo.js';
import { horizon } from '../art.js';
import { accordion, pageHead } from '../components.js';

export const meta = {
  title: 'Contact',
  description: `How to reach Aurelia, how to get here from San Francisco or Santa Rosa, and
    answers to the questions we are asked most often before a first visit.`,
  scripts: ['ui.js'],
  breadcrumbs: [
    { label: 'Aurelia', href: '/aurelia/' },
    { label: 'Contact', href: '/aurelia/contact/' },
  ],
  jsonld: faqPage(faqs),
};

export function render({ url }) {
  return `
${pageHead({
  eyebrow: 'Contact',
  title: 'Ask us anything first.',
  lede: `The phone is answered by someone standing in the courtyard, not a call centre. If a
    date is not showing online, it is worth asking — we hold rooms back for repairs.`,
  trail: meta.breadcrumbs,
  url,
})}

<section class="section section--tight">
  <div class="shell">
    <div class="split">
      <div class="split__body">
        <h2 class="display-3">Send a note</h2>
        <p class="text-soft">We answer everything within a day, usually the same morning.</p>

        <form class="form-grid form-grid--2" data-validate novalidate
              style="margin-top:var(--space-m)">
          <div class="field">
            <label class="field__label" for="c-name">Name</label>
            <input id="c-name" name="name" type="text" required data-label="Name"
                   autocomplete="name">
            <p class="field__error" aria-live="polite"></p>
          </div>

          <div class="field">
            <label class="field__label" for="c-email">Email</label>
            <input id="c-email" name="email" type="email" required data-label="Email"
                   autocomplete="email"
               spellcheck="false" autocapitalize="off">
            <p class="field__error" aria-live="polite"></p>
          </div>

          <div class="field">
            <label class="field__label" for="c-arrival">Approximate arrival</label>
            <input id="c-arrival" name="arrival" type="date" data-label="Arrival date">
            <p class="field__error" aria-live="polite"></p>
          </div>

          <div class="field">
            <label class="field__label" for="c-guests">Guests</label>
            <input id="c-guests" name="guests" type="number" min="1" max="5" value="2"
                   data-label="Number of guests">
            <p class="field__error" aria-live="polite"></p>
          </div>

          <div class="field span-2">
            <label class="field__label" for="c-message">Message</label>
            <textarea id="c-message" name="message" required minlength="10"
                      data-label="Message"></textarea>
            <p class="field__hint">Dietary requirements, accessibility needs, dogs, anything.</p>
            <p class="field__error" aria-live="polite"></p>
          </div>

          <div class="span-2">
            <p class="form-status" data-form-status role="status"></p>
          </div>

          <div class="span-2">
            <button class="button" type="submit">Send enquiry</button>
            <p class="field__hint" style="margin-top:var(--space-xs)">
              This is a demonstration site — nothing is transmitted or stored.
            </p>
          </div>
        </form>
      </div>

      <div class="split__body">
        <h2 class="display-3">Find us</h2>
        <div class="split__art" style="aspect-ratio:16/10;margin-block:var(--space-s)">
          ${horizon({ seed: 'contact-map', palette: 'noon', ratio: 0.625 })}
        </div>

        <address class="text-soft">
          <strong>${esc(hotel.legalName)}</strong><br>
          ${esc(hotel.address.street)}<br>
          ${esc(hotel.address.locality)}, ${esc(hotel.address.region)}
          ${esc(hotel.address.postalCode)}<br><br>
          <a href="tel:${esc(hotel.phone.replace(/[^+\d]/g, ''))}">${esc(hotel.phone)}</a><br>
          <a href="mailto:${esc(hotel.email)}">${esc(hotel.email)}</a>
        </address>

        <h3 class="display-3" style="margin-top:var(--space-l);font-size:var(--step-1)">
          Getting here</h3>
        <ul class="feature-list" style="margin-top:var(--space-s)">
          <li><strong>From San Francisco</strong> — 2 hr 30 min via Highway 1, or 2 hr 45 min
            the inland way through Santa Rosa, which is faster in fog.</li>
          <li><strong>From Santa Rosa</strong> — 90 minutes west on 116 and north on 1.</li>
          <li><strong>The last 40 minutes have no cell service.</strong> Download the route
            before you leave Jenner.</li>
          <li><strong>Parking</strong> is free and on site. There are two EV chargers.</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="section section--paper" aria-labelledby="faq-heading">
  <div class="shell shell--narrow">
    <div class="section-head">
      <div>
        <p class="eyebrow">Before you book</p>
        <h2 class="display-2" id="faq-heading">Questions we get.</h2>
      </div>
    </div>
    ${accordion(faqs, 'faq')}
  </div>
</section>
`;
}
