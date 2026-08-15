import { each, esc } from '../../_lib/html.js';
import { experiences } from '../data.js';
import { EXPERIENCE_ART, cypressRow, vignette } from '../art.js';
import { money } from '../assets/rates.js';
import { cta, pageHead } from '../components.js';

export const meta = {
  title: 'Experiences',
  description: `Tide-pool walks, kelp forest paddles, cellar tastings, bread mornings and a
    cedar sauna. Everything at Aurelia is led by someone who lives on this stretch of coast.`,
  scripts: ['ui.js'],
  breadcrumbs: [
    { label: 'Aurelia', href: '/aurelia/' },
    { label: 'Experiences', href: '/aurelia/experiences/' },
  ],
};

export function render({ url }) {
  const included = experiences.filter((item) => item.price === 0);
  const booked = experiences.filter((item) => item.price > 0);

  return `
${pageHead({
  eyebrow: 'Experiences',
  title: 'Led by people who live here.',
  lede: `Nothing on this list is run by a contractor from town. Ren has counted the sea stars
    on our reef for eleven years; the bread morning is taught by the person who bakes it.`,
  trail: meta.breadcrumbs,
  url,
})}

<section class="section" aria-labelledby="booked-heading">
  <div class="shell">
    <div class="section-head">
      <div>
        <p class="eyebrow">Book ahead</p>
        <h2 class="display-2" id="booked-heading">Add to a stay.</h2>
      </div>
    </div>

    <ul class="experiences">
      ${each(booked, (item) => card(item))}
    </ul>
  </div>
</section>

${cypressRow({ className: 'cypress-rule' })}

<section class="section section--paper" aria-labelledby="included-heading">
  <div class="shell">
    <div class="section-head">
      <div>
        <p class="eyebrow">No charge</p>
        <h2 class="display-2" id="included-heading">Included with every room.</h2>
      </div>
    </div>

    <ul class="experiences">
      ${each(included, (item) => card(item))}
    </ul>
  </div>
</section>

<section class="section" aria-labelledby="tides-heading">
  <div class="shell">
    <div class="split">
      <div class="split__body">
        <p class="eyebrow">Practical</p>
        <h2 class="display-2" id="tides-heading">Everything here runs on the tide.</h2>
        <p class="text-soft">The reef walk and the paddle are scheduled against the tide
          table rather than the clock, which means the time changes every day and sometimes
          lands at six in the morning. We publish the following week's times on the Friday
          before, and you can move a booking without charge if the hour turns out to be
          uncivil.</p>
        <p class="text-soft">Everything except the sauna is weather dependent. If we cancel,
          you are not charged; if you cancel inside twenty-four hours, you are.</p>
        <a class="link-arrow" href="${esc(url('/aurelia/contact/'))}">Ask about a date</a>
      </div>
      <div class="split__art" style="aspect-ratio:1;border-radius:50%;max-width:22rem">
        ${vignette({ seed: 'exp-practical', palette: 'fog', motif: 'star' })}
      </div>
    </div>
  </div>
</section>

${cta({
  url,
  title: 'Book the room first.',
  body: 'Experiences are offered during checkout, and the good ones go early in the season.',
  seed: 'experiences-cta',
})}
`;
}

function card(item) {
  return `<li class="experience">
    <div class="experience__art">
      ${vignette({ seed: `exp-${item.slug}`, ...EXPERIENCE_ART[item.art] })}
    </div>
    <h3 class="experience__name">${esc(item.name)}</h3>
    <p class="experience__meta">
      <span>${esc(item.duration)}</span>
      <span>${item.price ? money(item.price) : 'Included'}</span>
      <span>${esc(item.season)}</span>
    </p>
    <p class="text-soft">${esc(item.summary)}</p>
  </li>`;
}
