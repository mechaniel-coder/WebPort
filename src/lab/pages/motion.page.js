import { esc } from '../../_lib/html.js';
import { experimentBySlug, experiments } from '../data.js';
import { experimentHead, experimentNav, experimentNotes } from '../components.js';

const experiment = experimentBySlug.motion;

export const meta = {
  title: `${experiment.name} — Lab`,
  description: experiment.summary,
  styles: ['motion.css'],
  // ui.js only supplies the shared nav; nothing on this page's demos uses it.
  scripts: ['ui.js'],
  breadcrumbs: [
    { label: 'Work', href: '/' },
    { label: 'Lab', href: '/lab/' },
    { label: experiment.name, href: '/lab/motion/' },
  ],
};

const support = (feature, label) =>
  `<p class="support" data-feature="${esc(feature)}">${esc(label)}: <span></span></p>`;

export function render({ url }) {
  return `
<div style="--accent:${esc(experiment.accent)};--accent-ink:#150f00">

${experimentHead({ experiment, url })}

<section class="section--tight">
  <div class="shell">
    <p class="prose" style="max-width:68ch">
      Everything below runs on CSS alone. There is no script on this page driving any of
      it — no scroll listener, no class toggling, no resize observer. Each feature is
      wrapped in <code>@supports</code>, and each badge reports what
      <strong>your</strong> browser actually does using the same test as the demo beside it.
    </p>
  </div>
</section>

<div class="shell">

  <!-- 1 ─────────────────────────────────────────────────────────────────── -->
  <section class="feature" aria-labelledby="f-property">
    <div>
      <p class="label">01</p>
      <h2 class="h2" id="f-property" style="margin-top:var(--s-2xs)">
        <code>@property</code></h2>
      <div class="prose" style="margin-top:var(--s-s)">
        <p>An unregistered custom property is only a string, so a browser cannot interpolate
          it — animating one snaps at the midpoint instead of sweeping.</p>
        <p>Registering it with a <code>syntax</code> makes it a typed value the engine can
          actually animate. Here two registered properties drive a conic gradient's start
          angle and extent.</p>
      </div>
      <p class="dim" style="font-size:var(--step--2);border:1px solid var(--line-bright);
                            padding:0.4rem 0.6rem">
        This is the one feature here with no support badge — and deliberately so.
        <code>@property</code> cannot be reliably feature-detected from CSS:
        <code>@supports at-rule(@property)</code> exists, but is itself too new to test
        with. Where a condition is unrecognised, <em>both</em> the positive and negated
        branches evaluate false, so a badge built that way would render blank. It is treated
        strictly as an enhancement instead.
      </p>
    </div>

    <div class="feature__demo">
      <!-- tabindex so the demo is reachable without a pointer; the CSS reacts to
           :focus-visible as well as :hover. -->
      <div class="demo-property" tabindex="0" role="img"
           aria-label="A conic gradient dial that sweeps from 12 percent to 78 percent when hovered or focused."></div>
      <p class="dim" style="font-size:var(--step--2)">Hover or focus the dial.</p>
    </div>
  </section>

  <!-- 2 ─────────────────────────────────────────────────────────────────── -->
  <section class="feature" aria-labelledby="f-scroll">
    <div>
      <p class="label">02</p>
      <h2 class="h2" id="f-scroll" style="margin-top:var(--s-2xs)">
        Scroll-driven animation</h2>
      <div class="prose" style="margin-top:var(--s-s)">
        <p><code>animation-timeline: view()</code> ties an animation's progress to where the
          element sits in the scrollport. No scroll event, no
          <code>IntersectionObserver</code>, no JavaScript at all.</p>
        <p>The browser runs it off the main thread, which is why it stays smooth under load
          where a scroll handler judders. <code>animation-range</code> decides which part of
          the element's journey the animation covers.</p>
      </div>
      ${support('scroll-timeline', 'animation-timeline')}
    </div>

    <div class="feature__demo">
      <div class="scroll-rise" style="border:1px solid var(--line-bright);padding:var(--s-m)">
        <p class="h3">This block rises as it enters.</p>
        <p class="dim" style="font-size:var(--step--1);margin-top:var(--s-2xs)">
          Driven entirely by scroll position — scroll up and down to scrub it.
        </p>
      </div>

      <div>
        <p class="dim" style="font-size:var(--step--2);margin-bottom:0.3rem">
          And this meter fills on the same timeline.</p>
        <div class="meter-track">
          <div class="meter-fill scroll-meter"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- 3 ─────────────────────────────────────────────────────────────────── -->
  <section class="feature" aria-labelledby="f-container">
    <div>
      <p class="label">03</p>
      <h2 class="h2" id="f-container" style="margin-top:var(--s-2xs)">Container queries</h2>
      <div class="prose" style="margin-top:var(--s-s)">
        <p>A media query asks about the viewport, which is the wrong question for a component
          that might sit in a sidebar on one page and full width on another.</p>
        <p><code>@container</code> asks about the element's own box instead. The card below
          switches layout at 26rem of <em>its own</em> width — drag its bottom-right corner
          and watch it change without the window moving.</p>
      </div>
      ${support('container', '@container')}
    </div>

    <div class="feature__demo">
      <div class="resizer">
        <div class="cq-card">
          <div class="cq-card__figure"></div>
          <div>
            <p class="h3">Adaptive card</p>
            <p class="dim cq-card__state" style="font-size:var(--step--2)">Layout: </p>
          </div>
        </div>
      </div>
      <p class="dim" style="font-size:var(--step--2)">
        Drag the corner of the dashed box to resize it.
      </p>
    </div>
  </section>

  <!-- 4 ─────────────────────────────────────────────────────────────────── -->
  <section class="feature" aria-labelledby="f-has">
    <div>
      <p class="label">04</p>
      <h2 class="h2" id="f-has" style="margin-top:var(--s-2xs)"><code>:has()</code></h2>
      <div class="prose" style="margin-top:var(--s-s)">
        <p>The parent selector CSS went without for twenty years. A row can now style itself
          because of the state of something inside it.</p>
        <p>Before this, the pattern below needed a change listener toggling a class on the
          parent for every checkbox on the page. It is the single clearest example of a CSS
          feature deleting JavaScript.</p>
      </div>
      ${support('has', ':has()')}
    </div>

    <div class="feature__demo">
      <fieldset class="has-demo" style="border:0;padding:0;margin:0">
        <legend class="dim" style="font-size:var(--step--2);padding:0">
          Select a few — the rows and the summary react with no script
        </legend>
        ${['Renderer', 'Verlet', 'Descent', 'Motion']
          .map(
            (label, index) => `<label class="has-row">
          <input type="checkbox" ${index === 0 ? 'checked' : ''}>
          <span>${esc(label)}</span>
        </label>`,
          )
          .join('')}
      </fieldset>
      <p class="dim has-summary" style="font-size:var(--step--2)">Summary: </p>
    </div>
  </section>

  <!-- 5 ─────────────────────────────────────────────────────────────────── -->
  <section class="feature" aria-labelledby="f-vt">
    <div>
      <p class="label">05</p>
      <h2 class="h2" id="f-vt" style="margin-top:var(--s-2xs)">View transitions</h2>
      <div class="prose" style="margin-top:var(--s-s)">
        <p>A single <code>@view-transition { navigation: auto; }</code> in the stylesheet
          gives cross-document navigation a real transition — between separate HTML files,
          on a site with no client-side router.</p>
        <p>It is declared once for the whole lab. Move between any two experiment pages in a
          supporting browser and the change is animated; everywhere else the navigation is
          instant, which is exactly what it was before.</p>
      </div>
      ${support('view-transitions', 'view-transition-name')}
    </div>

    <div class="feature__demo">
      <p class="dim" style="font-size:var(--step--1)">Try it — these are ordinary links to
        separate documents:</p>
      <div style="display:flex;flex-wrap:wrap;gap:var(--s-2xs)">
        ${experiments
          .filter((entry) => entry.slug !== 'motion')
          .map(
            (entry) => `<a class="btn btn--ghost btn--sm"
              href="${esc(url(`/lab/${entry.slug}/`))}">${esc(entry.index)} ${esc(entry.name)}</a>`,
          )
          .join('')}
      </div>
    </div>
  </section>

</div>

${experimentNotes(experiment)}
${experimentNav({ experiments, current: experiment, url })}

</div>
`;
}
