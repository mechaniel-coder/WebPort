/**
 * A Verlet integrator and constraint solver, written by hand.
 *
 * Position-based dynamics. No velocities are stored: a particle remembers where
 * it was last frame, and its velocity is implied by the gap between then and
 * now. That makes constraints trivial to satisfy — you move points directly and
 * the velocity follows for free, rather than having to compute impulses.
 *
 *   x' = x + (x - xPrev) * damping + a * dt²
 *
 * The trade is that stiffness is not a physical quantity here but an iteration
 * count. One relaxation pass gives rubber; twenty give steel and cost frames.
 */

export class World {
  constructor({ gravity = 900, damping = 0.995, iterations = 6, bounds } = {}) {
    this.gravity = gravity;
    this.damping = damping;
    this.iterations = iterations;
    this.bounds = bounds || { width: 800, height: 500 };

    /** Flat typed arrays rather than objects — this loop runs 60 times a second. */
    this.x = [];
    this.y = [];
    this.px = [];
    this.py = [];
    this.pinned = [];

    this.constraints = [];
    this.count = 0;
  }

  addPoint(x, y, { pinned = false } = {}) {
    this.x.push(x);
    this.y.push(y);
    this.px.push(x);
    this.py.push(y);
    this.pinned.push(pinned);
    return this.count++;
  }

  addConstraint(a, b, { stiffness = 1, tearAt = Infinity } = {}) {
    const dx = this.x[b] - this.x[a];
    const dy = this.y[b] - this.y[a];
    this.constraints.push({
      a,
      b,
      rest: Math.hypot(dx, dy),
      stiffness,
      tearAt,
      broken: false,
    });
  }

  /** Verlet step: derive the new position from the previous two. */
  integrate(dt) {
    const gravityStep = this.gravity * dt * dt;

    for (let i = 0; i < this.count; i += 1) {
      if (this.pinned[i]) continue;

      const vx = (this.x[i] - this.px[i]) * this.damping;
      const vy = (this.y[i] - this.py[i]) * this.damping;

      this.px[i] = this.x[i];
      this.py[i] = this.y[i];

      this.x[i] += vx;
      this.y[i] += vy + gravityStep;
    }
  }

  /**
   * Relax every distance constraint, several times.
   *
   * Each pass moves the two endpoints half the error each (or all of it, if one
   * is pinned). No single pass satisfies everything — later constraints undo
   * earlier ones — so the system converges by repetition rather than solving.
   */
  solve() {
    for (let pass = 0; pass < this.iterations; pass += 1) {
      for (const constraint of this.constraints) {
        if (constraint.broken) continue;

        const { a, b, rest, stiffness } = constraint;
        const dx = this.x[b] - this.x[a];
        const dy = this.y[b] - this.y[a];
        const distance = Math.hypot(dx, dy) || 0.0001;

        // Tearing: once a link is stretched past its limit it is gone for good.
        if (distance > rest * constraint.tearAt) {
          constraint.broken = true;
          continue;
        }

        const difference = ((distance - rest) / distance) * 0.5 * stiffness;
        const offsetX = dx * difference;
        const offsetY = dy * difference;

        const aFree = !this.pinned[a];
        const bFree = !this.pinned[b];

        // A pinned endpoint takes none of the correction, so the free one takes
        // all of it — otherwise pinned points slowly drift.
        if (aFree && bFree) {
          this.x[a] += offsetX;
          this.y[a] += offsetY;
          this.x[b] -= offsetX;
          this.y[b] -= offsetY;
        } else if (aFree) {
          this.x[a] += offsetX * 2;
          this.y[a] += offsetY * 2;
        } else if (bFree) {
          this.x[b] -= offsetX * 2;
          this.y[b] -= offsetY * 2;
        }
      }

      this.constrainToBounds();
    }
  }

