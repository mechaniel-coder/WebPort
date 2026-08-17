/**
 * Drive the hero surface.
 *
 * Everything here is about *not* running: the shader is fill-rate bound, and a
 * hero animating behind three screens of content is a battery cost with no
 * viewer. It runs when it is visible, on a machine that can draw it, for a
 * reader who wants motion — and never otherwise.
 */
import { createCaustics } from './caustics.js';

const canvas = document.querySelector('[data-caustics]');

if (canvas) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  let scene = null;
  let frame = 0;
  let visible = true;
  let running = false;

  // Wall-clock time would jump forward by however long the tab was hidden,
  // teleporting the water. Accumulating only the frames actually drawn keeps
  // the surface continuous across a pause.
  let elapsed = 0;
  let last = 0;

  try {
    scene = createCaustics(canvas);
  } catch (error) {
    // A shader that fails to compile is a bug, but not one worth showing a
    // visitor a broken hero over.
    scene = null;
  }

  if (!scene) {
    // No WebGL, or the shader would not build. The CSS gradient underneath is
    // already painted and is a complete design on its own, so all that is left
    // is to take the canvas out of the accessibility tree and stop it covering
    // the gradient.
    canvas.hidden = true;
  } else {
    const tick = (now) => {
      if (!running) return;
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
     * Reduced motion does not mean "no hero" — it means no movement. Drawing
     * one frame and stopping gives that reader the same image everyone else
     * sees, just held still, rather than a blank rectangle or a downgrade to
     * a flat colour.
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
     * sleep, or too many contexts on one page will all take it away. Without
     * the preventDefault the browser never fires the restore event, and the
     * hero stays black for the rest of the session.
     */
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      stop();
    });

    canvas.addEventListener('webglcontextrestored', () => {
      try {
        scene = createCaustics(canvas);
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
}
