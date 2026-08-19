/**
 * The hero surface: refracted light on moving water.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * This site has no photography, and a hotel site with no photography has a
 * hole where its most important asset should be. Flat vector artwork does not
 * fill that hole — it reads as a placeholder waiting for the real image.
 *
 * So rather than imitate a photograph badly, the hero is a thing a photograph
 * cannot be: lit, moving, and different every second. It is honest about being
 * generated, and it gives the page the depth and motion that the eye reads as
 * "finished".
 *
 * ── What it draws ───────────────────────────────────────────────────────────
 *
 * Caustics — the bright web of light cast when a wavy surface focuses sunlight
 * onto the seabed. The usual cheap approximation is layered sine waves, which
 * reads as fabric rather than water because real caustics are *sharp*: light
 * piles up along fold lines and falls away fast either side.
 *
 * The trick used here is domain-warped gradient noise pushed through a high
 * power curve. Warping the sample position by another noise field gives the
 * turning, folding motion of a water surface; raising the result to a high
 * exponent compresses everything except the peaks into darkness, which is what
 * produces the thin bright filaments instead of soft blobs.
 *
 * A full ray-traced version would refract through an actual heightfield. At
 * 60fps in a hero banner, this is the honest trade: perceptually the same
 * phenomenon for a fraction of the cost.
 *
 * ── Cost ────────────────────────────────────────────────────────────────────
 *
 * One triangle and one fragment shader. The whole thing is fill-rate bound,
 * which is why it renders at a capped device pixel ratio and pauses the moment
 * it leaves the viewport — a hero animating behind three screens of content is
 * pure battery drain.
 */

const VERTEX = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAGMENT = `
precision highp float;

uniform vec2  uResolution;
uniform float uTime;
uniform vec3  uDeep;
uniform vec3  uShallow;
uniform vec3  uLight;

/* ── Value noise ───────────────────────────────────────────────────────────
 * Hash-based gradient noise. Deterministic, so the surface is identical on
 * every machine and every reload — the same reason the rest of this portfolio
 * seeds its generators rather than calling Math.random().
 */
vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);   // smoothstep, so the field is C1 continuous
  return mix(
    mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
        dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y);
}

/* Four octaves. Each halves the amplitude and doubles the frequency, which is
   what gives a surface detail at more than one scale — the difference between
   water and a lava lamp. */
float fbm(vec2 p) {
  float total = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    total += amplitude * noise(p);
    p *= 2.02;              // not exactly 2.0, so octaves do not align into grid artefacts
    amplitude *= 0.5;
  }
  return total;
}

void main() {
  // Aspect-corrected coordinates, so the pattern does not stretch on a wide
  // viewport. Scale is in "waves across the screen".
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
  p *= 3.4;

  float t = uTime * 0.085;

  // Domain warp: sample the noise field at a position that is itself displaced
  // by another noise field. One level of this turns drifting blobs into
  // something that folds and shears the way a water surface does.
  vec2 warp = vec2(
    fbm(p + vec2(0.0, t)),
    fbm(p + vec2(5.2, -t * 0.8) + 1.3)
  );
  float field = fbm(p + 2.1 * warp + vec2(t * 0.35, 0.0));

  // Fold the signed field around zero and invert, so the *ridges* are bright.
  // Then the power curve: this is the line that decides between "soft clouds"
  // and "caustics". Everything below the peak is crushed toward black.
  float ridge = 1.0 - abs(field) * 2.2;
  ridge = clamp(ridge, 0.0, 1.0);
  float caustic = pow(ridge, 7.0);

  // A second, slower, larger-scale pass. Real caustics have a coarse structure
  // moving under the fine one; a single frequency looks mechanical.
  vec2 q = p * 0.55 - vec2(t * 0.22, t * 0.1);
  float coarse = pow(clamp(1.0 - abs(fbm(q)) * 2.0, 0.0, 1.0), 4.0);

  float light = caustic * 0.75 + coarse * 0.45;

  // Depth gradient: darker at the bottom of the frame, where the text sits.
  // This is art direction rather than physics — it is what lets the headline
  // clear AA contrast without a heavy scrim over the whole image.
  float depth = smoothstep(-0.1, 1.05, uv.y);
  vec3 water = mix(uDeep, uShallow, depth);

  // Light falls off toward the bottom too, so the caustics concentrate up near
  // the horizon and leave the lower third calm enough to set type over.
  vec3 colour = water + uLight * light * smoothstep(0.0, 0.85, uv.y);

  // Vignette. Subtle — enough to hold the eye in frame, not enough to notice.
  float r = length((uv - 0.5) * vec2(1.15, 1.0));
  colour *= 1.0 - 0.38 * smoothstep(0.35, 0.95, r);

  // Ordered dither before the 8-bit truncation. Without it, a gradient this
  // gradual bands into visible steps on exactly the large flat areas the
  // design depends on. One line, and it is the difference between a surface
  // that looks lit and one that looks like a compression artefact.
  float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  colour += (dither - 0.5) / 255.0;

  // Linear to sRGB. Skipping this is why hand-written shaders so often look
  // washed out next to an engine's output.
  colour = pow(max(colour, 0.0), vec3(1.0 / 2.2));

  gl_FragColor = vec4(colour, 1.0);
}`;

/*
 * Linear-light values: the shader applies the sRGB transfer curve at the end,
 * so these are pre-gamma and look darker here than they render.
 *
 * The previous light colour was a warm sandy yellow, which is what caustics do
 * in a Mediterranean swimming pool and not what they do in the Pacific eighty
 * miles north of San Francisco. Cold water under a marine layer throws a pale
 * green-white. The deep and shallow tones are the cypress and sea-glass the
 * page uses for ink and accent, so the hero and the type are the same decision.
 */
const PALETTE = {
  deep: [0.0078, 0.0329, 0.0303],
  shallow: [0.0385, 0.1835, 0.145],
  light: [0.6, 0.82, 0.75],
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

export function createCaustics(canvas) {
  const gl =
    canvas.getContext('webgl', { antialias: false, alpha: false, depth: false }) ||
    canvas.getContext('experimental-webgl', { antialias: false, alpha: false });

  // No WebGL, or a blocked/software-blacklisted context. The caller falls back
  // to the CSS gradient already painted behind the canvas.
  if (!gl) return null;

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`link: ${gl.getProgramInfoLog(program)}`);
  }
  gl.useProgram(program);

  // One oversized triangle rather than two forming a quad. It covers the
  // viewport with three vertices instead of six, and — the part that actually
  // matters — there is no diagonal seam down the middle, so the GPU never
  // rasterises the shared edge twice.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniform = (name) => gl.getUniformLocation(program, name);
  const uResolution = uniform('uResolution');
  const uTime = uniform('uTime');

  gl.uniform3fv(uniform('uDeep'), PALETTE.deep);
  gl.uniform3fv(uniform('uShallow'), PALETTE.shallow);
  gl.uniform3fv(uniform('uLight'), PALETTE.light);

  let width = 0;
  let height = 0;

  function resize() {
    // Cap the pixel ratio at 1.5. This shader is fill-rate bound, so a 3× ratio
    // on a phone costs 4× the work for a pattern with no hard edges to sharpen.
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
