import { each, esc } from '../../_lib/html.js';
import { brand, materialNotes, materials, products } from '../data.js';
import { productArt } from '../assets/render.js';
import { cta, label, pageHead } from '../components.js';

export const meta = {
  title: 'Materials',
  description: `Aluminium, oak, glass, stoneware and steel — why each one was chosen, and
    what it will look like in ten years rather than on the day it arrives.`,
  styles: ['shop.css'],
  scripts: ['ui.js', 'cart.js'],
  breadcrumbs: [
    { label: 'Forma', href: '/forma/' },
    { label: 'Materials', href: '/forma/materials/' },
  ],
};

export function render({ url }) {
  return `
${pageHead({
  tag: `${materialNotes.length} materials`,
  title: 'Chosen for how they age.',
  lede: `Nothing here is finished to look new forever. Oak darkens, steel patinas at the
    edges, and the aluminium picks up a satin from being handled. That is the intention.`,
  trail: meta.breadcrumbs,
  url,
})}

<section class="section section--tight">
  <div class="shell">
    <ul class="rows" style="margin:0">
      ${each(materialNotes, (note) => {
        const material = materials.find((entry) => entry.label.startsWith(note.name.slice(0, 5)));
        const made = material
          ? products.filter((product) => product.material === material.id)
          : [];
        return `<li>
        <span class="rows__key">${esc(note.name)}</span>
        <span class="rows__value">
          ${esc(note.text)}
          ${
            made.length
              ? `<br><span class="tag" style="display:inline-block;margin-top:var(--space-2xs)">
                  Used in ${each(made, (product) => esc(product.name)).split('\n').join(', ')}
                </span>`
              : ''
          }
        </span>
      </li>`;
      })}
    </ul>
  </div>
</section>

<section class="section section--fill section--ruled" aria-labelledby="drawn-heading">
  <div class="shell">
    <div style="max-width:60ch;margin-bottom:var(--space-l)">
      <h2 class="h2" id="drawn-heading" style="margin-top:var(--space-2xs)">
        Everything here is drawn, not photographed.</h2>
      <p class="lede" style="margin-top:var(--space-s)">
        Every object on this site is generated vector artwork built from flat geometry and
        two tones. Choosing a finish genuinely re-draws the object rather than tinting a
        photograph — which is why the swatches are honest about what the shape does, and
        vague about what the surface feels like.
      </p>
    </div>

    <ul style="display:grid;gap:2px;background:var(--rule);border:2px solid var(--rule);
               grid-template-columns:repeat(auto-fit,minmax(9rem,1fr));list-style:none;
               padding:0;margin:0">
      ${each(
        ['chalk', 'ochre', 'ink', 'moss', 'rust', 'brass'],
        (finish) => `<li style="background:var(--paper);padding:var(--space-s);display:grid;
          gap:var(--space-2xs);justify-items:center">
        ${productArt({
          shape: 'vase',
          finish,
          title: `Prism Vase drawn in the ${finish} finish`,
        })}
        <span class="tag">${esc(finish)}</span>
      </li>`,
      )}
    </ul>
  </div>
</section>

<section class="section" aria-labelledby="makers-heading">
  <div class="shell">
    <div class="prose">
      <h2 class="h2" id="makers-heading" style="color:var(--ink);margin-top:var(--space-2xs)">
        Five workshops, all of which we have stood in.</h2>
      <p>The aluminium is spun in Rhode Island by a shop that has been doing it since the
        sixties and mostly makes parts for the marine industry. The glass comes from a family
        works outside Prague, running since 1946. The oak is turned in Bavaria, the stoneware
        thrown in Stoke, and the steel bent forty minutes from the Brooklyn studio.</p>
      <p>We visit all five at least once a year, which is a slower and more expensive way to
        run a supply chain than the alternative, and the reason production runs are 200 pieces
        rather than 2,000.</p>
      <p><strong>${esc(brand.name)} is a fictional brand.</strong> These workshops do not
        exist — the copy is written to demonstrate how a real maker's site would carry this
        kind of detail.</p>
    </div>
  </div>
</section>

${cta({
  url,
  title: 'See how it is made up close.',
  primary: { href: '/forma/shop/', label: 'Shop the range' },
  secondary: { href: '/forma/care/', label: 'Care instructions' },
})}
`;
}
