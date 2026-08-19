import { each, esc } from '../../_lib/html.js';
import { brand, garments } from '../assets/data.js';
import { POINTS, SIZE_SYSTEMS, sizeLabel } from '../assets/fit.js';
import { crumbs } from '../components.js';

export const meta = {
  title: 'Find your size',
  metaTitle: `Find your size — ${brand.name}`,
  description: `Enter four measurements and see which size each garment was cut for you
    in, with the ease at every point and an honest answer when you are between sizes.`,
  styles: ['fit.css'],
  scripts: ['ui.js', 'bag-count.js', 'fit-finder.js'],
  breadcrumbs: [
    { label: brand.name, href: '/vestra/' },
    { label: 'Find your size', href: '/vestra/fit/' },
  ],
};

const FIELDS = ['bust', 'waist', 'hip', 'inseam'];

export function render({ url }) {
  return `
<section class="page-head">
  <div class="shell">
    ${crumbs(meta.breadcrumbs, url)}
    <p class="label">Fit</p>
    <h1 class="h1" data-reveal="lines" data-stagger="0.07"
        style="margin-top:var(--s-2xs)">Which size, and why.</h1>
    <p class="lede" data-reveal data-delay="0.28" style="margin-top:var(--s-m)">
      Most size charts publish the body they imagine and leave you to guess the rest.
      This one works the other way round: it holds the finished measurements of every
      garment, and the gap each cut is designed to leave over you.
    </p>
  </div>
</section>

<section class="section section--tight">
  <div class="shell fit">

    <form class="fit__form" data-fit-form>
      <fieldset>
        <legend class="label" style="margin-bottom:var(--s-s)">Your measurements</legend>

        <div class="fit__units" role="group" aria-label="Units">
          ${each(
            [
              ['cm', 'Centimetres'],
              ['in', 'Inches'],
            ],
            ([value, label], i) => `<label class="unit">
            <input type="radio" name="unit" value="${esc(value)}"${i === 0 ? ' checked' : ''}
                   data-unit>
            <span>${esc(label)}</span>
          </label>`,
          )}
        </div>

        ${each(
          FIELDS,
          (key) => `<div class="field">
          <label for="m-${esc(key)}">${esc(POINTS[key].label)}</label>
          <div class="field__input">
            <input type="number" id="m-${esc(key)}" name="${esc(key)}" data-measure="${esc(key)}"
                   inputmode="decimal" step="0.5" min="20" max="220"
                   aria-describedby="h-${esc(key)}">
            <span class="field__unit" data-unit-label>cm</span>
          </div>
          <p class="field__help" id="h-${esc(key)}">${esc(POINTS[key].help)}</p>
        </div>`,
        )}

        <div class="field">
          <label for="m-system">Show sizes as</label>
          <select id="m-system" data-system>
            ${each(
              SIZE_SYSTEMS,
              (s, i) => `<option value="${esc(s)}"${i === 0 ? ' selected' : ''}>${esc(s)}</option>`,
            )}
          </select>
        </div>

        <p class="fit__privacy">
          Nothing here is sent anywhere. The calculation runs in this page, and the
          numbers are gone when you close the tab.
        </p>
      </fieldset>
    </form>

    <div class="fit__results">
      <!-- The no-JavaScript state is not an apology: it is the full grade for
           every garment, which is more than most sites publish at all. -->
      <div class="fit__empty" data-fit-empty>
        <p class="h3">Add a measurement to begin.</p>
        <p class="muted" style="margin-top:var(--s-2xs);max-width:44ch">
          One is enough to start. The more you give, the more of the garment the
          recommendation accounts for — a shirt is judged on bust, waist and shoulder,
          a trouser on waist, hip and inseam.
        </p>
      </div>

      <ul class="fit__list" data-fit-list hidden></ul>
    </div>
  </div>
</section>

<section class="section section--fill" aria-labelledby="ease-heading">
  <div class="shell shell--narrow">
    <p class="label">The idea</p>
    <h2 class="h2" id="ease-heading" data-reveal="lines" data-stagger="0.06"
        style="margin-top:var(--s-2xs)">Why you are not one size.</h2>
    <div class="prose muted measure" style="margin-top:var(--s-m)">
      <p>The number that matters is not your measurement or the garment's. It is the
        gap between them, and that gap — <em>ease</em> — is a design decision, not a
        tolerance.</p>
      <p>The Sculpted Wool Coat carries 24 cm of ease at the bust because it was drawn
        to be worn over things. The Merino Rib Top carries <strong>minus 6</strong>: it
        is knitted smaller than the body and stretches to meet it. Same person, same
        tape, four sizes apart.</p>
      <p>So "I am a medium" cannot be a fact about a person. It is a fact about a
        person <em>and</em> a garment, which is why this page asks about both.</p>
    </div>

    <table class="grade figure" style="margin-top:var(--s-l)">
      <caption>Ease at the bust, by cut — the gap each garment leaves over the body.</caption>
      <thead>
        <tr><th scope="col">Garment</th><th scope="col">Cut</th><th scope="col">Ease</th></tr>
      </thead>
      <tbody>
        ${each(
          garments.filter((g) => typeof g.ease.bust === 'number'),
          (g) => `<tr>
          <th scope="row"><a href="${esc(url(`/vestra/shop/${g.slug}/`))}">${esc(g.name)}</a></th>
          <td>${esc(g.cut)}</td>
          <td>${g.ease.bust > 0 ? '+' : ''}${g.ease.bust} cm</td>
        </tr>`,
        )}
      </tbody>
    </table>
  </div>
</section>

<section class="section" aria-labelledby="grade-heading">
  <div class="shell">
    <p class="label">Every grade</p>
    <h2 class="h2" id="grade-heading" style="margin-top:var(--s-2xs)">
      Published in full.</h2>
    <p class="muted" style="margin-top:var(--s-s);max-width:52ch">
      Garment measurements, flat, in centimetres. These are the same figures the
      recommendation above is computed from — there is no second set.
    </p>

    <div class="grade-scroll" tabindex="0" role="region" aria-label="Size grades, scrollable">
      <table class="grade figure" style="margin-top:var(--s-m)">
        <thead>
          <tr>
            <th scope="col">Garment</th>
            ${each(
              ['xs', 's', 'm', 'l', 'xl', 'xxl'],
              (s) => `<th scope="col">${esc(sizeLabel(s, 'UK'))}</th>`,
            )}
          </tr>
        </thead>
        <tbody>
          ${each(
            garments,
            (g) => `<tr>
            <th scope="row">
              <a href="${esc(url(`/vestra/shop/${g.slug}/`))}">${esc(g.name)}</a>
              <span class="grade__alt">${esc(
                Object.keys(g.sizes.xs)[0],
              )}, cm</span>
            </th>
            ${each(
              ['xs', 's', 'm', 'l', 'xl', 'xxl'],
              (s) => `<td>${g.sizes[s][Object.keys(g.sizes.xs)[0]]}</td>`,
            )}
          </tr>`,
          )}
        </tbody>
      </table>
    </div>
  </div>
</section>
`;
}
