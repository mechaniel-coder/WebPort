/**
 * The hero surface: telemetry moving through a system.
 *
 * ── Why not the same shader as Aurelia ──────────────────────────────────────
 *
 * Aurelia's hero is water because Aurelia is on a cliff. Reusing it here would
 * be decoration bolted onto a different product — the thing that makes a hero
 * feel expensive is that it could not belong to any other site.
 *
 * So this one draws what the product looks at: requests travelling along lanes
 * between services, most of them fast and unremarkable, a few of them slow and
 * bright. It is the shape of a trace waterfall, which is the single view an
 * engineer evaluating an observability tool has spent the most hours staring
 * at.
 *
 * ── How it is drawn ─────────────────────────────────────────────────────────
 *
 * Everything is computed per-pixel from the y coordinate, with no geometry:
 *
 *   1. The frame is divided into horizontal lanes.
 *   2. Each lane gets a deterministic speed, offset and brightness from a hash
 *      of its index, so lanes do not pulse in unison — the giveaway of a
 *      generated background is everything sharing one clock.
 *   3. Within a lane, a travelling packet is a smooth pulse in x. Its width is
 *      its duration, so a slow request is visibly a longer streak.
 *   4. A faint grid underneath gives the field a floor to sit on, and reads as
 *      the axis of a chart without pretending to be one.
 *
 * The colours come from the site's own chart palette, which was already
 * validated for colour-vision deficiency against this surface. Inventing a new
 * set here would put unvalidated colour on the most prominent element.
 */

const VERTEX = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const FRAGMENT = `
precision highp float;

uniform vec2  uResolution;
uniform float uTime;
uniform vec3  uAccent;
uniform vec3  uWarn;
uniform vec3  uGood;

float hash(float n) { return fract(sin(n * 127.1) * 43758.5453123); }

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;

  // Aspect-aware lane count: keep lanes roughly the same height in pixels
  // whatever the viewport, rather than squashing more in as it gets shorter.
  float lanes = clamp(floor(uResolution.y / 46.0), 8.0, 26.0);
  float laneIndex = floor(uv.y * lanes);
  float laneY = fract(uv.y * lanes);

  // Per-lane character, fixed for the life of the page.
  float speed  = 0.05 + hash(laneIndex * 1.7) * 0.22;
  float offset = hash(laneIndex * 3.3);
  float weight = 0.35 + hash(laneIndex * 5.9) * 0.65;

  vec3 colour = vec3(0.0);
  float light = 0.0;

  // Three packets per lane, spaced so they rarely overlap.
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float seed = laneIndex * 7.0 + fi * 13.0;

    // Position wraps at 1.0. Adding the packet index spreads them around the
    // lane instead of stacking them at the same phase.
    float pos = fract(uTime * speed + offset + fi * 0.37);

    // Duration → streak length. The long tail on a few of them is the point:
    // a system where every request takes the same time has nothing to observe.
    float slow = hash(seed) > 0.86 ? 1.0 : 0.0;
    float len = mix(0.05, 0.26, hash(seed + 1.0)) * (1.0 + slow * 1.8);

    // Distance behind the packet head, along the lane.
    float d = pos - uv.x;
    if (d < 0.0) d += 1.0;

    // A hard head with an exponential tail, which is what a moving light
    // actually looks like and what a symmetric gaussian never does.
    float body = smoothstep(len, 0.0, d) * exp(-d / (len * 0.55));

    // Vertical falloff inside the lane, so packets are filaments not bars.
    float across = exp(-pow(abs(laneY - 0.5) * 7.0, 2.0));

    float intensity = body * across * weight;
    light += intensity;
    colour += mix(uAccent, slow > 0.5 ? uWarn : uGood, hash(seed + 2.0) * 0.55) * intensity;
  }

  // The grid. Deliberately faint — it is a floor, not a chart.
  float gridY = smoothstep(0.985, 1.0, abs(laneY * 2.0 - 1.0)) * 0.035;
  float gridX = smoothstep(0.99, 1.0, abs(fract(uv.x * 28.0) * 2.0 - 1.0)) * 0.018;

  colour += vec3(0.35, 0.42, 0.55) * (gridY + gridX);
  light += (gridY + gridX) * 2.0;

  // Fade toward the bottom, where the headline and buttons sit. The type has to
  // clear AA against the densest frame this can produce, and the cheapest way
  // to guarantee that is to make sure the dense part is never down there.
  float mask = smoothstep(-0.15, 0.75, uv.y);
  // And fade at the left, so the first column of text sits on clean ground.
  mask *= mix(0.25, 1.0, smoothstep(0.0, 0.55, uv.x));

  colour *= mask;
  light *= mask;

  /* ── Ink, not light ─────────────────────────────────────────────────────
   *
   * The page around this is a cold white, so the traces are laid down as ink on
   * it rather than added as glow to a dark field. The accumulated density is
   * subtracted from the base to darken the ground, and subtracting the
   * complement of the packet's own hue keeps that darkening tinted rather than
   * merely grey. Clamped, so a pile-up of overlapping packets saturates to a
   * solid mark instead of wrapping to a bright one.
   *
   * The headline sits on top of this at --text-primary, and the mask above
   * guarantees the lower-left quadrant it occupies stays close to the base.
   */
  vec3 base = vec3(0.87, 0.885, 0.91);
  vec3 tint = light > 0.0 ? colour / max(light, 0.001) : vec3(1.0);
  colour = base - light * 0.85 * (vec3(1.0) - tint * 0.8);
  colour = clamp(colour, vec3(0.0), vec3(1.0));

  // Dither before 8-bit truncation, or the long gradients band.
  float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  colour += (dither - 0.5) / 255.0;

  colour = pow(max(colour, 0.0), vec3(1.0 / 2.2));
  gl_FragColor = vec4(colour, 1.0);
}`;

/*
 * Taken from the site's chart palette rather than invented here — the same
 * violet, cyan and red the dashboard uses, which are the three that survive all
 * three dichromacies with 44 dE between the closest pair. See the note beside
 * `.dashboard` in northwind.css for why the previous set did not.
 */
const PALETTE = {
  accent: [0.643, 0.424, 0.898], // --series-1, violet
  warn: [0.867, 0.294, 0.341], // --series-3, red — the slow packets
  good: [0.482, 0.878, 0.878], // --series-2, cyan
};

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`shader: ${log}`);
  }
  return shader;
}

export function createSignal(canvas) {
  const gl =
    canvas.getContext('webgl', { antialias: false, alpha: false, depth: false }) ||
    canvas.getContext('experimental-webgl', { antialias: false, alpha: false });
  if (!gl) return null;

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`link: ${gl.getProgramInfoLog(program)}`);
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniform = (name) => gl.getUniformLocation(program, name);
  const uResolution = uniform('uResolution');
  const uTime = uniform('uTime');
  gl.uniform3fv(uniform('uAccent'), PALETTE.accent);
  gl.uniform3fv(uniform('uWarn'), PALETTE.warn);
  gl.uniform3fv(uniform('uGood'), PALETTE.good);

  let width = 0;
  let height = 0;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.round(canvas.clientWidth * ratio);
    const h = Math.round(canvas.clientHeight * ratio);
    if (w === width && h === height) return;
    width = canvas.width = w;
    height = canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uResolution, w, h);
  }

  function draw(seconds) {
    resize();
    gl.uniform1f(uTime, seconds);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  return { gl, draw, resize, canvas };
}
