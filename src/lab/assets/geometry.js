/**
 * Procedural geometry — generated, never loaded.
 *
 * Each builder returns interleaved-free typed arrays ready for WebGL buffers.
 * Vertex counts are kept under 65,536 so 16-bit indices are always enough and
 * the renderer never needs OES_element_index_uint on WebGL 1.
 */

/**
 * A (p, q) torus knot: a tube swept along a curve that winds p times around the
 * torus axis and q times through its hole.
 *
 * The tube needs a coordinate frame at every step along the curve. Rather than
 * a true Frenet frame — which flips unpredictably where curvature vanishes —
 * the normal is derived from the difference of two nearby curve points, which is
 * stable enough for a closed knot and considerably cheaper.
 */
export function torusKnot({
  p = 2,
  q = 3,
  tubularSegments = 200,
  radialSegments = 20,
  radius = 1,
  tube = 0.34,
} = {}) {
  const positions = [];
  const normals = [];
  const indices = [];

  const point = (t, out) => {
    const qt = q * t;
    const pt = p * t;
    const factor = radius * (2 + Math.cos(qt)) * 0.5;
    out[0] = factor * Math.cos(pt);
    out[1] = factor * Math.sin(pt);
    out[2] = radius * Math.sin(qt) * 0.5;
    return out;
  };

  const current = [0, 0, 0];
  const ahead = [0, 0, 0];

  for (let i = 0; i <= tubularSegments; i += 1) {
    const t = (i / tubularSegments) * Math.PI * 2;
    point(t, current);
    point(t + 0.01, ahead);

    // Tangent, then two vectors perpendicular to it.
    const T = norm([ahead[0] - current[0], ahead[1] - current[1], ahead[2] - current[2]]);
    const N = norm([ahead[0] + current[0], ahead[1] + current[1], ahead[2] + current[2]]);
    const B = norm(cross(T, N));
    const N2 = cross(B, T);

    for (let j = 0; j <= radialSegments; j += 1) {
      const v = (j / radialSegments) * Math.PI * 2;
      const cx = -tube * Math.cos(v);
      const cy = tube * Math.sin(v);

      // The normal points from the curve outward to the surface — analytic,
      // so there is no need to average face normals afterwards.
      const nx = cx * N2[0] + cy * B[0];
      const ny = cx * N2[1] + cy * B[1];
      const nz = cx * N2[2] + cy * B[2];

      positions.push(current[0] + nx, current[1] + ny, current[2] + nz);
      normals.push(...norm([nx, ny, nz]));
    }
  }

  for (let i = 1; i <= tubularSegments; i += 1) {
    for (let j = 1; j <= radialSegments; j += 1) {
      const a = (radialSegments + 1) * (i - 1) + (j - 1);
      const b = (radialSegments + 1) * i + (j - 1);
      const c = (radialSegments + 1) * i + j;
      const d = (radialSegments + 1) * (i - 1) + j;
      indices.push(a, b, d, b, c, d);
    }
  }

  return pack(positions, normals, indices);
}

/** UV sphere. Poles are degenerate by construction, which is fine for shading. */
export function sphere({ radius = 1, segments = 48, rings = 32 } = {}) {
  const positions = [];
  const normals = [];
  const indices = [];

  for (let y = 0; y <= rings; y += 1) {
    const v = y / rings;
    const phi = v * Math.PI;

    for (let x = 0; x <= segments; x += 1) {
      const u = x / segments;
      const theta = u * Math.PI * 2;

      const nx = Math.cos(theta) * Math.sin(phi);
      const ny = Math.cos(phi);
      const nz = Math.sin(theta) * Math.sin(phi);

      positions.push(nx * radius, ny * radius, nz * radius);
      normals.push(nx, ny, nz);
    }
  }

  for (let y = 0; y < rings; y += 1) {
    for (let x = 0; x < segments; x += 1) {
      const a = y * (segments + 1) + x;
      const b = a + segments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  return pack(positions, normals, indices);
}

/** A box with hard edges — every face gets its own vertices and flat normals. */
export function box({ size = 1.35 } = {}) {
  const h = size / 2;
  const faces = [
    { normal: [0, 0, 1], corners: [[-h, -h, h], [h, -h, h], [h, h, h], [-h, h, h]] },
    { normal: [0, 0, -1], corners: [[h, -h, -h], [-h, -h, -h], [-h, h, -h], [h, h, -h]] },
    { normal: [0, 1, 0], corners: [[-h, h, h], [h, h, h], [h, h, -h], [-h, h, -h]] },
    { normal: [0, -1, 0], corners: [[-h, -h, -h], [h, -h, -h], [h, -h, h], [-h, -h, h]] },
    { normal: [1, 0, 0], corners: [[h, -h, h], [h, -h, -h], [h, h, -h], [h, h, h]] },
    { normal: [-1, 0, 0], corners: [[-h, -h, -h], [-h, -h, h], [-h, h, h], [-h, h, -h]] },
  ];

  const positions = [];
  const normals = [];
  const indices = [];

  for (const [index, face] of faces.entries()) {
    for (const corner of face.corners) {
      positions.push(...corner);
      normals.push(...face.normal);
    }
    const base = index * 4;
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }

  return pack(positions, normals, indices);
}

export const SHAPES = { knot: torusKnot, sphere, box };

/* ── helpers ───────────────────────────────────────────────────────────────── */

function pack(positions, normals, indices) {
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
    count: indices.length,
    vertices: positions.length / 3,
    triangles: indices.length / 3,
  };
}

function norm(v) {
  const length = Math.hypot(v[0], v[1], v[2]);
  return length ? [v[0] / length, v[1] / length, v[2] / length] : [0, 0, 1];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}
