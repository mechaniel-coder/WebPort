import { each, esc } from '../../_lib/html.js';
import { hotel, timeline, values } from '../data.js';
import { arch, cypressRow, horizon } from '../art.js';
import { cta, pageHead } from '../components.js';

export const meta = {
  title: 'Story',
  description: `Built into the bluff in 1974, opened more or less by accident in 1989, closed
    in 2016 and restored rather than replaced in 2019. How Aurelia got here.`,
  scripts: ['ui.js'],
  breadcrumbs: [
    { label: 'Aurelia', href: '/aurelia/' },
    { label: 'Story', href: '/aurelia/story/' },
  ],
};

export function render({ url }) {
  return `
${pageHead({
  eyebrow: 'Since 1974',
  title: 'Restored, not replaced.',
  lede: `Almost everything here is the building an architect from Berkeley put into this bluff
    fifty years ago. The 2019 work was mostly a matter of taking things off.`,
  trail: meta.breadcrumbs,
  url,
})}

<section class="section section--tight">
  <div class="shell">
    <div class="split">
      <div class="split__art split__art--arch">
        ${arch({ seed: 'story-arch', palette: 'dawn' })}
      </div>
      <div class="split__body">
        <p class="eyebrow">The building</p>
        <h2 class="display-2">Douglas fir, stone, and a great deal of glass.</h2>
        <p class="text-soft">The original compound was eleven rooms and two caretaker
          cottages, framed in fir milled twenty miles inland and faced in stone taken off the
          site. The arched windows that appear everywhere in our identity are the real
          windows — they were cut that way because a curve holds against wind better than a
          corner does.</p>
        <p class="text-soft">Thirty years of salt air did what salt air does. When the
          property closed in 2016 the framing was sound and very little else was. The
          restoration replaced what had failed, in the same fir from the same mill, which is
          somehow still running.</p>
      </div>
    </div>
  </div>
</section>

<section class="section section--paper" aria-labelledby="timeline-heading">
  <div class="shell">
    <div class="section-head">
      <div>
        <p class="eyebrow">Fifty years</p>
        <h2 class="display-2" id="timeline-heading">Four dates that matter.</h2>
      </div>
    </div>

    <ol class="timeline">
      ${each(
        timeline,
        (entry) => `<li>
        <p class="timeline__year">${esc(entry.year)}</p>
        <h3 class="timeline__title">${esc(entry.title)}</h3>
        <p>${esc(entry.text)}</p>
      </li>`,
      )}
    </ol>
  </div>
</section>

${cypressRow({ className: 'cypress-rule' })}

<section class="section" aria-labelledby="values-heading">
  <div class="shell">
    <div class="section-head">
      <div>
        <p class="eyebrow">How it is run</p>
        <h2 class="display-2" id="values-heading">Three decisions that cost money.</h2>
      </div>
    </div>

    <div class="rooms">
      ${each(
        values,
        (value) => `<div>
        <h3 class="display-3">${esc(value.title)}</h3>
        <p class="text-soft" style="margin-top:var(--space-xs)">${esc(value.text)}</p>
      </div>`,
      )}
    </div>
  </div>
</section>

<section class="section section--deep" aria-labelledby="land-heading">
  <div class="shell">
    <div class="split split--reverse">
      <div class="split__art">
        ${horizon({ seed: 'story-land', palette: 'winter', ratio: 0.75 })}
      </div>
      <div class="split__body">
        <p class="eyebrow" style="color:#8a8175">The land</p>
        <h2 class="display-2" id="land-heading">A mile of bluff, held in easement.</h2>
        <p style="color:#c9c0b1">The trail that runs north from the gate crosses a
          conservation easement rather than private ground. That arrangement predates us: the
          family who built the compound put the bluff into it in 1991, which is why there is
          nothing between here and the point and why there never will be.</p>
        <p style="color:#c9c0b1">It also means the trail is genuinely public. You will meet
          people on it who are not staying here, and that is the arrangement working
          correctly.</p>
        <p style="color:#c9c0b1">${esc(hotel.rooms)} rooms is the maximum the septic and the
          water table on this parcel will carry. It is not a scarcity strategy — it is a
          number from a 1973 engineering report that has never stopped being true.</p>
      </div>
    </div>
  </div>
</section>

${cta({
  url,
  title: 'Come and look at it.',
  seed: 'story-cta',
})}
`;
}
