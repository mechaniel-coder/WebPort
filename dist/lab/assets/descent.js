/**
 * Scroll-driven storytelling, without taking the scrollbar.
 *
 * The rules this piece holds to:
 *   · the page scrolls natively — no wheel interception, no smooth-scroll
 *     library, no animated scrollTop. The visualisation reads scroll position;
 *     it never writes it.
 *   · the prose is the content. With JavaScript off, or reduced motion set, the
 *     article is complete and the canvas simply never appears.
 *   · the numbers are real physics, not keyframes. Depth drives pressure via the
 *     hydrostatic relation, volume via Boyle's law, and colour via Beer–Lambert
 *     attenuation per wavelength.
 */

/* ── Physics ───────────────────────────────────────────────────────────────── */

/** Absolute pressure in atmospheres: one at the surface, one more per 10 m. */
export function pressureAt(depth) {
  return 1 + depth / 10;
}

/** Boyle's law at constant temperature: P₁V₁ = P₂V₂. */
export function lungVolumeAt(depth, surfaceVolume = 6) {
  return surfaceVolume / pressureAt(depth);
}

/**
 * Beer–Lambert attenuation, per channel.
 *
 * Long wavelengths are absorbed fastest, which is why red vanishes in the first
 * few metres and the deep ocean is blue rather than merely dark. These
 * coefficients are for clear open water, in reciprocal metres.
 */
const EXTINCTION = { r: 0.2, g: 0.05, b: 0.03 };

export function lightAt(depth) {
  return {
    r: Math.exp(-EXTINCTION.r * depth),
    g: Math.exp(-EXTINCTION.g * depth),
    b: Math.exp(-EXTINCTION.b * depth),
  };
}

/* ── Stage ─────────────────────────────────────────────────────────────────── */

