/**
 * A WebGL renderer with no engine underneath it.
 *
 * Everything between "here is a canvas" and "here is a shaded 3D object" is in
 * this file and its two neighbours: mat4.js for the maths, geometry.js for the
 * meshes. No three.js, no gl-matrix, no helpers.
 *
 * Accessibility notes, because a canvas is a bitmap with no semantics:
 *   · the camera is fully operable from the keyboard, not just the pointer
 *   · a live text readout mirrors the canvas state for assistive technology
 *   · prefers-reduced-motion stops the auto-rotation and renders a static frame
 *   · context loss is handled rather than leaving a permanently blank box
 */

import {
  fromRotationX,
  fromRotationY,
  identity,
  lookAt,
  multiply,
  normalMatrix,
  orbitToCartesian,
  perspective,
} from './mat4.js';
import { SHAPES } from './geometry.js';

/* ── Shaders ───────────────────────────────────────────────────────────────── */

const VERTEX_SHADER = `
precision highp float;

attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;
uniform mat3 uNormalMatrix;

varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
  vec4 world = uModel * vec4(aPosition, 1.0);
  vWorldPos = world.xyz;

  // The normal matrix, not the model matrix — see mat4.js.
  vNormal = normalize(uNormalMatrix * aNormal);

  gl_Position = uProjection * uView * world;
}
`;

const FRAGMENT_SHADER = `
precision highp float;

varying vec3 vNormal;
varying vec3 vWorldPos;

uniform vec3 uCamera;
uniform vec3 uAccent;
uniform float uRoughness;
uniform float uRim;
uniform float uWireMix;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(uCamera - vWorldPos);

  // Two lights: a key from above-right, a cool fill from below-left.
  vec3 keyDir = normalize(vec3(0.6, 0.8, 0.5));
  vec3 fillDir = normalize(vec3(-0.7, -0.3, -0.4));

  float key = max(dot(N, keyDir), 0.0);
  float fill = max(dot(N, fillDir), 0.0) * 0.28;

  // Blinn-Phong specular: the half-vector is cheaper than reflecting V and
  // behaves better at grazing angles.
  vec3 H = normalize(keyDir + V);
  float shininess = mix(96.0, 6.0, uRoughness);
  float spec = pow(max(dot(N, H), 0.0), shininess) * (1.0 - uRoughness * 0.75);

  // Fresnel-ish rim, so the silhouette reads against a black ground.
  float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0) * uRim;

  vec3 base = uAccent * (0.16 + key * 0.85) + vec3(0.05, 0.07, 0.09) * fill;
  vec3 color = base + vec3(spec) * 0.9 + uAccent * rim;

  // A faint facet wash driven by the normal, so the geometry reads even where
  // the lighting is flat.
  color = mix(color, abs(N) * 0.55 + uAccent * 0.2, uWireMix);

  // Approximate sRGB output. Skipping this is why hand-rolled renderers look
  // washed out next to an engine's.
  gl_FragColor = vec4(pow(clamp(color, 0.0, 1.0), vec3(1.0 / 2.2)), 1.0);
}
`;

/* ── GL helpers ────────────────────────────────────────────────────────────── */

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader failed to compile: ${log}`);
  }
  return shader;
}

function link(gl, vertexSource, fragmentSource) {
  const program = gl.createProgram();
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);

  // Shaders can be deleted once linked; the program holds its own reference.
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program failed to link: ${log}`);
  }
  return program;
}

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
  ];
}

/* ── Renderer ──────────────────────────────────────────────────────────────── */

