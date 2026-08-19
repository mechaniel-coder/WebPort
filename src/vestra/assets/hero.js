/**
 * Drive the cloth hero.
 *
 * The lifecycle — pausing off-screen, pausing on a hidden tab, one still frame
 * under reduced motion, context-loss recovery — all comes from the shared
 * surface driver. Only the pointer interaction is specific to this hero.
 */
import { mountSurface } from '../../shared/surface.js';
import { createDrape } from './drape.js';

const canvas = document.querySelector('[data-drape]');

if (canvas) {
  const scene = { current: null };

  mountSurface(canvas, (element) => {
    const drape = createDrape(element, {
      weave: element.dataset.weave || 'twill',
      warp: element.dataset.warp || '#4a4d55',
      weft: element.dataset.weft || '#6b6f79',
    });
    if (!drape) return null;
    // Start from rest, so the first painted frame is hanging cloth rather than
    // a flat sheet mid-fall.
    drape.settle();
    scene.current = drape;
    return drape;
  });

  // Pointer push. `pointermove` rather than mousemove so a touch drag works,
  // and passive because this never calls preventDefault — the page must keep
  // scrolling normally over the hero.
  canvas.addEventListener(
    'pointermove',
    (event) => {
      if (!scene.current) return;
      scene.current.push(event.clientX, event.clientY, event.pointerType === 'touch' ? 0.6 : 1);
    },
    { passive: true },
  );
}
