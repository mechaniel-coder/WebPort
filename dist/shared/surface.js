/**
 * Run a shader-backed hero canvas.
 *
 * Both Aurelia and Northwind have a full-bleed animated hero, and the shaders
 * are the only part that differs. Everything around them — when to draw, when
 * to stop, what to do when the GPU takes the context away, what a reader who
 * asked for less motion gets — is identical, and is where all the actual
 * difficulty is. So it lives here once.
 *
 * The caller supplies a factory that returns `{ draw(seconds), resize() }` or
 * null when WebGL is unavailable.
 *
 * Almost everything below is about *not* running. These shaders are fill-rate
 * bound, and a hero animating behind three screens of content is a battery cost
 * with no viewer.
 */
export function mountSurface(canvas, createScene) {
  if (!canvas) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  let scene = null;
  let frame = 0;
  let visible = true;
  let running = false;

  // Wall-clock time would jump forward by however long the tab was hidden,
  // teleporting the animation. Accumulating only the frames actually drawn
  // keeps it continuous across a pause.
  let elapsed = 0;
  let last = 0;

  try {
    scene = createScene(canvas);
  } catch {
    // A shader that fails to compile is a bug, but not one worth showing a
    // visitor a broken hero over.
    scene = null;
  }

  if (!scene) {
    // No WebGL, or the shader would not build. Every hero using this sits on a
    // CSS gradient that is a complete design by itself, so hiding the canvas
    // reveals a finished page rather than a hole.
    canvas.hidden = true;
    return;
  }

  const tick = (now) => {
    if (!running) return;
    // Clamp the delta so a long frame cannot advance the animation by a
    // visible jump.
    const delta = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    elapsed += delta;
    scene.draw(elapsed);
    frame = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running) return;
    running = true;
    last = 0;
    frame = requestAnimationFrame(tick);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(frame);
  };

  /**
   * A single still frame.
   *
   * Reduced motion does not mean "no hero" — it means no movement. Drawing one
   * frame and stopping gives that reader the same image everyone else sees,
   * held still, rather than a blank rectangle or a downgrade to flat colour.
   */
  const still = () => {
    stop();
    scene.resize();
    scene.draw(12.5); // an arbitrary but fixed moment, so it is reproducible
  };

  const decide = () => {
    if (reduced.matches || !visible) still();
    else start();
  };

  // Pause once the hero is scrolled past. `rootMargin` keeps it running just
  // off-screen so scrolling back up never catches a frozen frame.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        decide();
      },
      { rootMargin: '120px' },
    ).observe(canvas);
  }

  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    decide();
  });

  // Some browsers only expose this as an `onchange` property.
  if (reduced.addEventListener) reduced.addEventListener('change', decide);
  else if (reduced.addListener) reduced.addListener(decide);

  /**
   * Context loss is routine, not exceptional: switching GPUs, waking from
   * sleep, or too many contexts on one page will all take it away. Without the
   * preventDefault the browser never fires the restore event, and the hero
   * stays black for the rest of the session.
   */
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    stop();
  });

  canvas.addEventListener('webglcontextrestored', () => {
    try {
      scene = createScene(canvas);
      decide();
    } catch {
      canvas.hidden = true;
    }
  });

  window.addEventListener('resize', () => {
    if (!running) still();
  });

  decide();
}