export function createRenderer(canvas, { accent = '#c3f53c' } = {}) {
  const gl =
    canvas.getContext('webgl2', { antialias: true, alpha: false }) ||
    canvas.getContext('webgl', { antialias: true, alpha: false });

  if (!gl) return null;

  const program = link(gl, VERTEX_SHADER, FRAGMENT_SHADER);

  const attribs = {
    position: gl.getAttribLocation(program, 'aPosition'),
    normal: gl.getAttribLocation(program, 'aNormal'),
  };
  const uniforms = Object.fromEntries(
    ['uProjection', 'uView', 'uModel', 'uNormalMatrix', 'uCamera', 'uAccent', 'uRoughness',
     'uRim', 'uWireMix'].map((name) => [name, gl.getUniformLocation(program, name)]),
  );

  const buffers = {
    position: gl.createBuffer(),
    normal: gl.createBuffer(),
    index: gl.createBuffer(),
  };

  // Reused every frame so the draw loop allocates nothing.
  const projection = new Float32Array(16);
  const view = new Float32Array(16);
  const model = new Float32Array(16);
  const rotationX = new Float32Array(16);
  const rotationY = new Float32Array(16);
  const normals3 = new Float32Array(9);

  let mesh = null;
  let stats = { vertices: 0, triangles: 0 };

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  gl.clearColor(0.035, 0.035, 0.035, 1);

  function setGeometry(next) {
    mesh = next;
    stats = { vertices: next.vertices, triangles: next.triangles };

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.bufferData(gl.ARRAY_BUFFER, next.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.bufferData(gl.ARRAY_BUFFER, next.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, next.indices, gl.STATIC_DRAW);
  }

  /** Resize the drawing buffer to the CSS box, capped so phones stay smooth. */
  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.round(canvas.clientHeight * ratio));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    return canvas.width / canvas.height;
  }

  function render(state) {
    if (!mesh) return;
    const aspect = resize();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);

    perspective((state.fov * Math.PI) / 180, aspect, 0.1, 100, projection);

    const eye = orbitToCartesian(state.distance, state.azimuth, state.elevation);
    lookAt(eye, [0, 0, 0], [0, 1, 0], view);

    fromRotationY(state.spin, rotationY);
    fromRotationX(state.tilt, rotationX);
    multiply(rotationY, rotationX, model);
    normalMatrix(model, normals3);

    gl.uniformMatrix4fv(uniforms.uProjection, false, projection);
    gl.uniformMatrix4fv(uniforms.uView, false, view);
    gl.uniformMatrix4fv(uniforms.uModel, false, model);
    gl.uniformMatrix3fv(uniforms.uNormalMatrix, false, normals3);
    gl.uniform3fv(uniforms.uCamera, eye);
    gl.uniform3fv(uniforms.uAccent, hexToRgb(state.accent || accent));
    gl.uniform1f(uniforms.uRoughness, state.roughness);
    gl.uniform1f(uniforms.uRim, state.rim);
    gl.uniform1f(uniforms.uWireMix, state.facets);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.enableVertexAttribArray(attribs.position);
    gl.vertexAttribPointer(attribs.position, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.enableVertexAttribArray(attribs.normal);
    gl.vertexAttribPointer(attribs.normal, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
  }

  function dispose() {
    gl.deleteProgram(program);
    for (const buffer of Object.values(buffers)) gl.deleteBuffer(buffer);
  }

  return { gl, setGeometry, render, dispose, get stats() { return stats; } };
}

/* ── Page wiring ───────────────────────────────────────────────────────────── */

const root = document.querySelector('[data-renderer]');
if (root) init(root);