function init(root) {
  const canvas = root.querySelector('[data-canvas]');
  const track = root.querySelector('[data-track]');
  const scenes = [...root.querySelectorAll('[data-scene]')];
  const readouts = {
    depth: root.querySelector('[data-depth]'),
    pressure: root.querySelector('[data-pressure]'),
    volume: root.querySelector('[data-volume]'),
    light: root.querySelector('[data-light]'),
  };

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const context = canvas.getContext('2d');

  const MAX_DEPTH = 100;
  let depth = 0;
  let target = 0;
  let frame = null;

  /* ── Reading scroll position ────────────────────────────────────────────── */

  /**
   * Progress through the story, 0–1.
   *
   * Derived from the track's own rectangle rather than window.scrollY, so it is
   * correct inside any container and needs no knowledge of page layout.
   */
  function progress() {
    const box = track.getBoundingClientRect();
    const scrollable = box.height - window.innerHeight;
    if (scrollable <= 0) return 0;
    return Math.max(0, Math.min(1, -box.top / scrollable));
  }

  function measure() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  /* ── Drawing ────────────────────────────────────────────────────────────── */

  function draw(atDepth) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    context.clearRect(0, 0, width, height);

    // The water column: each row is the colour of light surviving to the depth
    // that row represents, so the gradient is computed rather than designed.
    const rows = 60;
    for (let i = 0; i < rows; i += 1) {
      const rowDepth = atDepth + (i / rows) * 45;
      const light = lightAt(Math.max(0, rowDepth));
      const r = Math.round(light.r * 40);
      const g = Math.round(light.g * 120);
      const b = Math.round(light.b * 190);
      context.fillStyle = `rgb(${r + 4}, ${g + 8}, ${b + 16})`;
      context.fillRect(0, (i / rows) * height, width, height / rows + 1);
    }

    drawScale(width, height, atDepth);
    drawDiver(width, height);
    drawLungs(width, height, atDepth);
  }

  /** A depth ruler that scrolls past as the diver descends. */
  function drawScale(width, height, atDepth) {
    context.font = '10px ui-monospace, monospace';
    context.textBaseline = 'middle';

    const metresVisible = 45;
    for (let m = Math.floor(atDepth / 5) * 5; m < atDepth + metresVisible; m += 5) {
      if (m < 0) continue;
      const y = ((m - atDepth) / metresVisible) * height;
      const major = m % 20 === 0;

      context.strokeStyle = major ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)';
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(width - (major ? 34 : 20), y);
      context.lineTo(width - 8, y);
      context.stroke();

      if (major) {
        context.fillStyle = 'rgba(255,255,255,0.55)';
        context.textAlign = 'right';
        context.fillText(`${m}`, width - 40, y);
      }
    }
  }

  /** The diver stays put; the water moves. That is what falling looks like. */
  function drawDiver(width, height) {
    const x = width * 0.38;
    const y = height * 0.42;

    context.strokeStyle = 'rgba(255,255,255,0.85)';
    context.lineWidth = 2;
    context.lineCap = 'round';

    context.beginPath();
    context.arc(x, y, 5, 0, Math.PI * 2); // head
    context.moveTo(x, y + 5);
    context.lineTo(x, y + 24); // body
    context.moveTo(x, y + 10);
    context.lineTo(x - 9, y - 4); // arms, streamlined overhead
    context.moveTo(x, y + 10);
    context.lineTo(x + 9, y - 4);
    context.moveTo(x, y + 24);
    context.lineTo(x - 5, y + 42); // legs
    context.moveTo(x, y + 24);
    context.lineTo(x + 5, y + 42);
    context.stroke();
  }

  /** Lung volume as an area, because volume is what Boyle's law is about. */
  function drawLungs(width, height, atDepth) {
    const volume = lungVolumeAt(atDepth);
    const full = 6;
    const maxRadius = Math.min(width, height) * 0.075;
    const radius = maxRadius * Math.sqrt(volume / full);

    const x = width * 0.14;
    const y = height * 0.78;

    context.strokeStyle = 'rgba(255,255,255,0.25)';
    context.setLineDash([2, 3]);
    context.lineWidth = 1;
    context.beginPath();
    context.arc(x, y, maxRadius, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([]);

    context.fillStyle = '#4fd8ff';
    context.globalAlpha = 0.85;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 1;

    context.fillStyle = 'rgba(255,255,255,0.7)';
    context.font = '10px ui-monospace, monospace';
    context.textAlign = 'center';
    context.fillText(`${volume.toFixed(1)} L`, x, y + maxRadius + 14);
  }

  function updateReadouts(atDepth) {
    const light = lightAt(atDepth);
    if (readouts.depth) readouts.depth.textContent = `${Math.round(atDepth)} m`;
    if (readouts.pressure) readouts.pressure.textContent = `${pressureAt(atDepth).toFixed(1)} atm`;
    if (readouts.volume) readouts.volume.textContent = `${lungVolumeAt(atDepth).toFixed(2)} L`;
    if (readouts.light) {
      const surface = ((light.r + light.g + light.b) / 3) * 100;
      readouts.light.textContent = surface < 1 ? `${surface.toFixed(2)}%` : `${surface.toFixed(1)}%`;
    }
  }

  /* ── Loop ───────────────────────────────────────────────────────────────── */

  // Scroll fires far more often than a frame renders, so the handler only
  // records a target and the rAF loop does the work.
  function onScroll() {
    target = progress() * MAX_DEPTH;
    if (frame === null) frame = requestAnimationFrame(tick);
  }

  function tick() {
    // Ease toward the target so a flung scroll does not strobe.
    depth += (target - depth) * 0.18;
    if (Math.abs(target - depth) < 0.05) depth = target;

    draw(depth);
    updateReadouts(depth);

    frame = Math.abs(target - depth) > 0.05 ? requestAnimationFrame(tick) : null;
  }

  /* ── Scene highlighting ─────────────────────────────────────────────────── */

  // Marks the scene nearest the middle of the viewport, purely as emphasis —
  // no scene is ever hidden, so nothing depends on this running.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.dataset.active = String(entry.isIntersecting);
      }
    },
    { rootMargin: '-45% 0px -45% 0px' },
  );
  for (const scene of scenes) observer.observe(scene);

  // Only once the observer is actually running may the stylesheet dim inactive
  // scenes. Without this flag, a failed script would leave every scene faded.
  const sceneList = root.querySelector('[data-scenes]');
  if (sceneList) sceneList.dataset.observed = '';

  /* ── Boot ───────────────────────────────────────────────────────────────── */

  if (reduced.matches) {
    // Static frame at the deepest point, and the story reads as prose.
    root.dataset.motion = 'reduced';
    measure();
    draw(MAX_DEPTH);
    updateReadouts(MAX_DEPTH);
    return;
  }

  measure();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    measure();
    draw(depth);
  });

  onScroll();
  draw(depth);
  updateReadouts(depth);
}

/* ── Boot ──────────────────────────────────────────────────────────────────── */

// Deliberately last. `init` reaches the module-level constants above it, and a
// call at the top of the file runs before they leave the temporal dead zone.
const root = document.querySelector('[data-descent]');
if (root) init(root);
