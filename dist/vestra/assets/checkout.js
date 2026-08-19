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

  /**
   * Name the problem on the field itself, not only in the form-level status.
   * "Some details are missing" tells a keyboard user to go hunting; the message
   * belongs next to the control, wired into its accessible description so it is
   * still there when they tab back to it.
   */
  function messageFor(field) {
    const label = form.querySelector(`label[for="${field.id}"]`);
    const name = label ? label.textContent.trim().toLowerCase() : 'this field';
    if (field.value.trim() === '') return `Enter your ${name}.`;
    if (field.type === 'email') return 'Enter an email address, including the @.';
    return `Check the ${name}.`;
  }

  function setError(field, message) {
    const wrap = field.closest('.field');
    const error = wrap ? wrap.querySelector('.field__error') : null;
    if (wrap) wrap.dataset.invalid = message ? 'true' : 'false';
    field.setAttribute('aria-invalid', String(Boolean(message)));
    if (!error) return;

    error.textContent = message;
    if (!error.id) error.id = `${field.id}-error`;

    const described = (field.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .filter((id) => id && id !== error.id);
    if (message) described.push(error.id);

    if (described.length) field.setAttribute('aria-describedby', described.join(' '));
    else field.removeAttribute('aria-describedby');
  }

  if (form) {
    // Clear a field's error as soon as it becomes valid, so the page stops
    // saying something is wrong the moment it stops being wrong.
    for (const field of form.querySelectorAll('input')) {
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true' && field.checkValidity()) {
          setError(field, '');
        }
      });
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const required = [...form.querySelectorAll('[required]')];
      let firstBad = null;

      for (const field of required) {
        const ok = field.value.trim() !== '' && field.checkValidity();
        setError(field, ok ? '' : messageFor(field));
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
