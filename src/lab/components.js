/**
 * Lab page components.
 */
import { each, esc } from '../_lib/html.js';

export function crumbs(trail, url) {
  return `<nav class="label label--dim" aria-label="Breadcrumb" style="margin-bottom:var(--s-s)">
    <ol style="display:flex;flex-wrap:wrap;gap:0.4rem;list-style:none;margin:0;padding:0">
      ${each(
        trail,
        (crumb, index) =>
          `<li>${
            index === trail.length - 1
              ? `<span aria-current="page">${esc(crumb.label)}</span>`
              : `<a href="${esc(url(crumb.href))}" style="color:inherit;text-decoration:none">${esc(
                  crumb.label,
                )}</a> /`
          }</li>`,
      )}
    </ol>
  </nav>`;
}

/**
 * Header for an experiment page. The accent is set on the wrapper so the whole
 * page — controls, ticks, focus rings — picks up that experiment's colour.
 */
export function experimentHead({ experiment, url }) {
  return `<section class="section--tight" style="padding-top:var(--s-l)">
    <div class="shell">
      ${crumbs(
        [
          { label: 'Lab', href: '/lab/' },
          { label: experiment.name, href: `/lab/${experiment.slug}/` },
        ],
        url,
      )}
      <p class="label">${esc(experiment.index)} · ${esc(experiment.kicker)}</p>
      <h1 class="h1" style="margin-top:var(--s-2xs)">${esc(experiment.name)}</h1>
      <p class="lede" style="margin-top:var(--s-s)">${esc(experiment.lede)}</p>
    </div>
  </section>`;
}

/**
 * The two-column note block every experiment closes with: what was written by
 * hand, what was deliberately not used, and the part that was actually hard.
 */
export function experimentNotes(experiment) {
  return `<section class="section ruled">
    <div class="shell">
      <div class="notes" style="margin-top:0">
        <div>
          <h2 class="note__title">Written by hand</h2>
          <ul class="ticks">
            ${each(experiment.wrote, (item) => `<li>${esc(item)}</li>`)}
          </ul>
          <p class="dim" style="margin-top:var(--s-m);font-size:var(--step--1)">
            <span class="label label--dim">Not used</span><br>
            ${esc(experiment.didnt)}
          </p>
        </div>

        <div>
          <h2 class="note__title">The part that was hard</h2>
          <p class="prose" style="margin:0">${esc(experiment.hard)}</p>
        </div>
      </div>
    </div>
  </section>`;
}

/** Next/previous navigation between experiments. */
export function experimentNav({ experiments, current, url }) {
  const index = experiments.findIndex((entry) => entry.slug === current.slug);
  const previous = experiments[(index - 1 + experiments.length) % experiments.length];
  const next = experiments[(index + 1) % experiments.length];

  const cell = (entry, direction) => `<a href="${esc(url(`/lab/${entry.slug}/`))}"
    style="--accent:${esc(entry.accent)};display:grid;gap:0.3rem;padding:var(--s-m) 0;
           text-decoration:none;color:inherit;${direction === 'next' ? 'text-align:right' : ''}">
    <span class="label">${direction === 'next' ? 'Next' : 'Previous'}</span>
    <span class="h3">${esc(entry.index)} ${esc(entry.name)}</span>
    <span class="dim" style="font-size:var(--step--1)">${esc(entry.summary)}</span>
  </a>`;

  return `<nav class="section--tight ruled" aria-label="Experiments">
    <div class="shell" style="display:grid;gap:var(--s-m);
                              grid-template-columns:repeat(auto-fit,minmax(16rem,1fr))">
      ${cell(previous, 'previous')}
      ${cell(next, 'next')}
    </div>
  </nav>`;
}

/**
 * A pause control for continuous animation.
 * WCAG 2.2.2 requires a mechanism to stop anything that moves automatically for
 * more than five seconds, and none of these experiments are exempt.
 */
export function motionControls({ extra = '' } = {}) {
  return `<div style="display:flex;flex-wrap:wrap;gap:var(--s-2xs);align-items:center;
                      margin-top:var(--s-s)">
    <button class="btn btn--ghost btn--sm" type="button" data-play aria-pressed="true">
      <span data-play-label>Pause</span>
    </button>
    <button class="btn btn--ghost btn--sm" type="button" data-reset>Reset</button>
    ${extra}
  </div>`;
}
