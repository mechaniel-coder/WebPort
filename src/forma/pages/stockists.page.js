import { each, esc } from '../../_lib/html.js';
import { brand, stockists } from '../data.js';
import { cta, pageHead } from '../components.js';

export const meta = {
  title: 'Stockists',
  description: `The Brooklyn studio plus ten stockists across the US, Europe, Japan and
    Australia. Open Thursday to Saturday, 11–6.`,
  styles: ['shop.css'],
  scripts: ['ui.js', 'cart.js'],
  breadcrumbs: [
    { label: 'Forma', href: '/forma/' },
    { label: 'Stockists', href: '/forma/stockists/' },
  ],
};

export function render({ url }) {
  const own = stockists.find((entry) => entry.own);
  const rest = stockists.filter((entry) => !entry.own);

  return `
${pageHead({
  tag: `${stockists.length} places`,
  title: 'Where to handle one first.',
  lede: `Objects are difficult to judge from a screen — particularly the weight of the oak
    pieces, which is the thing everyone comments on.`,
  trail: meta.breadcrumbs,
  url,
})}

<section class="section section--tight">
  <div class="shell">
    <div style="border:2px solid var(--rule);padding:var(--space-l);background:var(--paper-2)">
      <h2 class="h2" style="margin-top:var(--space-2xs)">${esc(own.name)}</h2>
      <address style="margin-top:var(--space-s);font-size:var(--step-1);line-height:1.5">
        ${esc(brand.studio)}<br>
        Thursday to Saturday, 11–6<br>
        <a href="tel:${esc(brand.phone.replace(/[^+\d]/g, ''))}">${esc(brand.phone)}</a> ·
        <a href="mailto:${esc(brand.email)}">${esc(brand.email)}</a>
      </address>
      <p class="muted" style="margin-top:var(--space-s);max-width:52ch">
        The whole range is on the floor, including the finishes that are made to order. There
        is no appointment system — if the door is open we are in.
      </p>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="stockists-heading">
  <div class="shell">
    <h2 class="h2" id="stockists-heading" style="margin:var(--space-2xs) 0 var(--space-l)">
      ${rest.length} stockists.</h2>

    <ul class="rows" style="margin:0">
      ${each(
        rest,
        (entry) => `<li>
        <span class="rows__key">${esc(entry.city)}</span>
        <span class="rows__value">
          <strong style="color:var(--ink)">${esc(entry.name)}</strong> — ${esc(entry.detail)}
        </span>
      </li>`,
      )}
    </ul>

    <p class="muted" style="margin-top:var(--space-l);font-size:var(--step--1);max-width:56ch">
      Stockists carry a selection rather than the full range, and finishes vary. Call ahead
      if you are travelling for something specific — or email us and we will check for you.
    </p>
  </div>
</section>

${cta({
  url,
  title: 'Or have it sent.',
  body: 'Free shipping over $250 and thirty days to change your mind, postage paid.',
  primary: { href: '/forma/shop/', label: 'Shop the range' },
  secondary: { href: '/forma/care/', label: 'Shipping & returns' },
})}
`;
}
