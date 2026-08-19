/**
 * Vestra — site chrome and identity.
 */
import { esc, url, absolute } from '../_lib/html.js';
import { brand } from './assets/data.js';

const NAV = [
  { label: 'Shop', href: '/vestra/shop/' },
  { label: 'Lookbook', href: '/vestra/lookbook/' },
  { label: 'Cloth', href: '/vestra/cloth/' },
  { label: 'Fit', href: '/vestra/fit/' },
  { label: 'Atelier', href: '/vestra/atelier/' },
];

const MARK = `<svg viewBox="0 0 28 28" class="mark" aria-hidden="true" focusable="false">
  <path d="M4 5 L14 23 L24 5" fill="none" stroke="currentColor" stroke-width="2.2"
    stroke-linejoin="round"/>
</svg>`;

export default {
  key: 'vestra',
  name: brand.name,
  themeColor: '#f7f5f1',
  styles: ['vestra.css'],
  socialImage: '/vestra/assets/social-card.svg',

  webfonts: true,
  motion: true,

  favicon: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="32" height="32" fill="#1c1b19"/>
    <path d="M7 8 L16 25 L25 8" fill="none" stroke="#f7f5f1" stroke-width="2.4"
      stroke-linejoin="round"/>
  </svg>`,

  organization: () => ({
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: brand.legalName,
    description: brand.tagline,
    url: absolute('/vestra/'),
    email: brand.email,
    telephone: brand.phone,
    priceRange: '€€€',
    address: {
      '@type': 'PostalAddress',
      streetAddress: brand.address.street,
      addressLocality: brand.address.locality,
      addressRegion: brand.address.region,
      postalCode: brand.address.postal,
      addressCountry: brand.address.country,
    },
  }),

  header(ctx) {
    const here = ctx.path;
    return `<header class="bar" data-bar data-header>
      <div class="bar__inner">
        <a class="wordmark" href="${esc(url('/vestra/'))}">
          ${MARK}<span>${esc(brand.name)}</span>
        </a>

        <button class="bar__toggle" type="button"
                aria-expanded="false" aria-controls="vestra-nav"
                data-nav-toggle data-nav-breakpoint="60">
          <span class="bar__bars" aria-hidden="true"><i></i><i></i></span>
          <span class="visually-hidden">Menu</span>
        </button>

        <nav class="bar__nav" id="vestra-nav" aria-label="Primary" data-nav>
          <ul>
            ${NAV.map((item) => {
              const current = here === url(item.href) || here.startsWith(url(item.href));
              return `<li><a href="${esc(url(item.href))}"${
                current ? ' aria-current="page"' : ''
              }>${esc(item.label)}</a></li>`;
            }).join('')}
          </ul>
        </nav>

        <a class="bag-link" href="${esc(url('/vestra/bag/'))}">
          Bag <span class="bag-link__count" data-bag-count>0</span>
        </a>
      </div>
    </header>`;
  },

  footer() {
    return `<footer class="foot">
      <div class="shell foot__inner">
        <div>
          <p class="foot__mark">${MARK}</p>
          <p class="foot__line">${esc(brand.tagline)}</p>
          <address class="foot__address">
            ${esc(brand.address.street)}<br>
            ${esc(brand.address.postal)} ${esc(brand.address.locality)}<br>
            <a href="mailto:${esc(brand.email)}">${esc(brand.email)}</a>
          </address>
        </div>

        <div class="foot__cols">
          <div>
            <p class="foot__head">Shop</p>
            <ul>
              <li><a href="${esc(url('/vestra/shop/'))}">All garments</a></li>
              <li><a href="${esc(url('/vestra/lookbook/'))}">Lookbook</a></li>
              <li><a href="${esc(url('/vestra/cloth/'))}">Cloth</a></li>
            </ul>
          </div>
          <div>
            <p class="foot__head">Help</p>
            <ul>
              <li><a href="${esc(url('/vestra/fit/'))}">Find your size</a></li>
              <li><a href="${esc(url('/vestra/care/'))}">Care &amp; returns</a></li>
              <li><a href="${esc(url('/vestra/bag/'))}">Your bag</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="shell foot__legal">
        <p>${esc(brand.name)} is a fictional label, designed and built by
          <a href="${esc(url('/work/vestra/'))}">Studio Meridian</a> to demonstrate fashion
          commerce. Nothing can be bought, and no payment details are ever requested.</p>
      </div>
    </footer>`;
  },
};
