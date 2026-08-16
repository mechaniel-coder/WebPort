/**
 * Cart page and checkout.
 *
 * The cart renders from the shared store, so a quantity change in one tab is
 * reflected here immediately. Checkout is three steps — details, delivery,
 * review — and collects no payment information at any point, by design: this is
 * a demonstration, and a form that asks for a card number is not one.
 */

import {
  catalogue,
  clear,
  getLines,
  lineId,
  money,
  productArt,
  subscribe,
  totals,
  update,
  variantLabel,
} from './cart.js';
import { COMMERCE } from './commerce.js';

const cartRoot = document.querySelector('[data-cart-page]');
const checkoutRoot = document.querySelector('[data-checkout]');

if (cartRoot) initCart(cartRoot);
if (checkoutRoot) initCheckout(checkoutRoot);

/* ── Shared rendering ──────────────────────────────────────────────────────── */

function renderSummary(node, { express = false } = {}) {
  const priced = totals({ express });
  if (!node) return priced;

  const row = (label, value, attrs = '') =>
    `<div class="summary__row"${attrs}><dt>${escapeHtml(label)}</dt>` +
    `<dd>${escapeHtml(value)}</dd></div>`;

  // Every money value in this column is formatted the same way; a bare "$18"
  // beside "$225.00" reads as a different kind of number.
  const shippingLabel =
    priced.subtotal === 0
      ? '—'
      : priced.shipping === 0
        ? 'Free'
        : money(priced.shipping, { withCents: true });

  node.innerHTML = `
    <dl class="summary__lines">
      ${row('Subtotal', money(priced.subtotal, { withCents: true }))}
      ${row('Shipping', shippingLabel, priced.shipping === 0 && priced.subtotal > 0 ? ' data-free="true"' : '')}
      ${row(`Tax (${(COMMERCE.taxRate * 100).toFixed(1)}%)`, money(priced.tax, { withCents: true }))}
    </dl>
    <div class="summary__total">
      <span>Total</span><span>${money(priced.total, { withCents: true })}</span>
    </div>
    ${freeShipping(priced)}
    <p class="summary__note">
      Tax is applied to goods and shipping. ${COMMERCE.returnDays}-day returns, and we pay
      the return postage. Nothing on this site can actually be purchased.
    </p>`;

  return priced;
}

function freeShipping(priced) {
  if (priced.subtotal === 0) return '';
  const progress = Math.min(100, (priced.subtotal / COMMERCE.freeShippingOver) * 100);

  return `<div class="freeship" data-complete="${priced.qualifiesForFree}">
    <p>${
      priced.qualifiesForFree
        ? 'Shipping is free on this order.'
        : `${escapeHtml(money(priced.freeShippingGap))} more for free shipping.`
    }</p>
    <div class="freeship__track" role="progressbar" aria-valuemin="0" aria-valuemax="100"
         aria-valuenow="${Math.round(progress)}"
         aria-label="Progress toward free shipping">
      <div class="freeship__fill" style="width:${progress}%"></div>
    </div>
  </div>`;
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
}

/* ── Cart page ─────────────────────────────────────────────────────────────── */

function initCart(root) {
  const list = root.querySelector('[data-lines]');
  const empty = root.querySelector('[data-cart-empty]');
  const filled = root.querySelector('[data-cart-filled]');
  const summary = root.querySelector('[data-summary]');
  const clearButton = root.querySelector('[data-clear-cart]');

  subscribe(() => {
    const priced = totals();
    empty.hidden = priced.lines.length > 0;
    filled.hidden = priced.lines.length === 0;

    list.textContent = '';
    for (const line of priced.lines) list.append(cartLine(line));

    renderSummary(summary);
  });

  clearButton?.addEventListener('click', () => {
    clear();
  });

  function cartLine(line) {
    const id = lineId(line);
    const item = document.createElement('li');
    item.className = 'cart-line';
    item.dataset.line = id;

    const variant = variantLabel(line.product, line);

    item.innerHTML = `
      <div class="cart-line__art">
        ${productArt({ shape: line.product.shape, finish: line.finish })}
      </div>
      <div>
        <p class="cart-line__name">
          <a href="${escapeHtml(line.product.href)}">${escapeHtml(line.product.name)}</a>
        </p>
        <p class="cart-line__variant">${escapeHtml(variant)} · ${escapeHtml(money(line.unit))} each</p>
        <div class="cart-line__controls">
          <div class="qty">
            <button type="button" data-dec aria-label="Decrease quantity of ${escapeHtml(line.product.name)}">−</button>
            <input type="number" min="1" max="${COMMERCE.maxQuantity}" value="${line.quantity}"
                   data-qty aria-label="Quantity of ${escapeHtml(line.product.name)}">
            <button type="button" data-inc aria-label="Increase quantity of ${escapeHtml(line.product.name)}">+</button>
          </div>
          <button type="button" class="cart-line__remove" data-remove>Remove</button>
        </div>
      </div>
      <p class="cart-line__price">${escapeHtml(money(line.total, { withCents: true }))}</p>`;

    item.querySelector('[data-dec]').addEventListener('click', () =>
      update(id, line.quantity - 1),
    );
    item.querySelector('[data-inc]').addEventListener('click', () =>
      update(id, line.quantity + 1),
    );
    item.querySelector('[data-remove]').addEventListener('click', () => update(id, 0));
    item.querySelector('[data-qty]').addEventListener('change', (event) =>
      update(id, Number(event.target.value) || 0),
    );

    return item;
  }
}

