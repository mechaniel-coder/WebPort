import { esc } from '../../_lib/html.js';
import { experimentBySlug, experiments } from '../data.js';
import { experimentHead, experimentNav, experimentNotes, motionControls } from '../components.js';

const experiment = experimentBySlug.renderer;

export const meta = {
  title: `${experiment.name} — Lab`,
  description: experiment.summary,
  scripts: ['ui.js', 'renderer.js'],
  breadcrumbs: [
    { label: 'Work', href: '/' },
    { label: 'Lab', href: '/lab/' },
    { label: experiment.name, href: '/lab/renderer/' },
  ],
};

export function render({ url }) {
  return `
<div style="--accent:${esc(experiment.accent)};--accent-ink:#0a0f00">

${experimentHead({ experiment, url })}

<section class="section--tight">
  <div class="shell rig-grid" data-renderer>

    <div>
      <div class="stage">
        <div class="stage__readout" data-readout aria-hidden="true"></div>

        <!-- tabindex makes the camera reachable without a pointer; the label and
             description are what assistive technology gets instead of pixels.
             The role is application rather than img because this canvas takes
             arrow keys: an image is not operable, and claiming to be one here
             would tell a screen reader to swallow exactly the keys the camera
             needs. -->
        <canvas class="stage__canvas" data-canvas
                tabindex="0"
                role="application"
                aria-label="Interactive 3D view of a procedurally generated torus knot, lit and shaded in real time."
                aria-describedby="canvas-help"></canvas>

        <p class="stage__fallback" data-fallback hidden></p>
      </div>

      <p id="canvas-help" class="dim" style="font-size:var(--step--2);margin-top:var(--s-2xs)">
        Drag to orbit, scroll to zoom. With the canvas focused: arrow keys orbit,
        <kbd>+</kbd> and <kbd>−</kbd> zoom, <kbd>Home</kbd> resets. Hold <kbd>Shift</kbd>
        to move faster.
      </p>

      ${motionControls()}
    </div>

    <div class="panel">
      <h2 class="panel__title">Controls</h2>

      <fieldset style="border:0;padding:0;margin:0 0 var(--s-m)">
        <legend class="ctrl__label" style="padding:0;margin-bottom:0.4rem">Geometry</legend>
        <div class="chips">
          ${['knot', 'sphere', 'box']
            .map(
              (shape, index) => `<label class="chip">
            <input type="radio" name="shape" value="${shape}" ${index === 0 ? 'checked' : ''}>
            <span>${shape}</span>
          </label>`,
            )
            .join('')}
        </div>
      </fieldset>

      <div class="ctrl" data-knot-only>
        <div class="ctrl__head">
          <label class="ctrl__label" for="c-p">Winds around axis (p)</label>
          <output class="ctrl__value" data-out="p" for="c-p">2</output>
        </div>
        <input id="c-p" type="range" min="1" max="7" step="1" value="2" data-uniform="p">
      </div>

      <div class="ctrl" data-knot-only>
        <div class="ctrl__head">
          <label class="ctrl__label" for="c-q">Winds through hole (q)</label>
          <output class="ctrl__value" data-out="q" for="c-q">3</output>
        </div>
        <input id="c-q" type="range" min="1" max="9" step="1" value="3" data-uniform="q">
      </div>

      <div class="ctrl">
        <div class="ctrl__head">
          <label class="ctrl__label" for="c-rough">Roughness</label>
          <output class="ctrl__value" data-out="roughness" for="c-rough">0.35</output>
        </div>
        <input id="c-rough" type="range" min="0" max="1" step="0.05" value="0.35"
               data-uniform="roughness">
      </div>

      <div class="ctrl">
        <div class="ctrl__head">
          <label class="ctrl__label" for="c-rim">Rim light</label>
          <output class="ctrl__value" data-out="rim" for="c-rim">0.55</output>
        </div>
        <input id="c-rim" type="range" min="0" max="1.5" step="0.05" value="0.55"
               data-uniform="rim">
      </div>

      <div class="ctrl">
        <div class="ctrl__head">
          <label class="ctrl__label" for="c-facets">Normal wash</label>
          <output class="ctrl__value" data-out="facets" for="c-facets">0</output>
        </div>
        <input id="c-facets" type="range" min="0" max="1" step="0.05" value="0"
               data-uniform="facets">
      </div>

      <div class="ctrl">
        <div class="ctrl__head">
          <label class="ctrl__label" for="c-fov">Field of view</label>
          <output class="ctrl__value" data-out="fov" for="c-fov">45°</output>
        </div>
        <input id="c-fov" type="range" min="20" max="90" step="1" value="45"
               data-uniform="fov" data-suffix="°">
      </div>

      <p class="dim" style="font-size:var(--step--2);margin-top:var(--s-m);
                            padding-top:var(--s-s);border-top:1px solid var(--line)">
        Context: <span data-gl-status>initialising</span>
      </p>
    </div>
  </div>
</section>

<section class="section ruled">
  <div class="shell">
    <div class="notes" style="margin-top:0">
      <div>
        <h2 class="note__title">The pipeline, in order</h2>
        <ol class="ticks" style="counter-reset:none">
          <li>Generate vertices and analytic normals on the CPU</li>
          <li>Upload both to GPU buffers once, not per frame</li>
          <li>Compile and link the vertex and fragment shaders</li>
          <li>Build projection, view and model matrices per frame</li>
          <li>Derive the normal matrix — inverse transpose of the model</li>
          <li>Bind uniforms, bind attributes, <code>drawElements</code></li>
        </ol>
      </div>

      <div>
        <h2 class="note__title">Why it looks the way it does</h2>
        <div class="prose" style="margin:0">
          <p>Two directional lights, a Blinn–Phong specular term using the half-vector,
            and a Fresnel-style rim so the silhouette separates from a black background.</p>
          <p>The last line of the fragment shader raises the colour to
            <code>1/2.2</code>. That is an approximate sRGB conversion, and skipping it is
            the single most common reason a hand-written renderer looks flat and washed
            out next to an engine's output.</p>
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
