import { esc } from '../../_lib/html.js';
import { brand } from '../assets/data.js';
import { crumbs } from '../components.js';

export const meta = {
  title: 'Checkout',
  description: `Checkout. No payment details are collected at any point — this is a
    demonstration of the flow, not a shop.`,
  styles: ['fit.css'],
  scripts: ['ui.js', 'bag-count.js', 'checkout.js'],
  noindex: true,
  breadcrumbs: [
    { label: brand.name, href: '/vestra/' },
    { label: 'Bag', href: '/vestra/bag/' },
    { label: 'Checkout', href: '/vestra/checkout/' },
  ],
};

export function render({ url }) {
  return `
<section class="page-head">
  <div class="shell">
    ${crumbs(meta.breadcrumbs, url)}
    <h1 class="h1" style="margin-top:var(--s-2xs)">Where it goes.</h1>
  </div>
</section>

<section class="section section--tight">
  <div class="shell" data-checkout>
    <div class="bag-empty" data-checkout-empty>
      <p class="h3">There is nothing to check out.</p>
      <a class="btn" href="${esc(url('/vestra/shop/'))}" style="margin-top:var(--s-m)">
        See the collection</a>
    </div>

    <div class="bag" data-checkout-filled hidden>
      <form class="checkout-form" data-checkout-form novalidate>
        <fieldset>
          <legend class="label" style="margin-bottom:var(--s-s)">Delivery</legend>

          <div class="field-row">
            <div class="field">
              <label for="c-first">First name</label>
              <div class="field__input">
                <input id="c-first" name="first" required autocomplete="given-name">
              </div>
              <p class="field__error" aria-live="polite"></p>
            </div>
            <div class="field">
              <label for="c-last">Last name</label>
              <div class="field__input">
                <input id="c-last" name="last" required autocomplete="family-name">
              </div>
              <p class="field__error" aria-live="polite"></p>
            </div>
          </div>

          <div class="field">
            <label for="c-email">Email</label>
            <div class="field__input">
              <input id="c-email" name="email" type="email" required
                     autocomplete="email" spellcheck="false" autocapitalize="off"
                     aria-describedby="c-email-help">
            </div>
            <p class="field__help" id="c-email-help">For the dispatch note only.</p>
            <p class="field__error" aria-live="polite"></p>
          </div>

          <div class="field">
            <label for="c-address">Address</label>
            <div class="field__input">
              <input id="c-address" name="address" required autocomplete="street-address">
            </div>
            <p class="field__error" aria-live="polite"></p>
          </div>

          <div class="field-row">
            <div class="field">
              <label for="c-city">City</label>
              <div class="field__input">
                <input id="c-city" name="city" required autocomplete="address-level2">
              </div>
              <p class="field__error" aria-live="polite"></p>
            </div>
            <div class="field">
              <label for="c-postal">Postcode</label>
              <div class="field__input">
                <input id="c-postal" name="postal" required autocomplete="postal-code"
                       inputmode="text" autocapitalize="characters" spellcheck="false">
              </div>
              <p class="field__error" aria-live="polite"></p>
            </div>
          </div>
        </fieldset>

        <p class="checkout-note">
          <strong>No payment details are requested on this site, at any step.</strong>
          There is no card field below, and there is no server to send one to. A real
          build would hand off to a payment provider at exactly this point — which is
          why the flow stops here rather than pretending to complete.
        </p>

        <p class="garment__status" data-checkout-status role="status"></p>

        <button class="btn btn--block" type="submit" data-place>Review order</button>
      </form>

      <aside class="summary" aria-labelledby="co-sum">
        <h2 class="h3" id="co-sum">Order</h2>
        <ul class="summary__lines" data-checkout-lines></ul>
        <div data-checkout-summary></div>
      </aside>
    </div>
  </div>
</section>
`;
}
