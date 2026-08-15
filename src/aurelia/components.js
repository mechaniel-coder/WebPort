/**
 * Aurelia page components — the pieces that repeat across more than one page.
 */
import { each, esc } from '../_lib/html.js';
import { horizon } from './art.js';

/** Breadcrumb trail. Pair with `meta.breadcrumbs` so the JSON-LD matches. */
export function crumbs(trail, url) {
  return `<nav class="crumbs" aria-label="Breadcrumb">
    <ol>
      ${each(
        trail,
        (crumb, index) =>
          `<li>${
            index === trail.length - 1
              ? `<span aria-current="page">${esc(crumb.label)}</span>`
              : `<a href="${esc(url(crumb.href))}">${esc(crumb.label)}</a>`
          }</li>`,
      )}
    </ol>
  </nav>`;
}

/** Page header used on every interior page. */
export function pageHead({ eyebrow, title, lede, trail, url }) {
  return `<section class="page-head">
    <div class="shell">
      ${trail ? crumbs(trail, url) : ''}
      <p class="eyebrow">${esc(eyebrow)}</p>
      <h1 class="display-2 page-head__title">${esc(title)}</h1>
      ${lede ? `<p class="lede page-head__lede">${esc(lede)}</p>` : ''}
    </div>
  </section>`;
}

/** Section heading with an optional link on the right. */
export function sectionHead({ eyebrow, title, link, url, id, split = true }) {
  return `<div class="section-head${split ? ' section-head--split' : ''}">
    <div>
      <p class="eyebrow">${esc(eyebrow)}</p>
      <h2 class="display-2"${id ? ` id="${esc(id)}"` : ''}>${esc(title)}</h2>
    </div>
    ${link ? `<a class="link-arrow" href="${esc(url(link.href))}">${esc(link.label)}</a>` : ''}
  </div>`;
}

/** Closing call to action, used at the foot of most pages. */
export function cta({ url, title = 'Check the calendar', body, seed = 'cta' }) {
  return `<section class="cta">
    ${horizon({ seed, palette: 'dusk', ratio: 0.4 })}
    <div class="shell cta__inner">
      <h2 class="display-2">${esc(title)}</h2>
      ${body ? `<p class="lede" style="color:#ece5d9">${esc(body)}</p>` : ''}
      <a class="button" href="${esc(url('/aurelia/book/'))}">Check availability</a>
    </div>
  </section>`;
}

/** Accessible accordion markup, upgraded by ui.js. */
export function accordion(items, idPrefix) {
  return `<div class="accordion" data-accordion>
    ${each(
      items,
      (item, index) => `<div class="accordion__item">
      <h3>
        <button class="accordion__trigger" type="button"
                id="${idPrefix}-t-${index}"
                aria-expanded="false"
                aria-controls="${idPrefix}-p-${index}"
                data-accordion-trigger>
          <span>${esc(item.question)}</span>
          <span class="accordion__icon" aria-hidden="true"></span>
        </button>
      </h3>
      <div class="accordion__panel" id="${idPrefix}-p-${index}"
           role="region" aria-labelledby="${idPrefix}-t-${index}">
        <p>${esc(item.answer)}</p>
      </div>
    </div>`,
    )}
  </div>`;
}
