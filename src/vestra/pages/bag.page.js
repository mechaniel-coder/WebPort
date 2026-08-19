import { esc } from '../../_lib/html.js';
import { brand, money } from '../assets/data.js';
import { crumbs } from '../components.js';

export const meta = {
  title: 'Your bag',
  description: `Your bag. Held in this browser only — nothing is transmitted, and no
    payment details are collected at any point.`,
  styles: ['fit.css'],
  scripts: ['ui.js', 'bag-count.js', 'bag-page.js'],
  noindex: true,
  breadcrumbs: [
    { label: brand.name, href: '/vestra/' },
    { label: 'Bag', href: '/vestra/bag/' },
  ],
};

export function render({ url }) {
  return `
<section class="page-head">
  <div class="shell">
    ${crumbs(meta.breadcrumbs, url)}
    <p class="label">Your bag</p>
    <h1 class="h1" style="margin-top:var(--s-2xs)">Bag.</h1>
  </div>
</section>

<section class="section section--tight">
  <div class="shell" data-bag-page>
    <div class="bag-empty" data-bag-empty>
      <p class="h3">Nothing in it yet.</p>
      <p class="muted" style="max-width:38ch;margin-top:var(--s-2xs)">
        The bag lives in this browser only. If you added something in another browser,
        or cleared your storage, it will not be here.
      </p>
      <a class="btn" href="${esc(url('/vestra/shop/'))}" style="margin-top:var(--s-m)">
        See the collection</a>
    </div>

    <div class="bag" data-bag-filled hidden>
      <div>
        <ul class="bag__lines" data-lines></ul>
        <div class="bag__actions">
          <a class="link-arrow" href="${esc(url('/vestra/shop/'))}">Keep looking</a>
          <button class="bag__clear" type="button" data-clear-bag>Empty bag</button>
        </div>
      </div>

      <aside class="summary" aria-labelledby="sum-title">
        <h2 class="h3" id="sum-title">Summary</h2>
        <div data-summary></div>
        <a class="btn btn--block" href="${esc(url('/vestra/checkout/'))}"
           style="margin-top:var(--s-m)">Checkout</a>
        <p class="summary__note muted">
          Free shipping over ${esc(money(brand.freeShippingOver))}. ${brand.returnDays}-day
          returns, postage paid. Duties and tax are included in the prices shown.
        </p>
      </aside>
    </div>

    <noscript>
      <p class="form-status" data-tone="error">
        The bag needs JavaScript — it is stored in your own browser rather than on a
        server. Every garment and price is listed in full in
        <a href="${esc(url('/vestra/shop/'))}">the collection</a>.
      </p>
    </noscript>
  </div>
</section>
`;
}
