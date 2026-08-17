/**
 * Forma — design-object storefront.
 *
 * Design language: warm paper, hard black rules, oversized grotesque type and a
 * single saturated red. Everything is drawn rather than photographed, so the
 * geometry of the objects is the imagery.
 */
import { absolute, each, esc } from '../_lib/html.js';
import { brand } from './data.js';
import { studio } from '../../site.config.js';

const nav = [
  { label: 'Shop', href: '/forma/shop/' },
  { label: 'Collections', href: '/forma/collections/' },
  { label: 'Materials', href: '/forma/materials/' },
  { label: 'Stockists', href: '/forma/stockists/' },
  { label: 'Care & FAQ', href: '/forma/care/' },
];

const mark = `<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true" focusable="false">
  <rect x="3" y="3" width="30" height="30" rx="2" fill="none" stroke="currentColor"
        stroke-width="3"/>
  <path d="M11 26V11h14M11 18h10" fill="none" stroke="currentColor" stroke-width="3"/>
</svg>`;

export default {
  key: 'forma',
  name: brand.name,
  themeColor: '#faf7f2',
  styles: ['forma.css'],

  // Shared type and motion layers.
  webfonts: true,
  motion: true,
  socialImage: '/forma/assets/social-card.svg',
  favicon: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="32" height="32" rx="4" fill="#101010"/>
    <path d="M10 24V9h13M10 16h9" fill="none" stroke="#faf7f2" stroke-width="3"/>
  </svg>`,

  organization: () => ({
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: brand.name,
    description: brand.lede,
    url: absolute('/forma/'),
    email: brand.email,
    telephone: brand.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '44 Provost Street',
      addressLocality: 'Brooklyn',
      addressRegion: 'NY',
      postalCode: '11222',
      addressCountry: 'US',
    },
    openingHours: 'Th,Fr,Sa 11:00-18:00',
  }),

  header({ url, path }) {
    const current = (href) => (path === href ? ' aria-current="page"' : '');
    return `<header class="bar" data-header>
      <div class="bar__inner">
        <a class="brandmark" href="${esc(url('/forma/'))}"${current('/forma/')}>
          <span class="brandmark__icon" aria-hidden="true">${mark}</span>
          <span class="brandmark__word">${esc(brand.name)}</span>
        </a>

        <button class="bar__toggle" type="button" aria-expanded="false"
                aria-controls="forma-nav" data-nav-toggle>
          <span class="bar__bars" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="visually-hidden">Menu</span>
        </button>

        <nav class="bar__nav" id="forma-nav" aria-label="Primary" data-nav
             data-nav-breakpoint="60em">
          <ul>
            ${each(
              nav,
              (item) =>
                `<li><a href="${esc(url(item.href))}"${current(item.href)}>${esc(item.label)}</a></li>`,
            )}
          </ul>
        </nav>

        <a class="cart-link" href="${esc(url('/forma/cart/'))}" data-cart-link>
          <span>Cart</span>
          <span class="cart-link__count" data-cart-count aria-hidden="true">0</span>
          <span class="visually-hidden" data-cart-label>0 items in cart</span>
        </a>
      </div>
    </header>`;
  },

  footer({ url }) {
    return `<footer class="colophon">
      <div class="colophon__inner">
        <div class="colophon__brand">
          <span class="colophon__mark" aria-hidden="true">${mark}</span>
          <p class="colophon__line">${esc(brand.tagline)}</p>
          <address class="colophon__address">
            ${esc(brand.studio)}<br>
            Thursday to Saturday, 11–6<br>
            <a href="mailto:${esc(brand.email)}">${esc(brand.email)}</a>
          </address>
        </div>

        <nav class="colophon__group" aria-label="Shop">
          <h2 class="colophon__heading">Shop</h2>
          <ul>
            ${each(
              nav,
              (item) => `<li><a href="${esc(url(item.href))}">${esc(item.label)}</a></li>`,
            )}
          </ul>
        </nav>

        <div class="colophon__group">
          <h2 class="colophon__heading">Help</h2>
          <ul>
            <li><a href="${esc(url('/forma/care/'))}">Shipping &amp; returns</a></li>
            <li><a href="${esc(url('/forma/care/'))}">Care instructions</a></li>
            <li><a href="${esc(url('/forma/cart/'))}">Your cart</a></li>
          </ul>
        </div>

        <p class="colophon__legal">
          Forma is a fictional brand, designed and built by
          <a href="${esc(url('/work/forma/'))}">${esc(studio.name)}</a>
          to demonstrate commerce design. Nothing can be bought, no payment details are
          ever requested, and the cart lives only in your own browser.
        </p>
      </div>
    </footer>`;
  },
};
