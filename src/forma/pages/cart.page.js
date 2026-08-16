import { esc } from '../../_lib/html.js';
import { COMMERCE } from '../data.js';
import { money } from '../assets/commerce.js';
import { catalogueIsland, crumbs } from '../components.js';

export const meta = {
  title: 'Cart',
  description: `Your cart. Everything is held in your own browser — nothing is transmitted,
    and no payment details are collected at any point.`,
  styles: ['shop.css'],
  scripts: ['ui.js', 'cart.js', 'checkout.js'],
  noindex: true,
  breadcrumbs: [
    { label: 'Forma', href: '/forma/' },
    { label: 'Cart', href: '/forma/cart/' },
  ],
};

export function render({ url }) {
  return `
${catalogueIsland(url)}

<section class="page-head">
  <div class="shell">
    ${crumbs(meta.breadcrumbs, url)}
    <p class="tag">Your cart</p>
    <h1 class="h1 page-head__title">Cart.</h1>
  </div>
</section>

<section class="section section--tight">
  <div class="shell" data-cart-page>
    <div class="cart__empty" data-cart-empty>
      <p class="h2">Nothing in here yet.</p>
      <p class="muted" style="max-width:34ch">
        The cart lives in this browser only. If you added something in another browser or
        cleared your storage, it will not be here.
      </p>
      <a class="btn" href="${esc(url('/forma/shop/'))}">Go to the shop</a>
    </div>

    <div class="cart" data-cart-filled hidden>
      <div>
        <ul class="cart__lines" data-lines></ul>
        <div style="display:flex;flex-wrap:wrap;gap:var(--space-s);
                    margin-top:var(--space-m);align-items:center">
          <a class="link-under" href="${esc(url('/forma/shop/'))}">Keep shopping</a>
          <button class="cart-line__remove" type="button" data-clear-cart
                  style="margin-left:auto">Empty cart</button>
        </div>
      </div>

      <aside class="summary" aria-labelledby="summary-title">
        <h2 class="summary__title" id="summary-title">Order summary</h2>
        <div data-summary></div>
        <a class="btn btn--block" style="margin-top:var(--space-m)"
           href="${esc(url('/forma/checkout/'))}">Checkout</a>
        <p class="summary__note">
          Free shipping over ${esc(money(COMMERCE.freeShippingOver))}.
          ${COMMERCE.returnDays}-day returns, postage paid.
        </p>
      </aside>
    </div>

    <noscript>
      <p class="form-status" data-tone="error">
        The cart needs JavaScript — it is stored in your own browser rather than on a
        server. Every product and price is listed in full in
        <a href="${esc(url('/forma/shop/'))}">the shop</a>.
      </p>
    </noscript>
  </div>
</section>
`;
}
