import { mountSurface } from '../../shared/surface.js';
import { createSignal } from './signal.js';

mountSurface(document.querySelector('[data-signal]'), createSignal);
