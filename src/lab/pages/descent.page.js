import { each, esc } from '../../_lib/html.js';
import { descent, experimentBySlug, experiments } from '../data.js';
import { experimentHead, experimentNav, experimentNotes } from '../components.js';

const experiment = experimentBySlug.descent;

export const meta = {
  title: `${experiment.name} — Lab`,
  description: experiment.summary,
  styles: ['descent.css'],
  scripts: ['ui.js', 'descent.js'],
  breadcrumbs: [
    { label: 'Work', href: '/' },
    { label: 'Lab', href: '/lab/' },
    { label: experiment.name, href: '/lab/descent/' },
  ],
};

/** Boyle's law, computed at build time so the table matches the canvas exactly. */
const pressure = (depth) => 1 + depth / 10;
const volume = (depth) => 6 / pressure(depth);

export function render({ url }) {
  return `
<div style="--accent:${esc(experiment.accent)};--accent-ink:#001018">

${experimentHead({ experiment, url })}

<article class="dive" data-descent>
  <header class="shell--text section--tight">
    <h2 class="h2">${esc(descent.title)}</h2>
    <p class="lede" style="margin-top:var(--s-s)">${esc(descent.standfirst)}</p>
  </header>

  <!-- The stage is sticky; the track below is what gives it something to
       measure. Nothing here touches scroll position. -->
  <div class="dive__track" data-track>
    <div class="dive__stage">
      <div class="dive__viewport">
        <canvas class="dive__canvas" data-canvas
                role="img"
                aria-label="A water column that darkens and shifts blue with depth, alongside a diver, a depth scale and a circle showing lung volume shrinking under pressure."></canvas>

        <dl class="dive__hud" aria-hidden="true">
          <div><dt>depth</dt><dd data-depth>0 m</dd></div>
          <div><dt>pressure</dt><dd data-pressure>1.0 atm</dd></div>
          <div><dt>lungs</dt><dd data-volume>6.00 L</dd></div>
          <div><dt>light</dt><dd data-light>100%</dd></div>
        </dl>
      </div>
    </div>

    <div class="dive__scenes shell--text" data-scenes>
      ${each(
        descent.scenes,
        (scene) => `<section class="dive__scene" data-scene data-active="false">
        <p class="label">${esc(scene.label)}</p>
        <h3 class="h2" style="margin-top:var(--s-2xs)">${esc(scene.heading)}</h3>
        <p class="prose" style="margin-top:var(--s-s)">${esc(scene.text)}</p>
        <p class="dive__fact">${esc(scene.fact)}</p>
      </section>`,
      )}
    </div>
  </div>

  <footer class="shell--text section--tight">
    <p class="prose">${esc(descent.coda)}</p>
  </footer>
</article>

<section class="section ruled">
  <div class="shell">
    <h2 class="note__title">The same numbers, as a table</h2>
    <p class="dim" style="font-size:var(--step--1);max-width:60ch;margin-bottom:var(--s-s)">
      Everything the visualisation encodes, in a form that does not require seeing it. The
      figures are computed from the same two equations the canvas uses.
    </p>

    <table class="readout-table" style="max-width:44rem">
      <caption>Depth, pressure and lung volume</caption>
      <thead>
        <tr>
          <th scope="col">Depth</th>
          <th scope="col">Pressure</th>
          <th scope="col">Lung volume</th>
          <th scope="col">Surface light</th>
        </tr>
      </thead>
      <tbody>
        ${each(descent.scenes, (scene) => {
          const light = ((Math.exp(-0.2 * scene.depth) +
            Math.exp(-0.05 * scene.depth) +
            Math.exp(-0.03 * scene.depth)) / 3) * 100;
          return `<tr>
          <th scope="row">${scene.depth} m</th>
          <td>${pressure(scene.depth).toFixed(1)} atm</td>
          <td>${volume(scene.depth).toFixed(2)} L</td>
          <td>${light < 1 ? light.toFixed(2) : light.toFixed(1)}%</td>
        </tr>`;
        })}
      </tbody>
    </table>
  </div>
</section>

<section class="section ruled">
  <div class="shell">
    <div class="notes" style="margin-top:0">
      <div>
        <h2 class="note__title">Driven by equations, not keyframes</h2>
        <div class="prose" style="margin:0">
          <p><strong>Pressure.</strong> <code>P = 1 + depth / 10</code> — one atmosphere at
            the surface, one more for every ten metres of seawater.</p>
          <p><strong>Volume.</strong> Boyle's law, <code>P₁V₁ = P₂V₂</code>. Six litres at
            the surface is 0.55 at a hundred metres, which is the number that makes the
            blood shift necessary rather than merely interesting.</p>
          <p><strong>Colour.</strong> Beer–Lambert attenuation per channel, with red
            extinguishing roughly seven times faster than blue. The water column is computed
            row by row from that, not sampled from a gradient someone drew.</p>
        </div>
      </div>

      <div>
        <h2 class="note__title">What it refuses to do</h2>
        <div class="prose" style="margin:0">
          <p>No wheel interception. No <code>scrollTo</code>. No smooth-scroll library
            replacing native scrolling with an animated approximation of it.</p>
          <p>The visualisation reads <code>getBoundingClientRect()</code> on its own track
            and derives a progress value. Scroll is an input, never an output — which is why
            the scrollbar, keyboard paging, find-in-page and screen-reader navigation all
            still behave normally.</p>
          <p>With scripting off the canvas stays empty and every word above is still there.
            The story is the article; the visualisation is an enhancement.</p>
        </div>
      </div>
    </div>
  </div>
</section>

${experimentNotes(experiment)}
${experimentNav({ experiments, current: experiment, url })}

</div>
`;
}
