/**
 * Minimal 3D maths — the part gl-matrix would normally provide.
 *
 * Column-major, matching what WebGL's uniformMatrix4fv expects with
 * `transpose = false`. Everything is a plain Float32Array of 16 (or 3) floats,
 * so nothing here allocates an object per operation.
 *
 * Column-major means element m[i * 4 + j] is column i, row j — which is the
 * transpose of how the maths is usually written on paper, and the reason the
 * multiply below looks inside-out.
 */

export function identity(out = new Float32Array(16)) {
  out.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  return out;
}

/**
 * Right-handed perspective projection with a [-1, 1] depth range.
 *
 * @param {number} fovY   vertical field of view, radians
 * @param {number} aspect width / height
 */
export function perspective(fovY, aspect, near, far, out = new Float32Array(16)) {
  const f = 1 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);

  out.set([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);
  return out;
}

/** A view matrix placing the camera at `eye`, looking at `target`. */
export function lookAt(eye, target, up, out = new Float32Array(16)) {
  const z = normalize(subtract(eye, target));
  const x = normalize(cross(up, z));
  const y = cross(z, x);

  out.set([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot(x, eye), -dot(y, eye), -dot(z, eye), 1,
  ]);
  return out;
}

/** out = a × b. Order matters: this applies b first, then a. */
export function multiply(a, b, out = new Float32Array(16)) {
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      let sum = 0;
      for (let k = 0; k < 4; k += 1) sum += a[k * 4 + row] * b[column * 4 + k];
      out[column * 4 + row] = sum;
    }
  }
  return out;
}

export function fromRotationY(angle, out = new Float32Array(16)) {
  const s = Math.sin(angle);
  const c = Math.cos(angle);
  out.set([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
  return out;
}

export function fromRotationX(angle, out = new Float32Array(16)) {
  const s = Math.sin(angle);
  const c = Math.cos(angle);
  out.set([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
  return out;
}

export function fromScale(x, y, z, out = new Float32Array(16)) {
  out.set([x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]);
  return out;
}

/**
 * Full 4×4 inverse via cofactor expansion.
 *
 * Needed for the normal matrix. Returns null for a singular matrix rather than
 * quietly producing NaNs that surface later as invisible geometry.
 */
export function invert(m, out = new Float32Array(16)) {
  const [
    a00, a01, a02, a03,
    a10, a11, a12, a13,
    a20, a21, a22, a23,
    a30, a31, a32, a33,
  ] = m;

  const b00 = a00 * a11 - a01 * a10;
  const b01 = a00 * a12 - a02 * a10;
  const b02 = a00 * a13 - a03 * a10;
  const b03 = a01 * a12 - a02 * a11;
  const b04 = a01 * a13 - a03 * a11;
  const b05 = a02 * a13 - a03 * a12;
  const b06 = a20 * a31 - a21 * a30;
  const b07 = a20 * a32 - a22 * a30;
  const b08 = a20 * a33 - a23 * a30;
  const b09 = a21 * a32 - a22 * a31;
  const b10 = a21 * a33 - a23 * a31;
  const b11 = a22 * a33 - a23 * a32;

  const det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) return null;
  const d = 1 / det;

  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * d;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * d;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * d;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * d;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * d;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * d;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * d;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * d;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * d;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * d;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * d;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * d;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * d;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * d;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * d;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * d;

  return out;
}

export function transpose(m, out = new Float32Array(16)) {
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) out[row * 4 + column] = m[column * 4 + row];
  }
  return out;
}

/**
 * The normal matrix: the inverse transpose of the model matrix, upper-left 3×3.
 *
 * Normals are directions, not positions, and they do not survive a non-uniform
 * scale under the model matrix — the surface shears one way and the normal
 * shears with it, so lighting detaches from the geometry. Using the inverse
 * transpose is the correction, and forgetting it looks like a shading bug rather
 * than a maths one.
 */
export function normalMatrix(model, out = new Float32Array(9)) {
  const inverse = invert(model);
  if (!inverse) return identity3(out);
  const t = transpose(inverse);

  out[0] = t[0]; out[1] = t[1]; out[2] = t[2];
  out[3] = t[4]; out[4] = t[5]; out[5] = t[6];
  out[6] = t[8]; out[7] = t[9]; out[8] = t[10];
  return out;
}

function identity3(out) {
  out.set([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  return out;
}

/* ── vec3 ──────────────────────────────────────────────────────────────────── */

export function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

export function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function normalize(v) {
  const length = Math.hypot(v[0], v[1], v[2]);
  return length ? [v[0] / length, v[1] / length, v[2] / length] : [0, 0, 0];
}

/** Spherical coordinates → cartesian. The orbit camera's whole position model. */
export function orbitToCartesian(radius, azimuth, elevation) {
  const clamped = Math.max(-1.5533, Math.min(1.5533, elevation)); // just inside ±90°
  return [
    radius * Math.cos(clamped) * Math.sin(azimuth),
    radius * Math.sin(clamped),
    radius * Math.cos(clamped) * Math.cos(azimuth),
  ];
}
