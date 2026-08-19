/**
 * Checkout.
 *
 * Collects a delivery address, validates it, and stops. There is no payment
 * step because there is no payment processor and no server — a form that looked
 * like one would be a lie, and a card field with nowhere to send a number is a
 * genuinely harmful thing to put on a page.
 */
import { colourways, garmentBySlug } from './data.js';
import { sizeLabel } from './fit.js';
import { getBag, money, onBagChange, totals } from './bag.js';

const root = document.querySelector('[data-checkout]');

if (root) {
  const empty = root.querySelector('[data-checkout-empty]');
  const filled = root.querySelector('[data-checkout-filled]');
  const lines = root.querySelector('[data-checkout-lines]');
  const summary = root.querySelector('[data-checkout-summary]');
  const form = root.querySelector('[data-checkout-form]');
  const status = root.querySelector('[data-checkout-status]');

  function paint(bag) {
    const has = bag.length > 0;
    if (empty) empty.hidden = has;
    if (filled) filled.hidden = !has;
    if (!has) return;

    if (lines) {
      lines.innerHTML = bag
        .map((line) => {
          const g = garmentBySlug[line.slug];
          if (!g) return '';
          const colour = colourways[line.colour];
          return `<li>
            <span>${g.name} — ${colour ? colour.name : line.colour},
              size ${sizeLabel(line.size, 'UK')} × ${line.quantity}</span>
            <span class="figure">${money(g.price * line.quantity)}</span>
          </li>`;
        })
        .join('');
    }

    if (summary) {
      const t = totals(bag);
      summary.innerHTML = `
        <dl class="summary__rows figure">
          <div><dt>Subtotal</dt><dd>${money(t.subtotal)}</dd></div>
          <div><dt>Shipping</dt><dd>${t.shipping === 0 ? 'Free' : money(t.shipping)}</dd></div>
        </dl>
        <p class="summary__total figure"><span>Total</span> <strong>${money(t.total)}</strong></p>`;
    }
  }

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const required = [...form.querySelectorAll('[required]')];
      let firstBad = null;

      for (const field of required) {
        const wrap = field.closest('.field');
        const ok = field.value.trim() !== '' && field.checkValidity();
        if (wrap) wrap.dataset.invalid = ok ? 'false' : 'true';
        if (!ok && !firstBad) firstBad = field;
      }

      if (firstBad) {
        if (status) status.textContent = 'Some details are missing or not valid.';
        // Moving focus is the part that makes this usable without a mouse: an
        // error message nobody is looking at helps nobody.
        firstBad.focus();
        return;
      }

      if (status) {
        status.textContent =
          'Details accepted. A real build would hand off to a payment provider here — ' +
          'this demonstration stops instead, and no card details were requested.';
      }
    });
  }

  onBagChange(paint);
  paint(getBag());
}
