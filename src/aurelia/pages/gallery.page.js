import { each, esc } from '../../_lib/html.js';
import { arch, horizon, vignette } from '../art.js';
import { cta, pageHead } from '../components.js';

export const meta = {
  title: 'Gallery',
  description: `The property through the year — the bluff, the courtyard, the cypress
    windbreak and the light this coast gets in the middle of winter.`,
  scripts: ['ui.js'],
  breadcrumbs: [
    { label: 'Aurelia', href: '/aurelia/' },
    { label: 'Gallery', href: '/aurelia/gallery/' },
  ],
};

/**
 * Each frame is an original generated composition rather than a photograph, and
 * the captions describe the place rather than pretending otherwise.
 */
const frames = [
  { seed: 'g-bluff', palette: 'dawn', caption: 'The bluff at first light, looking south', size: 'is-wide' },
  { seed: 'g-court', palette: 'garden', caption: 'Cypress courtyard' },
  { seed: 'g-terrace', palette: 'dusk', caption: 'Dune Suite terrace, evening' },
  { seed: 'g-reef', palette: 'fog', caption: 'The reef at a minus tide', size: 'is-tall', kind: 'arch' },
  { seed: 'g-point', palette: 'noon', caption: 'The point, four miles north' },
  { seed: 'g-winter', palette: 'winter', caption: 'February, the clearest month' },
  { seed: 'g-kitchen', palette: 'dusk', caption: 'Salt & Ember before service', size: 'is-wide' },
  { seed: 'g-sauna', palette: 'garden', caption: 'Cedar sauna and plunge', kind: 'vignette', motif: 'steam' },
  { seed: 'g-trail', palette: 'noon', caption: 'Bluff trail, the first half mile' },
  { seed: 'g-oyster', palette: 'fog', caption: 'The bay the oysters come from' },
  { seed: 'g-arch', palette: 'dawn', caption: 'Original 1974 window, west wing', kind: 'arch', size: 'is-tall' },
  { seed: 'g-storm', palette: 'winter', caption: 'A December storm arriving' },
];

export function render({ url }) {
  return `
${pageHead({
  title: 'The property, through the year.',
  lede: `Twelve views of a mile of bluff. The light here changes more than the buildings do,
    which is why most of these are really pictures of weather.`,
  trail: meta.breadcrumbs,
  url,
})}

<section class="section">
  <div class="shell">
    <div class="gallery">
      ${each(
        frames,
        (frame) => `<figure class="${esc(frame.size || '')}">
        <div class="gallery__frame">
          ${art(frame)}
        </div>
        <figcaption>${esc(frame.caption)}</figcaption>
      </figure>`,
      )}
    </div>

    <p class="text-soft" style="margin-top:var(--space-xl);max-width:52rem;font-size:var(--step--1)">
      Every image on this site is original generated artwork rather than photography — the
      compositions are built from the same coastal vocabulary as the rest of the design, and
      no stock library or third-party licence is involved.
    </p>
  </div>
</section>

${cta({
  url,
  title: 'It is better in person.',
  body: 'Particularly in the second week of January, when nobody believes us.',
  seed: 'gallery-cta',
})}
`;
}

function art(frame) {
  const title = `${frame.caption} — original illustration`;
  if (frame.kind === 'arch') return arch({ seed: frame.seed, palette: frame.palette, title });
  if (frame.kind === 'vignette') {
    return vignette({ seed: frame.seed, palette: frame.palette, motif: frame.motif, title });
  }
  return horizon({ seed: frame.seed, palette: frame.palette, ratio: 1, title });
}
