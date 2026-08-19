import { each, esc } from '../../_lib/html.js';
import { faqs } from '../data.js';
import { faqPage } from '../../_lib/seo.js';
import { studio } from '../../../site.config.js';

export const meta = {
  title: 'Contact',
  description: `Start a project with ${studio.name}. Tell us what the site has to do and we
    will tell you what it would take — including if the answer is that you do not need us.`,
  priority: 0.8,
  scripts: ['ui.js'],
  jsonld: faqPage(faqs),
};

export function render({ url }) {
  return `
<section class="hero">
  <div class="shell">
    <p class="section__label">Contact</p>
    <h1 class="hero__title" style="font-size:var(--step-4);max-width:16ch">
      Tell us what it has to do.</h1>
    <p class="hero__lede">
      Not what it should look like — that is our problem. What the site has to accomplish,
      who has to be able to use it, and when it needs to exist.
    </p>
  </div>
</section>

<section class="section">
  <div class="shell case-grid">
    <h2 class="case-grid__label" id="enquiry-heading">Enquiry</h2>

    <div>
      <form class="form-grid form-grid--2" data-validate novalidate
            aria-labelledby="enquiry-heading">
        <div class="field">
          <label class="field__label" for="h-name">Name</label>
          <input id="h-name" name="name" type="text" required data-label="Name"
                 autocomplete="name">
          <p class="field__error" aria-live="polite"></p>
        </div>

        <div class="field">
          <label class="field__label" for="h-email">Email</label>
          <input id="h-email" name="email" type="email" required data-label="Email"
                 autocomplete="email"
               spellcheck="false" autocapitalize="off">
          <p class="field__error" aria-live="polite"></p>
        </div>

        <div class="field">
          <label class="field__label" for="h-company">Company</label>
          <input id="h-company" name="company" type="text" data-label="Company"
                 autocomplete="organization">
          <p class="field__error" aria-live="polite"></p>
        </div>

        <div class="field">
          <label class="field__label" for="h-budget">Budget</label>
          <select id="h-budget" name="budget">
            <option>Not sure yet</option>
            <option>Under $15,000</option>
            <option selected>$15,000 – $40,000</option>
            <option>$40,000 – $80,000</option>
            <option>Over $80,000</option>
          </select>
          <p class="field__error" aria-live="polite"></p>
        </div>

        <div class="field span-2">
          <label class="field__label" for="h-project">What are you building?</label>
          <textarea id="h-project" name="project" required minlength="20"
                    data-label="Project description"></textarea>
          <p class="field__hint">
            What the site has to do, who it is for, and anything that has already been decided.
          </p>
          <p class="field__error" aria-live="polite"></p>
        </div>

        <div class="span-2">
          <p class="form-status" data-form-status role="status"></p>
        </div>

        <div class="span-2">
          <button class="button" type="submit">Send enquiry</button>
          <p class="field__hint" style="margin-top:var(--space-xs)">
            This is a portfolio site with no backend — the form validates and stops, and
            nothing is transmitted or stored anywhere.
          </p>
        </div>
      </form>

      <div style="margin-top:var(--space-xl);padding-top:var(--space-m);
                  border-top:1px solid var(--rule)">
        <p class="section__label">Or directly</p>
        <p><a href="mailto:${esc(studio.email)}">${esc(studio.email)}</a></p>
        <p class="text-muted" style="margin-top:var(--space-2xs)">
          ${esc(studio.location)} · replies within one working day
        </p>
        <ul style="display:flex;flex-wrap:wrap;gap:var(--space-m);list-style:none;
                   padding:0;margin-top:var(--space-s);font-size:var(--step--1)">
          ${each(
            studio.social,
            (item) => `<li><a href="${esc(item.href)}" rel="me noopener">${esc(item.label)}</a></li>`,
          )}
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="section section--tight" aria-labelledby="faq-heading">
  <div class="shell case-grid">
    <h2 class="case-grid__label" id="faq-heading">Questions</h2>
    <div class="accordion" data-accordion style="max-width:64ch">
      ${each(
        faqs,
        (item, index) => `<div class="accordion__item">
        <h3>
          <button class="accordion__trigger" type="button" id="hfaq-t-${index}"
                  aria-expanded="false" aria-controls="hfaq-p-${index}"
                  data-accordion-trigger>
            <span>${esc(item.question)}</span>
            <span class="accordion__icon" aria-hidden="true"></span>
          </button>
        </h3>
        <div class="accordion__panel" id="hfaq-p-${index}" role="region"
             aria-labelledby="hfaq-t-${index}">
          <p>${esc(item.answer)}</p>
        </div>
      </div>`,
      )}
    </div>
  </div>
</section>
`;
}
