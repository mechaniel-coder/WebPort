import { each, esc } from '../../_lib/html.js';
import { COMMERCE, brand, faqs, products } from '../data.js';
import { faqPage } from '../../_lib/seo.js';
import { money } from '../assets/commerce.js';
import { accordion, cta, pageHead } from '../components.js';

export const meta = {
  title: 'Care & FAQ',
  description: `Shipping, returns, trade pricing, and how to look after each piece. Free
    shipping over $250 and 30-day returns with the postage paid.`,
  styles: ['shop.css'],
  scripts: ['ui.js', 'cart.js'],
  breadcrumbs: [
    { label: 'Forma', href: '/forma/' },
    { label: 'Care & FAQ', href: '/forma/care/' },
  ],
  jsonld: faqPage(faqs),
};

export function render({ url }) {
  return `
${pageHead({
  title: 'Looking after it, and getting it to you.',
  lede: `Free shipping over ${money(COMMERCE.freeShippingOver)}, ${COMMERCE.returnDays}-day
    returns with the postage paid, and instructions for every piece.`,
  trail: meta.breadcrumbs,
  url,
})}

<section class="section section--tight">
  <div class="shell" style="max-width:56rem">
    <h2 class="h2" style="margin:var(--space-2xs) 0 var(--space-l)">The ones we get asked.</h2>
    ${accordion(faqs, 'ffaq')}
  </div>
</section>

<section class="section section--fill section--ruled" aria-labelledby="care-heading">
  <div class="shell">
    <h2 class="h2" id="care-heading" style="margin:var(--space-2xs) 0 var(--space-l)">
      One instruction per object.</h2>

    <ul class="rows" style="margin:0">
      ${each(
        products,
        (product) => `<li>
        <span class="rows__key">
          <a href="${esc(url(`/forma/shop/${product.slug}/`))}"
             style="text-decoration:none">${esc(product.name)}</a>
        </span>
        <span class="rows__value">${esc(product.care)}</span>
      </li>`,
      )}
    </ul>
  </div>
</section>

<section class="section" aria-labelledby="terms-heading">
  <div class="shell">
    <div class="prose">
      <h2 class="h2" id="terms-heading" style="color:var(--ink);margin-top:var(--space-2xs)">
        The terms, in plain language.</h2>

      <p><strong>Shipping.</strong> ${esc(money(COMMERCE.shippingFlat))} standard, free over
        ${esc(money(COMMERCE.freeShippingOver))}, and
        ${esc(money(COMMERCE.shippingExpress))} for express — which is never free, because it
        genuinely costs us that. Furniture ships freight and takes seven to ten days on either
        option; we call to agree a window rather than assigning you one.</p>

      <p><strong>Tax.</strong> ${(COMMERCE.taxRate * 100).toFixed(1)}% is applied to goods
        <em>and</em> shipping, which is how most US states actually work. It is shown before
        you reach the last step, not after.</p>

      <p><strong>Returns.</strong> ${COMMERCE.returnDays} days, unused, in the original
        packaging, and we pay the return postage. Brass and smoked oak are made to order and
        are excluded; both are marked as such on the product page and again at checkout.</p>

      <p><strong>Damage in transit.</strong> Photograph it before you unpack anything else
        and email us. We replace rather than repair, and we do not ask you to ship the broken
        one back first.</p>

      <p><strong>Trade.</strong> Architects, interior designers and hospitality projects get
        trade pricing. Email us the project and we will set up an account rather than make you
        fill in a portal.</p>

      <p><strong>${esc(brand.name)} is a fictional brand</strong> built to demonstrate
        commerce design. Nothing can be purchased, no payment details are requested at any
        point, and the cart exists only in your own browser.</p>
    </div>
  </div>
</section>

${cta({
  url,
  title: 'Still not sure?',
  body: 'The studio is open Thursday to Saturday and you are welcome to come and handle it.',
  primary: { href: '/forma/stockists/', label: 'Find us' },
  secondary: { href: '/forma/shop/', label: 'Shop the range' },
})}
`;
}
