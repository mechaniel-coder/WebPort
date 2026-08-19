import { each, esc } from '../../_lib/html.js';
import { COMMERCE } from '../data.js';
import { money } from '../assets/commerce.js';
import { catalogueIsland, crumbs } from '../components.js';

export const meta = {
  title: 'Checkout',
  description: `Three steps: details, delivery, review. No payment information is requested
    at any point — this is a demonstration storefront.`,
  styles: ['shop.css'],
  scripts: ['ui.js', 'cart.js', 'checkout.js'],
  noindex: true,
  breadcrumbs: [
    { label: 'Forma', href: '/forma/' },
    { label: 'Cart', href: '/forma/cart/' },
    { label: 'Checkout', href: '/forma/checkout/' },
  ],
};

const STEPS = [
  { id: 'details', label: 'Details' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'review', label: 'Review' },
];

export function render({ url }) {
  return `
${catalogueIsland(url)}

<section class="page-head">
  <div class="shell">
    ${crumbs(meta.breadcrumbs, url)}
    <h1 class="h1 page-head__title">Checkout.</h1>
  </div>
</section>

<section class="section section--tight">
  <div class="shell" data-checkout>
    <div class="cart__empty" data-checkout-gate hidden>
      <p class="h2">There is nothing to check out.</p>
      <a class="btn" href="${esc(url('/forma/shop/'))}">Go to the shop</a>
    </div>

    <div class="cart" data-checkout-flow>
      <div>
        <ol class="steps">
          ${each(
            STEPS,
            (step, index) => `<li class="steps__item" data-step-item="${esc(step.id)}"
            data-state="${index === 0 ? 'current' : 'todo'}">
            <span class="steps__num">${String(index + 1).padStart(2, '0')}</span>
            <span>${esc(step.label)}</span>
          </li>`,
          )}
        </ol>

        ${detailsPanel(url)}
        ${deliveryPanel()}
        ${reviewPanel(url)}

        <div class="checkout__panel" data-panel="confirmation" hidden></div>
      </div>

      <aside class="summary" aria-labelledby="co-summary-title">
        <h2 class="summary__title" id="co-summary-title">Order summary</h2>
        <div data-summary></div>
        <p class="summary__note">
          <a href="${esc(url('/forma/cart/'))}">Edit your cart</a>
        </p>
      </aside>
    </div>

    <noscript>
      <p class="form-status" data-tone="error">
        Checkout needs JavaScript — the cart is kept in your own browser rather than on a
        server. Nothing on this site can actually be bought in any case.
      </p>
    </noscript>
  </div>
</section>
`;
}

/* ── Step 1 ────────────────────────────────────────────────────────────────── */

function detailsPanel(url) {
  return `<div class="checkout__panel" data-panel="details">
    <h2 class="checkout__title" tabindex="-1" data-panel-title>Where is it going?</h2>

    <form class="form-grid form-grid--2" data-details-form novalidate>
      <div class="field span-2">
        <label class="field__label" for="co-name">Full name</label>
        <input id="co-name" name="name" type="text" required data-label="Full name"
               autocomplete="name">
        <p class="field__error" aria-live="polite"></p>
      </div>

      <div class="field span-2">
        <label class="field__label" for="co-email">Email</label>
        <input id="co-email" name="email" type="email" required data-label="Email"
               autocomplete="email"
               spellcheck="false" autocapitalize="off">
        <p class="field__hint">For the order confirmation only.</p>
        <p class="field__error" aria-live="polite"></p>
      </div>

      <div class="field span-2">
        <label class="field__label" for="co-address">Address</label>
        <input id="co-address" name="address" type="text" required data-label="Address"
               autocomplete="street-address">
        <p class="field__error" aria-live="polite"></p>
      </div>

      <div class="field">
        <label class="field__label" for="co-city">City</label>
        <input id="co-city" name="city" type="text" required data-label="City"
               autocomplete="address-level2">
        <p class="field__error" aria-live="polite"></p>
      </div>

      <div class="field">
        <label class="field__label" for="co-postcode">ZIP / Postcode</label>
        <input id="co-postcode" name="postcode" type="text" required data-label="Postcode"
               autocomplete="postal-code">
        <p class="field__error" aria-live="polite"></p>
      </div>
    </form>

    <div class="checkout__actions">
      <a class="btn btn--ghost" href="${esc(url('/forma/cart/'))}">Back to cart</a>
      <button class="btn" type="button" data-next="details">Continue to delivery</button>
    </div>
  </div>`;
}

/* ── Step 2 ────────────────────────────────────────────────────────────────── */

function deliveryPanel() {
  return `<div class="checkout__panel" data-panel="delivery" hidden>
    <h2 class="checkout__title" tabindex="-1" data-panel-title>How fast?</h2>

    <ul class="ship-options">
      <li class="ship-option">
        <input type="radio" name="shipping" id="ship-standard" value="standard" checked>
        <label for="ship-standard">
          <span>
            <span class="ship-option__name">Standard</span>
            <span class="ship-option__detail">3–5 working days ·
              free over ${esc(money(COMMERCE.freeShippingOver))}</span>
          </span>
          <span class="ship-option__price">${esc(money(COMMERCE.shippingFlat))}</span>
        </label>
      </li>
      <li class="ship-option">
        <input type="radio" name="shipping" id="ship-express" value="express">
        <label for="ship-express">
          <span>
            <span class="ship-option__name">Express</span>
            <span class="ship-option__detail">2 working days · never free, sorry</span>
          </span>
          <span class="ship-option__price">${esc(money(COMMERCE.shippingExpress))}</span>
        </label>
      </li>
    </ul>

    <p class="muted" style="font-size:var(--step--1)">
      Furniture ships freight and takes seven to ten days whichever option you pick — we
      will call to agree a window rather than assign you one.
    </p>

    <div class="checkout__actions">
      <button class="btn btn--ghost" type="button" data-back="details">Back</button>
      <button class="btn" type="button" data-next="delivery">Review order</button>
    </div>
  </div>`;
}

/* ── Step 3 ────────────────────────────────────────────────────────────────── */

function reviewPanel(url) {
  return `<div class="checkout__panel" data-panel="review" hidden>
    <h2 class="checkout__title" tabindex="-1" data-panel-title>Does this look right?</h2>

    <div class="form-grid form-grid--2" data-review></div>

    <div class="form-status">
      <p><strong>No payment step, deliberately.</strong> This is a demonstration storefront,
      so it never asks for a card number, and there is nothing behind it that could take one.
      A real build would hand off to a payment provider at exactly this point.</p>
    </div>

    <p class="muted" style="font-size:var(--step--1)">
      ${COMMERCE.returnDays}-day returns and we pay the return postage. Made-to-order
      finishes are excluded and are marked on the product page.
      <a href="${esc(url('/forma/care/'))}">Full terms</a>.
    </p>

    <div class="checkout__actions">
      <button class="btn btn--ghost" type="button" data-back="delivery">Back</button>
      <button class="btn" type="button" data-place-order>Place order</button>
    </div>
  </div>`;
}