/* ── Checkout ──────────────────────────────────────────────────────────────── */

function initCheckout(root) {
  const STEPS = ['details', 'delivery', 'review'];
  let step = 'details';
  let express = false;

  const panels = Object.fromEntries(
    STEPS.concat('confirmation').map((name) => [
      name,
      root.querySelector(`[data-panel="${name}"]`),
    ]),
  );
  const stepItems = root.querySelectorAll('[data-step-item]');
  const form = root.querySelector('[data-details-form]');
  const summary = root.querySelector('[data-summary]');
  const review = root.querySelector('[data-review]');
  const gate = root.querySelector('[data-checkout-gate]');
  const flow = root.querySelector('[data-checkout-flow]');

  const details = { name: '', email: '', address: '', city: '', postcode: '' };

  subscribe(() => {
    const priced = totals({ express });
    const hasItems = priced.lines.length > 0;
    gate.hidden = hasItems;
    flow.hidden = !hasItems;
    renderSummary(summary, { express });
  });

  function goTo(next, { moveFocus = true } = {}) {
    step = next;
    for (const [name, panel] of Object.entries(panels)) {
      if (panel) panel.hidden = name !== step;
    }

    const index = STEPS.indexOf(step);
    for (const item of stepItems) {
      const position = STEPS.indexOf(item.dataset.stepItem);
      item.dataset.state =
        step === 'confirmation' || position < index
          ? 'done'
          : position === index
            ? 'current'
            : 'todo';
    }

    if (step === 'review') renderReview();
    if (moveFocus) panels[step]?.querySelector('[data-panel-title]')?.focus();
  }

  function validateDetails() {
    const fields = [...form.querySelectorAll('input')];
    let firstInvalid = null;

    for (const input of fields) {
      const field = input.closest('.field');
      const error = field?.querySelector('.field__error');
      const valid = input.checkValidity();
      field?.setAttribute('data-invalid', String(!valid));
      input.setAttribute('aria-invalid', String(!valid));
      if (error) {
        error.textContent = valid
          ? ''
          : input.validity.valueMissing
            ? `${input.dataset.label} is required.`
            : `Enter a valid ${input.dataset.label.toLowerCase()}.`;
      }
      if (!valid && !firstInvalid) firstInvalid = input;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return false;
    }

    for (const key of Object.keys(details)) {
      details[key] = form.elements[key]?.value.trim() ?? '';
    }
    return true;
  }

  function renderReview() {
    const priced = totals({ express });

    review.innerHTML = `
      <div class="review-block">
        <h3>Deliver to</h3>
        <dl>
          <dt>Name</dt><dd>${escapeHtml(details.name)}</dd>
          <dt>Email</dt><dd>${escapeHtml(details.email)}</dd>
          <dt>Address</dt>
          <dd>${escapeHtml(details.address)}<br>
              ${escapeHtml(details.city)} ${escapeHtml(details.postcode)}</dd>
        </dl>
      </div>
      <div class="review-block">
        <h3>Delivery</h3>
        <dl>
          <dt>Method</dt>
          <dd>${express ? 'Express, 2 working days' : 'Standard, 3–5 working days'}</dd>
          <dt>Cost</dt>
          <dd>${priced.shipping === 0 ? 'Free' : escapeHtml(money(priced.shipping))}</dd>
        </dl>
      </div>
      <div class="review-block">
        <h3>${priced.lines.length} item${priced.lines.length === 1 ? '' : 's'}</h3>
        <dl>
          ${priced.lines
            .map(
              (line) =>
                `<dt>${escapeHtml(`${line.product.name} × ${line.quantity}`)}</dt>` +
                `<dd>${escapeHtml(money(line.total, { withCents: true }))}</dd>`,
            )
            .join('')}
          <dt><strong>Total</strong></dt>
          <dd><strong>${escapeHtml(money(priced.total, { withCents: true }))}</strong></dd>
        </dl>
      </div>`;
  }

  for (const input of root.querySelectorAll('[name="shipping"]')) {
    input.addEventListener('change', () => {
      express = input.value === 'express';
      renderSummary(summary, { express });
    });
  }

  for (const button of root.querySelectorAll('[data-next]')) {
    button.addEventListener('click', () => {
      const from = button.dataset.next;
      if (from === 'details' && !validateDetails()) return;
      goTo(STEPS[STEPS.indexOf(from) + 1]);
    });
  }

  for (const button of root.querySelectorAll('[data-back]')) {
    button.addEventListener('click', () => goTo(button.dataset.back));
  }

  root.querySelector('[data-place-order]').addEventListener('click', () => {
    const priced = totals({ express });
    const reference = `FRM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    panels.confirmation.innerHTML = `
      <h2 class="checkout__title" tabindex="-1" data-panel-title>Order placed.</h2>
      <p class="confirmation__ref">${escapeHtml(reference)}</p>
      <p class="lede">${priced.lines.length} item${priced.lines.length === 1 ? '' : 's'},
        ${escapeHtml(money(priced.total, { withCents: true }))}. A confirmation would
        normally be sent to ${escapeHtml(details.email)}.</p>
      <p class="muted" style="max-width:44ch">
        This is a demonstration storefront. No order exists, no email is sent, and no
        payment details were requested at any point.</p>
      <button class="btn" type="button" onclick="window.print()">Print this page</button>`;

    clear();
    goTo('confirmation');
  });

  goTo('details', { moveFocus: false });
}
