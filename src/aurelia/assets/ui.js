/**
 * Aurelia interaction boot.
 *
 * The widget implementations are shared across all three sites — see
 * /shared/widgets.js. This file only supplies Aurelia's own copy.
 */
import { initAll } from '../../shared/widgets.js';

initAll({
  forms: {
    successMessage:
      'Thank you — your enquiry has been recorded. This demonstration site does not send mail.',
  },
});
