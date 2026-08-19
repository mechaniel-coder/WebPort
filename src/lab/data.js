/**
 * Lab content model.
 *
 * The lab is the studio's own R&D rather than client work: four experiments,
 * each demonstrating a technique that normally arrives with a library attached,
 * written here without one.
 *
 * The constraint is the point. Every experiment is raw platform code — WebGL
 * with hand-written matrix maths, a Verlet integrator, scroll-driven narrative
 * built on IntersectionObserver, and CSS features new enough to still need
 * fallbacks. No three.js, no GSAP, no scroll library, no dependencies at all.
 */

import { studio } from '../../site.config.js';

export const lab = {
  name: `${studio.shortName} Lab`,
  tagline: 'Frontier techniques, written from nothing.',
  lede: `Four experiments in methods that usually mean importing a library. Each one is
    raw platform code — and each one still works with a keyboard, still respects reduced
    motion, and still says something useful when the effect is switched off.`,
};

/* ── Experiments ───────────────────────────────────────────────────────────── */

export const experiments = [
  {
    slug: 'renderer',
    index: '01',
    name: 'Renderer',
    kicker: '3D interface',
    accent: '#8fb8ff',
    summary: 'A WebGL renderer with no engine underneath it.',
    lede: `Perspective projection, orbit camera, procedural geometry and Blinn–Phong shading,
      written from the matrix maths up. The GUI drives real uniforms, not a wrapper.`,
    wrote: [
      'mat4 and vec3 maths — perspective, lookAt, multiply, invert, transpose',
      'Shader compilation, linking and uniform binding',
      'Procedural torus-knot geometry with generated normals',
      'Blinn–Phong shading with rim light, in GLSL',
      'An orbit camera driven by pointer, wheel and arrow keys',
    ],
    didnt: 'three.js, gl-matrix, or any helper of any kind',
    hard: `Getting the normal matrix right. Normals do not transform with the model matrix —
      they need its inverse transpose, or lighting shears the moment you scale non-uniformly.
      It is the bug everyone hits and it looks like a lighting problem rather than a maths one.`,
  },
  {
    slug: 'verlet',
    index: '02',
    name: 'Verlet',
    kicker: 'Physics',
    accent: '#ff7a66',
    summary: 'Cloth, rope and constraint solving with a hand-written integrator.',
    lede: `Position-based dynamics: no velocities stored, no forces integrated. Each particle
      remembers where it was, and constraints are satisfied by moving points directly.`,
    wrote: [
      'A Verlet integrator — position derived from the previous position, not velocity',
      'Distance constraints relaxed over several iterations per frame',
      'Cloth, rope and net structures built from the same primitive',
      'Pointer interaction: grab, drag and tear',
      'A spatial hash so collision stays linear rather than quadratic',
    ],
    didnt: 'matter.js, cannon, rapier, or any physics engine',
    hard: `Constraint stiffness is a lie you negotiate with. One relaxation pass gives you
      rubber; twenty gives you steel and eats the frame budget. The honest answer is to pick
      an iteration count, tune the rest-lengths around it, and stop pretending the simulation
      is converging.`,
  },
  {
    slug: 'descent',
    index: '03',
    name: 'Descent',
    kicker: 'Storytelling',
    accent: '#56c8e0',
    summary: 'A freedive to a hundred metres, told by scrolling down it.',
    lede: `Scroll position is depth. The visualisation is driven by real physics — Boyle's law
      compressing lung volume, light attenuating exponentially — rather than keyframes.`,
    wrote: [
      'Scroll progress mapped to depth with IntersectionObserver and a sticky stage',
      'Light attenuation via the Beer–Lambert law, per wavelength',
      'Lung compression from Boyle’s law at real ambient pressures',
      'Scene transitions that never hijack the scrollbar',
      'A complete prose version that reads without the visualisation at all',
    ],
    didnt: 'GSAP ScrollTrigger, Lenis, locomotive-scroll, or any smooth-scroll hijack',
    hard: `Scrollytelling usually breaks the one interaction everyone relies on. Nothing here
      overrides the scrollbar, hijacks the wheel, or animates scrolling — the page scrolls
      natively and the visualisation reads its position. Turn JavaScript off and the piece is
      still a complete article.`,
  },
  {
    slug: 'motion',
    index: '04',
    name: 'Motion',
    kicker: 'Frontier CSS',
    accent: '#e0b45c',
    summary: 'Four browser features new enough to still need a fallback.',
    lede: `The counterweight to the other three: no JavaScript at all. Scroll-driven
      animation, view transitions, animatable custom properties and container queries —
      each shipped with the plan for engines that do not have them yet.`,
    wrote: [
      'Scroll-driven animation with animation-timeline: view() — no scroll listener',
      'Cross-document view transitions via @view-transition',
      '@property to make a custom property genuinely animatable',
      'Container queries so a component responds to its own box, not the viewport',
      ':has() as a parent selector, replacing three lines of JavaScript',
    ],
    didnt: 'A single line of JavaScript on the page',
    hard: `Every one of these is a progressive enhancement or it is a bug. Each is wrapped in
      @supports and degrades to a static, legible state — because "works in my browser" is
      not a rendering strategy.`,
  },
];

