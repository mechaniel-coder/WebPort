/**
 * Canvas rendering and interaction for the Verlet experiment.
 *
 * The simulation itself is in verlet.js; this file is only the stage — a fixed
 * timestep, a 2D renderer, pointer tools, and the accessibility scaffolding a
 * canvas cannot provide for itself.
 */

import { STRUCTURES, World } from './verlet.js';

const root = document.querySelector('[data-verlet]');
if (root) init(root);

function init(root) {
  const canvas = root.querySelector('[data-canvas]');
  const context = canvas.getContext('2d');
  const readout = root.querySelector('[data-readout]');
  const announcer = root.querySelector('[data-announce]');

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  const state = {
    structure: 'cloth',
    tool: 'drag',
    gravity: 900,
    stiffness: 6,
    playing: !reduced.matches,
  };

  let world;
  let grabbed = -1;
  let pointer = { x: 0, y: 0, active: false };
  let frame = null;
  let accumulator = 0;
  let last = 0;

  /* ── Sizing ─────────────────────────────────────────────────────────────── */

  // The simulation runs in CSS pixels; the backing store is scaled for density
  // so physics constants stay stable across displays.
  function measure() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    return { width, height };
  }

  function build() {
    const { width, height } = measure();
    world = new World({
      gravity: state.gravity,
      iterations: state.stiffness,
      bounds: { width, height },
    });

    const make = STRUCTURES[state.structure];
    if (state.structure === 'cloth') {
      const cols = Math.max(12, Math.min(30, Math.floor(width / 26)));
      const spacing = Math.min(24, (width * 0.75) / cols);
      make(world, {
        cols,
        rows: Math.max(10, Math.floor(height / spacing / 1.6)),
        spacing,
        originX: (width - (cols - 1) * spacing) / 2,
        originY: height * 0.12,
      });
    } else if (state.structure === 'net') {
      const size = Math.max(10, Math.min(18, Math.floor(width / 40)));
      const spacing = Math.min(30, (width * 0.7) / size);
      make(world, {
        size,
        spacing,
        originX: (width - (size - 1) * spacing) / 2,
        originY: (height - (size - 1) * spacing) / 2,
      });
    } else {
      make(world, { links: 26, spacing: Math.min(18, height / 30), originX: width / 2, originY: height * 0.1 });
    }

    grabbed = -1;
    draw();
    updateReadout();
  }

  /* ── Simulation ─────────────────────────────────────────────────────────── */

  const STEP = 1 / 60;

  function tick(now) {
    const delta = last ? Math.min((now - last) / 1000, 0.1) : 0;
    last = now;
    accumulator += delta;

    // Fixed timestep: a variable one makes Verlet explode on a slow frame,
    // because the implied velocity is scaled by a dt that suddenly changed.
    let steps = 0;
    while (accumulator >= STEP && steps < 5) {
      if (pointer.active && state.tool === 'wind') {
        world.repel(pointer.x, pointer.y, 90, 3.5);
      }
      if (grabbed >= 0) {
        world.x[grabbed] = pointer.x;
        world.y[grabbed] = pointer.y;
        world.px[grabbed] = pointer.x;
        world.py[grabbed] = pointer.y;
      }
      world.step(STEP);
      accumulator -= STEP;
      steps += 1;
    }

    draw();
    frame = requestAnimationFrame(tick);
  }

  function start() {
    if (frame === null) {
      last = 0;
      accumulator = 0;
      frame = requestAnimationFrame(tick);
    }
  }

  function stop() {
    if (frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  }

  /* ── Rendering ──────────────────────────────────────────────────────────── */

  function draw() {
    const { width, height } = { width: canvas.clientWidth, height: canvas.clientHeight };
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#090909';
    context.fillRect(0, 0, width, height);

    // Links first, points on top.
    context.lineWidth = 1;
    context.strokeStyle = '#ff5cf0';
    context.globalAlpha = 0.65;
    context.beginPath();

    for (const constraint of world.constraints) {
      if (constraint.broken) continue;
      context.moveTo(world.x[constraint.a], world.y[constraint.a]);
      context.lineTo(world.x[constraint.b], world.y[constraint.b]);
    }
    context.stroke();
    context.globalAlpha = 1;

    // Pinned points read differently, so the structure is legible at a glance.
    for (let i = 0; i < world.count; i += 1) {
      if (!world.pinned[i]) continue;
      context.fillStyle = '#f2f2f0';
      context.fillRect(world.x[i] - 2.5, world.y[i] - 2.5, 5, 5);
    }

    if (grabbed >= 0) {
      context.strokeStyle = '#f2f2f0';
      context.lineWidth = 2;
      context.beginPath();
      context.arc(world.x[grabbed], world.y[grabbed], 8, 0, Math.PI * 2);
      context.stroke();
    }

    if (pointer.active && state.tool !== 'drag') {
      context.strokeStyle = state.tool === 'cut' ? '#ff5cf0' : '#4fd8ff';
      context.globalAlpha = 0.5;
      context.lineWidth = 1;
      context.beginPath();
      context.arc(pointer.x, pointer.y, state.tool === 'cut' ? 18 : 90, 0, Math.PI * 2);
      context.stroke();
      context.globalAlpha = 1;
    }
  }

  function updateReadout() {
    // Control handlers sync once on wiring, which happens before the first
    // build — so there may legitimately be no world yet.
    if (!readout || !world) return;
    readout.innerHTML = '';
    const rows = [
      ['points', world.count.toLocaleString('en-US')],
      ['links', world.intact.toLocaleString('en-US')],
      ['passes', String(state.stiffness)],
    ];
    for (const [key, value] of rows) {
      const line = document.createElement('div');
      line.append(`${key} `);
      const strong = document.createElement('b');
      strong.textContent = value;
      line.append(strong);
      readout.append(line);
    }
  }

  function announce(message) {
    if (announcer) announcer.textContent = message;
  }

  /* ── Pointer ────────────────────────────────────────────────────────────── */

  function toLocal(event) {
    const box = canvas.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  }

  canvas.addEventListener('pointerdown', (event) => {
    const local = toLocal(event);
    pointer = { ...local, active: true };
    canvas.setPointerCapture(event.pointerId);

    if (state.tool === 'drag') grabbed = world.nearest(local.x, local.y, 36);
    else if (state.tool === 'cut') {
      const cut = world.cut(local.x, local.y);
      if (cut) updateReadout();
    }
    if (!state.playing) draw();
  });

  canvas.addEventListener('pointermove', (event) => {
    const local = toLocal(event);
    pointer = { ...local, active: pointer.active };

    if (pointer.active && state.tool === 'cut') {
      if (world.cut(local.x, local.y)) updateReadout();
    }
    if (!state.playing) draw();
  });

  const release = () => {
    pointer.active = false;
    grabbed = -1;
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('pointerleave', release);

  /* ── Keyboard ───────────────────────────────────────────────────────────── */

  // Everything the pointer does needs a key equivalent, or the experiment is
  // mouse-only and the accessibility claim on this site is a lie.
  canvas.addEventListener('keydown', (event) => {
    const nudge = event.shiftKey ? 120 : 40;

    const actions = {
      ArrowLeft: () => impulse(-nudge, 0, 'left'),
      ArrowRight: () => impulse(nudge, 0, 'right'),
      ArrowUp: () => impulse(0, -nudge, 'up'),
      ArrowDown: () => impulse(0, nudge, 'down'),
      ' ': () => {
        setPlaying(!state.playing);
        announce(state.playing ? 'Simulation running.' : 'Simulation paused.');
      },
      r: () => {
        build();
        announce('Simulation reset.');
      },
      c: () => {
        const cut = world.cut(canvas.clientWidth / 2, canvas.clientHeight / 2, 60);
        updateReadout();
        announce(`${cut} links cut at the centre.`);
      },
    };

    if (actions[event.key]) {
      event.preventDefault();
      actions[event.key]();
    }
  });

  /** Shove the whole structure — the keyboard equivalent of the wind tool. */
  function impulse(dx, dy, direction) {
    for (let i = 0; i < world.count; i += 1) {
      if (world.pinned[i]) continue;
      world.x[i] += dx * 0.15;
      world.y[i] += dy * 0.15;
    }
    if (!state.playing) {
      world.step(STEP);
      draw();
    }
    announce(`Pushed ${direction}.`);
  }

  /* ── Controls ───────────────────────────────────────────────────────────── */

  for (const input of root.querySelectorAll('[name="structure"]')) {
    input.addEventListener('change', () => {
      if (!input.checked) return;
      state.structure = input.value;
      build();
      announce(`${input.value} loaded.`);
    });
  }

  for (const input of root.querySelectorAll('[name="tool"]')) {
    input.addEventListener('change', () => {
      if (input.checked) state.tool = input.value;
    });
  }

  for (const input of root.querySelectorAll('[data-param]')) {
    const key = input.dataset.param;
    const output = root.querySelector(`[data-out="${key}"]`);

    const sync = () => {
      state[key] = Number(input.value);
      if (output) output.textContent = input.value;
      if (world) {
        if (key === 'gravity') world.gravity = state.gravity;
        if (key === 'stiffness') world.iterations = state.stiffness;
      }
      updateReadout();
    };

    input.addEventListener('input', sync);
    sync();
  }

  const playButton = root.querySelector('[data-play]');
  const playLabel = root.querySelector('[data-play-label]');

  function setPlaying(next) {
    state.playing = next;
    if (playButton) playButton.setAttribute('aria-pressed', String(next));
    if (playLabel) playLabel.textContent = next ? 'Pause' : 'Play';
    if (next) start();
    else stop();
  }

  playButton?.addEventListener('click', () => setPlaying(!state.playing));
  root.querySelector('[data-reset]')?.addEventListener('click', () => {
    build();
    announce('Simulation reset.');
  });

  /* ── Lifecycle ──────────────────────────────────────────────────────────── */

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (state.playing) start();
  });

  reduced.addEventListener('change', (event) => setPlaying(!event.matches));

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 200);
  });

  build();
  if (state.playing) start();
  else setPlaying(false);
}
