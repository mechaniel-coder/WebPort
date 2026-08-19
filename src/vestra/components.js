import { each, esc, url } from '../_lib/html.js';
import { cloths, colourways, garmentBySlug, money, stockFor } from './assets/data.js';
import { swatch } from './assets/textile.js';
import { sizeLabel } from './assets/fit.js';

export function crumbs(trail, u = url) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>
    ${each(
      trail,
      (crumb, i) =>
        `<li>${
          i === trail.length - 1
            ? `<span aria-current="page">${esc(crumb.label)}</span>`
            : `<a href="${esc(u(crumb.href))}">${esc(crumb.label)}</a>`
        }</li>`,
    )}
  </ol></nav>`;
}

/**
 * `label` follows the heading and is optional. A pattern room's dockets carry
 * the cloth, the weave, the piece count — facts. They do not carry a word that
 * repeats the heading immediately under them.
 */
export function sectionHead({ label, title, link, id, u = url }) {
  return `<div class="section-head">
    <div>
      <h2 class="h2"${id ? ` id="${esc(id)}"` : ''} data-reveal="lines" data-stagger="0.06">
        ${esc(title)}</h2>
      ${label ? `<p class="label">${esc(label)}</p>` : ''}
    </div>
    ${link ? `<a class="link-arrow" href="${esc(u(link.href))}">${esc(link.label)}</a>` : ''}
  </div>`;
}

/** A garment card: the cloth it is cut from, its name, cut and price. */
export function garmentCard(garment, u = url) {
  const cloth = cloths[garment.cloth];
  return `<li class="card">
    <a class="card__link" href="${esc(u(`/vestra/shop/${garment.slug}/`))}">
      <span class="card__cloth">${swatch({ cloth, scale: 0.5 })}</span>
      <span class="card__body">
        <span class="card__name">${esc(garment.name)}</span>
        <span class="card__meta">${esc(cloth.name)} · ${esc(garment.cut)}</span>
        <span class="card__price figure">${esc(money(garment.price))}</span>
      </span>
    </a>
  </li>`;
}

export function garmentGrid(list, u = url) {
  return `<ul class="cards" data-reveal data-stagger="0.07">
    ${list.map((g) => garmentCard(g, u)).join('')}
  </ul>`;
}

/**
 * The size grade, as a table.
 *
 * Rendered at build time from the same chart the fit finder scores against, so
 * the numbers a search engine indexes and the numbers behind a recommendation
 * are the same numbers.
 */
export function sizeTable(garment, system = 'UK') {
  const sizes = Object.keys(garment.sizes);
  const points = Object.keys(garment.sizes[sizes[0]]);

  return `<table class="grade figure">
    <caption>Garment measurements in centimetres. Body measurements are on the
      <a href="${esc(url('/vestra/fit/'))}">fit page</a>.</caption>
    <thead>
      <tr>
        <th scope="col">Size</th>
        ${each(points, (p) => `<th scope="col">${esc(p[0].toUpperCase() + p.slice(1))}</th>`)}
      </tr>
    </thead>
    <tbody>
      ${each(
        sizes,
        (size) => `<tr>
        <th scope="row">${esc(sizeLabel(size, system))} <span class="grade__alt">${esc(
          size.toUpperCase(),
        )}</span></th>
        ${each(points, (p) => `<td>${garment.sizes[size][p]}</td>`)}
      </tr>`,
      )}
    </tbody>
  </table>`;
}

/** Colour chips for a garment, as real cloth in that colourway. */
export function colourChips(garment) {
  const cloth = cloths[garment.cloth];
  return each(garment.colours, (key, i) => {
    const colour = colourways[key];
    return `<label class="chip">
      <input type="radio" name="colour" value="${esc(key)}"${i === 0 ? ' checked' : ''}
             data-colour>
      <span class="chip__face" style="--chip:${esc(colour.hex)}"></span>
      <span class="chip__name">${esc(colour.name)}</span>
    </label>`;
  });
}

/** Size buttons, with per-size stock. Sold-out sizes stay visible and disabled. */
export function sizeChoices(garment, colour) {
  const stock = stockFor(garment.slug, colour);
  return each(Object.keys(garment.sizes), (size) => {
    const left = stock[size];
    return `<label class="size${left === 0 ? ' size--out' : ''}">
      <input type="radio" name="size" value="${esc(size)}" data-size
             ${left === 0 ? 'disabled' : ''}>
      <span>${esc(sizeLabel(size, 'UK'))}</span>
      ${left === 0 ? '<span class="size__note">Sold out</span>' : ''}
      ${left > 0 && left <= 2 ? `<span class="size__note">${left} left</span>` : ''}
    </label>`;
  });
}

export function cta({ title, body, href, label, u = url }) {
  return `<section class="section section--ink">
    <div class="shell cta">
      <div>
        <h2 class="h2" data-reveal="lines" data-stagger="0.06">${esc(title)}</h2>
        <p class="lede" data-reveal data-delay="0.2" style="margin-top:var(--s-s)">${esc(body)}</p>
      </div>
      <a class="btn btn--ghost" href="${esc(u(href))}"
         style="border-color:currentColor;color:inherit">${esc(label)}</a>
    </div>
  </section>`;
}

export { garmentBySlug };