export const experimentBySlug = Object.fromEntries(
  experiments.map((entry) => [entry.slug, entry]),
);

/* ── Descent narrative ─────────────────────────────────────────────────────── */

/**
 * The storytelling piece. Each scene carries a depth, so the visualisation and
 * the prose are driven by the same data — and the prose alone is a complete
 * article if the canvas never renders.
 */
export const descent = {
  title: 'One hundred metres',
  standfirst: `A constant-weight freedive is four minutes long and mostly spent falling. This
    is what happens on the way down.`,
  scenes: [
    {
      depth: 0,
      label: 'Surface',
      heading: 'The last breath',
      text: `A full inhalation is about six litres. The diver holds it at the surface, face
        down, and does nothing for thirty seconds — heart rate is already falling, because
        cold water on the face alone is enough to trigger the mammalian dive reflex.`,
      fact: 'Lung volume 6.0 L · 1 atmosphere',
    },
    {
      depth: 10,
      label: '10 m',
      heading: 'Pressure doubles',
      text: `Ten metres of seawater is one more atmosphere. Total pressure is now two — and by
        Boyle's law the air in the lungs has halved to three litres. Every equalisation from
        here costs more air than the last.`,
      fact: 'Lung volume 3.0 L · 2 atmospheres',
    },
    {
      depth: 20,
      label: '20 m',
      heading: 'Freefall begins',
      text: `Around twenty metres the diver stops swimming. Compressed tissue means the body
        is no longer buoyant, and from here gravity does the work. Kicking would cost oxygen
        for no gain.`,
      fact: 'Lung volume 2.0 L · Negative buoyancy',
    },
    {
      depth: 40,
      label: '40 m',
      heading: 'The colour leaves',
      text: `Red disappeared at five metres, orange by twenty, yellow around here. What is
        left is blue, because water absorbs long wavelengths first — the same reason the deep
        ocean is the colour it is rather than simply dark.`,
      fact: 'Surface light ~2% · Red fully absorbed',
    },
    {
      depth: 60,
      label: '60 m',
      heading: 'Blood shift',
      text: `Plasma moves into the chest cavity to fill the space the compressed lungs have
        left. Without it the ribcage would fail somewhere around here. It is an involuntary
        adaptation shared with seals and whales, and it is the reason this depth is survivable
        at all.`,
      fact: 'Lung volume 0.9 L · Thoracic blood shift',
    },
    {
      depth: 100,
      label: '100 m',
      heading: 'The plate',
      text: `The diver takes a tag from the plate at the bottom of the line, turns, and begins
        the swim back. The ascent is longer, harder and more dangerous than the descent —
        almost every freediving blackout happens in the last ten metres, within sight of the
        surface.`,
      fact: 'Lung volume 0.55 L · 11 atmospheres',
    },
  ],
  coda: `Constant weight without fins currently stands a little over a hundred metres. Every
    number above is real physics applied to a real discipline; the dive itself is a
    composite, written to give the visualisation something true to be driven by.`,
};

/* ── Colophon ──────────────────────────────────────────────────────────────── */

export const constraints = [
  {
    title: 'No dependencies, still',
    text: `The whole portfolio ships zero runtime dependencies, and the lab does not get an
      exemption for being the hard part. A renderer you imported proves you can read
      documentation; one you wrote proves something else.`,
  },
  {
    title: 'Motion is optional, always',
    text: `Every experiment checks prefers-reduced-motion and has a considered static state —
      not a blank box. Continuous animation carries a pause control, because WCAG 2.2.2 is not
      waived for being pretty.`,
  },
  {
    title: 'Canvas is invisible to assistive technology',
    text: `A canvas element is a bitmap with no semantics. Everything drawn in one here is
      also available as text, a table or a control — so the experiments are described rather
      than merely decorated.`,
  },
  {
    title: 'The scrollbar is not yours to take',
    text: `No smooth-scroll hijack, no wheel interception, no scroll-jacking. The page scrolls
      the way the operating system says it scrolls, and the visualisation reads that position.`,
  },
];