function init(root) {
  const canvas = root.querySelector('[data-canvas]');
  const fallback = root.querySelector('[data-fallback]');
  const readout = root.querySelector('[data-readout]');
  const status = root.querySelector('[data-gl-status]');

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  const state = {
    shape: 'knot',
    p: 2,
    q: 3,
    fov: 45,
    distance: 5.6,
    azimuth: 0.6,
    elevation: 0.45,
    spin: 0,
    tilt: 0,
    roughness: 0.35,
    rim: 0.55,
    facets: 0,
    accent: '#c3f53c',
    playing: !reduced.matches,
  };

  let renderer;
  try {
    renderer = createRenderer(canvas, { accent: state.accent });
  } catch (error) {
    // A shader that will not compile is a real failure worth surfacing, not
    // something to swallow into a blank canvas.
    showFallback(`The shader failed to compile: ${error.message}`);
    return;
  }

  if (!renderer) {
    showFallback('This browser does not expose a WebGL context.');
    return;
  }

  function showFallback(message) {
    canvas.hidden = true;
    if (fallback) {
      fallback.hidden = false;
      fallback.textContent = `${message} The controls and the technical notes below describe what it renders.`;
    }
    if (status) status.textContent = 'unavailable';
  }

  /* ── Geometry rebuilds ──────────────────────────────────────────────────── */

  function rebuild() {
    const build = SHAPES[state.shape] || SHAPES.knot;
    renderer.setGeometry(
      state.shape === 'knot' ? build({ p: state.p, q: state.q }) : build({}),
    );
    updateReadout();
  }

  function updateReadout() {
    if (!readout) return;
    const { vertices, triangles } = renderer.stats;
    readout.innerHTML = '';

    const rows = [
      ['shape', state.shape],
      ['verts', vertices.toLocaleString('en-US')],
      ['tris', triangles.toLocaleString('en-US')],
      ['fov', `${state.fov}°`],
    ];
    for (const [key, value] of rows) {
      const line = document.createElement('div');
      line.append(`${key} `);
      const strong = document.createElement('b');
      strong.textContent = String(value);
      line.append(strong);
      readout.append(line);
    }
  }

  /* ── Draw loop ──────────────────────────────────────────────────────────── */

  let frame = null;
  let last = 0;

  function loop(now) {
    const delta = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    if (state.playing) state.spin += delta * 0.35;
    renderer.render(state);
    frame = requestAnimationFrame(loop);
  }

  function start() {
    if (frame === null) {
      last = 0;
      frame = requestAnimationFrame(loop);
    }
  }

  function stop() {
    if (frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  }

  /* ── Camera: pointer ────────────────────────────────────────────────────── */

  let dragging = false;
  let lastPointer = null;

  canvas.addEventListener('pointerdown', (event) => {
    dragging = true;
    lastPointer = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    state.azimuth -= (event.clientX - lastPointer.x) * 0.008;
    state.elevation += (event.clientY - lastPointer.y) * 0.008;
    lastPointer = { x: event.clientX, y: event.clientY };
    if (!state.playing) renderer.render(state);
  });

  const endDrag = () => {
    dragging = false;
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  canvas.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      state.distance = Math.max(2.2, Math.min(12, state.distance + event.deltaY * 0.002));
      if (!state.playing) renderer.render(state);
    },
    { passive: false },
  );

  /* ── Camera: keyboard ───────────────────────────────────────────────────── */

  // The pointer path above is unusable without a mouse, so the canvas is
  // focusable and every camera movement has a key equivalent.
  canvas.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 0.25 : 0.08;
    const moves = {
      ArrowLeft: () => (state.azimuth -= step),
      ArrowRight: () => (state.azimuth += step),
      ArrowUp: () => (state.elevation += step),
      ArrowDown: () => (state.elevation -= step),
      '+': () => (state.distance = Math.max(2.2, state.distance - 0.4)),
      '=': () => (state.distance = Math.max(2.2, state.distance - 0.4)),
      '-': () => (state.distance = Math.min(12, state.distance + 0.4)),
      Home: () => {
        state.azimuth = 0.6;
        state.elevation = 0.45;
        state.distance = 5.6;
      },
    };

    if (moves[event.key]) {
      event.preventDefault();
      moves[event.key]();
      if (!state.playing) renderer.render(state);
    }
  });

  /* ── Controls ───────────────────────────────────────────────────────────── */

  for (const input of root.querySelectorAll('[data-uniform]')) {
    const key = input.dataset.uniform;
    const output = root.querySelector(`[data-out="${key}"]`);

    const sync = () => {
      state[key] = Number(input.value);
      if (output) output.textContent = input.dataset.suffix
        ? `${input.value}${input.dataset.suffix}`
        : input.value;
      if (key === 'p' || key === 'q') rebuild();
      else updateReadout();
      if (!state.playing) renderer.render(state);
    };

    input.addEventListener('input', sync);
    sync();
  }

  for (const input of root.querySelectorAll('[name="shape"]')) {
    input.addEventListener('change', () => {
      if (!input.checked) return;
      state.shape = input.value;
      // The p/q controls only mean anything for the knot.
      for (const control of root.querySelectorAll('[data-knot-only]')) {
        control.hidden = state.shape !== 'knot';
      }
      rebuild();
      if (!state.playing) renderer.render(state);
    });
  }

  const playButton = root.querySelector('[data-play]');
  const playLabel = root.querySelector('[data-play-label]');

  function setPlaying(next) {
    state.playing = next;
    if (playButton) playButton.setAttribute('aria-pressed', String(next));
    if (playLabel) playLabel.textContent = next ? 'Pause' : 'Play';
    if (next) start();
    else {
      stop();
      renderer.render(state);
    }
  }

  playButton?.addEventListener('click', () => setPlaying(!state.playing));

  root.querySelector('[data-reset]')?.addEventListener('click', () => {
    Object.assign(state, { azimuth: 0.6, elevation: 0.45, distance: 5.6, spin: 0, tilt: 0 });
    renderer.render(state);
  });

  /* ── Lifecycle ──────────────────────────────────────────────────────────── */

  // A lost context leaves a permanently blank canvas unless it is handled.
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    stop();
    if (status) status.textContent = 'context lost';
  });

  canvas.addEventListener('webglcontextrestored', () => {
    rebuild();
    if (status) status.textContent = 'restored';
    if (state.playing) start();
  });

  // Never leave a render loop running against a hidden tab.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (state.playing) start();
  });

  reduced.addEventListener('change', (event) => setPlaying(!event.matches));
  window.addEventListener('resize', () => {
    if (!state.playing) renderer.render(state);
  });

  rebuild();
  if (status) {
    status.textContent = renderer.gl instanceof WebGL2RenderingContext ? 'webgl2' : 'webgl1';
  }

  if (state.playing) start();
  else {
    setPlaying(false);
    renderer.render(state);
  }
}
