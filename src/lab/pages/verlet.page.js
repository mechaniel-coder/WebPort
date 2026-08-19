import { esc } from '../../_lib/html.js';
import { experimentBySlug, experiments } from '../data.js';
import { experimentHead, experimentNav, experimentNotes, motionControls } from '../components.js';

const experiment = experimentBySlug.verlet;

export const meta = {
  title: `${experiment.name} — Lab`,
  description: experiment.summary,
  scripts: ['ui.js', 'verlet-stage.js'],
  breadcrumbs: [
    { label: 'Work', href: '/' },
    { label: 'Lab', href: '/lab/' },
    { label: experiment.name, href: '/lab/verlet/' },
  ],
};

const chip = (name, value, label, checked) => `<label class="chip">
  <input type="radio" name="${name}" value="${value}" ${checked ? 'checked' : ''}>
  <span>${label}</span>
</label>`;

export function render({ url }) {
  return `
<div style="--accent:${esc(experiment.accent)};--accent-ink:#1a0016">

${experimentHead({ experiment, url })}

<section class="section--tight">
  <div class="shell rig-grid" data-verlet>

    <div>
      <div class="stage">
        <div class="stage__readout" data-readout aria-hidden="true"></div>

        <canvas class="stage__canvas" data-canvas
                tabindex="0"
                role="application"
                aria-label="A cloth simulation: a grid of points joined by distance constraints, hanging from pinned anchors and swinging under gravity."
                aria-describedby="verlet-help"></canvas>
      </div>

      <p id="verlet-help" class="dim" style="font-size:var(--step--2);margin-top:var(--s-2xs)">
        Drag to grab a point; switch tools to push or tear the fabric. With the canvas
        focused: arrow keys shove the structure, <kbd>Space</kbd> pauses, <kbd>C</kbd> cuts
        at the centre, <kbd>R</kbd> resets. Hold <kbd>Shift</kbd> to push harder.
      </p>

      <!-- Canvas changes are invisible to assistive technology, so the
           consequences of each action are announced in text. -->
      <p class="visually-hidden" role="status" aria-live="polite" data-announce></p>

      ${motionControls()}
    </div>

    <div class="panel">
      <h2 class="panel__title">Controls</h2>

      <fieldset style="border:0;padding:0;margin:0 0 var(--s-m)">
        <legend class="ctrl__label" style="padding:0;margin-bottom:0.4rem">Structure</legend>
        <div class="chips">
          ${chip('structure', 'cloth', 'cloth', true)}
          ${chip('structure', 'net', 'net', false)}
          ${chip('structure', 'rope', 'rope', false)}
        </div>
      </fieldset>

      <fieldset style="border:0;padding:0;margin:0 0 var(--s-m)">
        <legend class="ctrl__label" style="padding:0;margin-bottom:0.4rem">Tool</legend>
        <div class="chips">
          ${chip('tool', 'drag', 'drag', true)}
          ${chip('tool', 'wind', 'push', false)}
          ${chip('tool', 'cut', 'tear', false)}
        </div>
      </fieldset>

      <div class="ctrl">
        <div class="ctrl__head">
          <label class="ctrl__label" for="v-gravity">Gravity</label>
          <output class="ctrl__value" data-out="gravity" for="v-gravity">900</output>
        </div>
        <input id="v-gravity" type="range" min="0" max="2000" step="50" value="900"
               data-param="gravity">
      </div>

      <div class="ctrl">
        <div class="ctrl__head">
          <label class="ctrl__label" for="v-stiff">Relaxation passes</label>
          <output class="ctrl__value" data-out="stiffness" for="v-stiff">6</output>
        </div>
        <input id="v-stiff" type="range" min="1" max="20" step="1" value="6"
               data-param="stiffness">
        <p class="dim" style="font-size:var(--step--2);margin-top:0.3rem">
          1 is rubber. 20 is steel, and costs frames.
        </p>
      </div>
    </div>
  </div>
</section>

<section class="section ruled">
  <div class="shell">
    <div class="notes" style="margin-top:0">
      <div>
        <h2 class="note__title">Why there are no velocities</h2>
        <div class="prose" style="margin:0">
          <p>A particle stores its current position and its previous one. Velocity is the
            gap between them, never written down:</p>
          <p><code>x' = x + (x − xPrev) × damping + a × dt²</code></p>
          <p>That is the whole reason constraints are easy here. To enforce a distance you
            move the two points, and the velocity updates itself because it was only ever
            implied. In a force-based engine the same thing needs impulses, masses and a
            solver that can disagree with the integrator.</p>
        </div>
      </div>

      <div>
        <h2 class="note__title">The fixed timestep is not optional</h2>
        <div class="prose" style="margin:0">
          <p>Verlet derives velocity from a position difference produced under some earlier
            <code>dt</code>. Change <code>dt</code> between frames and that difference is
            silently rescaled — one long frame and the whole structure detonates.</p>
          <p>So the loop accumulates real time and consumes it in fixed 1/60 s steps, capped
            at five per frame so a slow device falls behind gracefully rather than entering a
            spiral it cannot exit.</p>
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
