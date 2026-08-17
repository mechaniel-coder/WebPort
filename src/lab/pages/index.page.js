import { each, esc } from '../../_lib/html.js';
import { constraints, experiments, lab } from '../data.js';
import { studio } from '../../../site.config.js';

export const meta = {
  title: 'Lab',
  metaTitle: `${lab.name} — frontier techniques, written from nothing`,
  description: `Four experiments in WebGL, physics, scroll-driven storytelling and frontier
    CSS — each written without the library that normally comes with it.`,
  priority: 0.9,
  scripts: ['ui.js'],
  breadcrumbs: [
    { label: 'Work', href: '/' },
    { label: 'Lab', href: '/lab/' },
  ],
};

export function render({ url }) {
  return `
<section class="section" style="padding-top:var(--s-2xl)">
  <div class="shell">
    <p class="label">In-house research · ${esc(studio.name)}</p>
    <h1 class="display" style="margin-top:var(--s-s);max-width:14ch">
      Frontier techniques, written from nothing.</h1>
    <p class="lede" data-rise style="margin-top:var(--s-m)">${esc(lab.lede)}</p>

    <div style="display:flex;flex-wrap:wrap;gap:var(--s-s);margin-top:var(--s-l);
                font-size:var(--step--2);color:var(--faint);letter-spacing:0.1em;
                text-transform:uppercase">
      <span>0 dependencies</span>
      <span>·</span>
      <span>0 rendering engines</span>
      <span>·</span>
      <span>0 scroll hijacks</span>
    </div>
  </div>
</section>

<section class="section--tight" aria-labelledby="specimens-heading">
  <div class="shell">
    <h2 class="label label--dim" id="specimens-heading">Four experiments</h2>
  </div>
  <div class="shell">
    <ul class="specimens">
      ${each(
        experiments,
        (entry) => `<li class="specimen" data-rise style="--accent:${esc(entry.accent)}">
        <a class="specimen__link" href="${esc(url(`/lab/${entry.slug}/`))}">
          <span class="specimen__index">${esc(entry.index)}</span>
          <span class="specimen__name">${esc(entry.name)}</span>
          <span class="specimen__summary">${esc(entry.summary)}</span>
          <span class="specimen__kicker">${esc(entry.kicker)}</span>
        </a>
      </li>`,
      )}
    </ul>
  </div>
</section>

<section class="section ruled" aria-labelledby="rules-heading">
  <div class="shell">
    <h2 class="label" id="rules-heading">The constraints</h2>
    <p class="lede" style="margin-top:var(--s-s)">
      Spectacle usually arrives at the cost of everything else. These are the rules the lab
      does not break to get it.
    </p>

    <div class="notes" style="margin-top:var(--s-xl)">
      ${each(
        constraints,
        (rule) => `<div>
        <h3 class="note__title">${esc(rule.title)}</h3>
        <p class="prose" style="margin:0">${esc(rule.text)}</p>
      </div>`,
      )}
    </div>
  </div>
</section>

<section class="section--tight ruled">
  <div class="shell" style="display:flex;flex-wrap:wrap;gap:var(--s-s);align-items:center;
                            justify-content:space-between">
    <p class="dim" style="font-size:var(--step--1);max-width:52ch">
      The lab is research, not commissioned work. The client projects are on the studio site.
    </p>
    <a class="btn btn--ghost" href="${esc(url('/'))}">See the client work</a>
  </div>
</section>
`;
}
