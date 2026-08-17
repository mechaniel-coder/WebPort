import { mountSurface } from '../../shared/surface.js';
import { createCaustics } from './caustics.js';

mountSurface(document.querySelector('[data-caustics]'), createCaustics);
