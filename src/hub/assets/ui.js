/**
 * Hub interaction boot.
 *
 * Widget implementations are shared across all four sites — see
 * /shared/widgets.js.
 */
import { initAll } from '../../shared/widgets.js';

initAll({
  forms: {
    successMessage:
      'Thank you — we would normally reply within one working day. This portfolio has no ' +
      'backend, so nothing was transmitted.',
  },
});