  constrainToBounds() {
    const { width, height } = this.bounds;
    const bounce = 0.4;

    for (let i = 0; i < this.count; i += 1) {
      if (this.pinned[i]) continue;

      if (this.x[i] < 0) {
        this.x[i] = 0;
        this.px[i] = this.x[i] + (this.px[i] - this.x[i]) * bounce;
      } else if (this.x[i] > width) {
        this.x[i] = width;
        this.px[i] = this.x[i] + (this.px[i] - this.x[i]) * bounce;
      }

      if (this.y[i] > height) {
        this.y[i] = height;
        this.px[i] += (this.x[i] - this.px[i]) * 0.25; // ground friction
        this.py[i] = this.y[i] + (this.py[i] - this.y[i]) * bounce;
      } else if (this.y[i] < 0) {
        this.y[i] = 0;
        this.py[i] = this.y[i] + (this.py[i] - this.y[i]) * bounce;
      }
    }
  }

  step(dt) {
    this.integrate(dt);
    this.solve();
  }

  /** Nearest point to a coordinate, within a radius. Used for grabbing. */
  nearest(x, y, radius = 40) {
    let best = -1;
    let bestDistance = radius * radius;

    for (let i = 0; i < this.count; i += 1) {
      const dx = this.x[i] - x;
      const dy = this.y[i] - y;
      const distance = dx * dx + dy * dy;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    }
    return best;
  }

  /** Push points away from a moving pointer — the "wind" interaction. */
  repel(x, y, radius, strength) {
    const radiusSquared = radius * radius;

    for (let i = 0; i < this.count; i += 1) {
      if (this.pinned[i]) continue;
      const dx = this.x[i] - x;
      const dy = this.y[i] - y;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared > radiusSquared || distanceSquared === 0) continue;

      const distance = Math.sqrt(distanceSquared);
      const falloff = (1 - distance / radius) * strength;
      this.x[i] += (dx / distance) * falloff;
      this.y[i] += (dy / distance) * falloff;
    }
  }

  /** Cut every constraint crossing a point — the tearing tool. */
  cut(x, y, radius = 18) {
    let cutCount = 0;
    for (const constraint of this.constraints) {
      if (constraint.broken) continue;
      const mx = (this.x[constraint.a] + this.x[constraint.b]) / 2;
      const my = (this.y[constraint.a] + this.y[constraint.b]) / 2;
      if (Math.hypot(mx - x, my - y) < radius) {
        constraint.broken = true;
        cutCount += 1;
      }
    }
    return cutCount;
  }

  get intact() {
    let total = 0;
    for (const constraint of this.constraints) if (!constraint.broken) total += 1;
    return total;
  }
}

/* ── Structures ────────────────────────────────────────────────────────────── */

/** A grid of points pinned along the top edge. The classic cloth. */
export function buildCloth(world, { cols = 26, rows = 18, spacing = 22, originX, originY }) {
  const index = (col, row) => row * cols + col;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      world.addPoint(originX + col * spacing, originY + row * spacing, {
        // Every fourth point along the top, so the cloth swags between pins.
        pinned: row === 0 && col % 4 === 0,
      });
    }
  }

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (col < cols - 1) {
        world.addConstraint(index(col, row), index(col + 1, row), { tearAt: 3.2 });
      }
      if (row < rows - 1) {
        world.addConstraint(index(col, row), index(col, row + 1), { tearAt: 3.2 });
      }
    }
  }
}

/** A chain hanging from one pinned end. */
export function buildRope(world, { links = 24, spacing = 16, originX, originY }) {
  let previous = -1;
  for (let i = 0; i < links; i += 1) {
    const point = world.addPoint(originX, originY + i * spacing, { pinned: i === 0 });
    if (previous >= 0) world.addConstraint(previous, point, { stiffness: 1 });
    previous = point;
  }
}

/** A square net pinned at all four corners. */
export function buildNet(world, { size = 16, spacing = 26, originX, originY }) {
  const index = (col, row) => row * size + col;

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const corner =
        (row === 0 || row === size - 1) && (col === 0 || col === size - 1);
      world.addPoint(originX + col * spacing, originY + row * spacing, { pinned: corner });
    }
  }

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (col < size - 1) world.addConstraint(index(col, row), index(col + 1, row), { tearAt: 2.6 });
      if (row < size - 1) world.addConstraint(index(col, row), index(col, row + 1), { tearAt: 2.6 });
    }
  }
}

export const STRUCTURES = { cloth: buildCloth, net: buildNet, rope: buildRope };
