/**
 * Northwind — B2B observability platform.
 *
 * Design language: dark-first, dense, technical. A tight grid, a monospace
 * accent for anything machine-shaped, and colour reserved almost entirely for
 * data. The marketing site runs the product's own charts, so the palette is
 * built outward from a validated data-visualisation palette rather than the
 * other way round.
 */
import { absolute, each, esc } from '../_lib/html.js';
import { product } from './data.js';
import { studio } from '../../site.config.js';

const nav = [
  { label: 'Platform', href: '/northwind/platform/' },
  { label: 'Pricing', href: '/northwind/pricing/' },
  { label: 'Customers', href: '/northwind/customers/' },
  { label: 'Docs', href: '/northwind/docs/' },
  { label: 'Security', href: '/northwind/security/' },
];

const footerNav = [
  {
    heading: 'Product',
    links: [
      { label: 'Platform overview', href: '/northwind/platform/' },
      { label: 'Metrics', href: '/northwind/features/metrics/' },
      { label: 'Traces', href: '/northwind/features/traces/' },
      { label: 'Logs', href: '/northwind/features/logs/' },
      { label: 'Pricing', href: '/northwind/pricing/' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Documentation', href: '/northwind/docs/' },
      { label: 'Changelog', href: '/northwind/changelog/' },
      { label: 'Customers', href: '/northwind/customers/' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Security', href: '/northwind/security/' },
      { label: 'Book a demo', href: '/northwind/demo/' },
    ],
  },
];

const mark = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true" focusable="false">
  <path d="M5 24V8l11 11 11-11v16" fill="none" stroke="currentColor" stroke-width="2.6"
        stroke-linecap="square"/>
</svg>`;

export default {
  key: 'northwind',
  name: product.name,
  themeColor: '#0b0e14',
  colorScheme: 'dark',
  styles: ['northwind.css'],
  socialImage: '/northwind/assets/social-card.svg',

  // The shared type and motion layers, same as Aurelia. Per-site flags, so
  // Forma and the hub keep their current weight until they get the same pass.
  webfonts: true,
  motion: true,
  favicon: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="32" height="32" rx="7" fill="#0b0e14"/>
    <path d="M6 23V10l10 10 10-10v13" fill="none" stroke="#4f8ff7" stroke-width="2.6"/>
  </svg>`,

  organization: () => ({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: product.name,
    description: product.lede,
    url: absolute('/northwind/'),
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '0',
      highPrice: '499',
      offerCount: 3,
    },
  }),

  header({ url, path }) {
    const current = (href) => (path === href ? ' aria-current="page"' : '');
    return `<header class="topbar" data-header>
      <div class="topbar__inner">
        <a class="logo" href="${esc(url('/northwind/'))}"${current('/northwind/')}>
          <span class="logo__mark" aria-hidden="true">${mark}</span>
          <span class="logo__text">${esc(product.name)}</span>
        </a>

        <button class="topbar__toggle" type="button" aria-expanded="false"
                aria-controls="nw-nav" data-nav-toggle>
          <span class="topbar__bars" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="visually-hidden">Menu</span>
        </button>

        <nav class="topbar__nav" id="nw-nav" aria-label="Primary" data-nav
             data-nav-breakpoint="64em">
          <ul>
            ${each(
              nav,
              (item) =>
                `<li><a href="${esc(url(item.href))}"${current(item.href)}>${esc(item.label)}</a></li>`,
            )}
          </ul>
          <div class="topbar__actions">
            <a class="btn btn--ghost btn--sm" href="${esc(url('/northwind/docs/'))}">Read the docs</a>
            <a class="btn btn--sm" href="${esc(url('/northwind/demo/'))}">Book a demo</a>
          </div>
        </nav>
      </div>
    </header>`;
  },

  footer({ url }) {
    return `<footer class="footer">
      <div class="footer__inner">
        <div class="footer__brand">
          <span class="footer__mark" aria-hidden="true">${mark}</span>
          <p class="footer__tagline">${esc(product.tagline)}</p>
          <p class="footer__meta">
            ${esc(product.customers.toLocaleString('en-US'))} engineering teams ·
            ${esc(product.eventsPerDay)} events a day
          </p>
        </div>

        ${each(
          footerNav,
          (group) => `<nav class="footer__group" aria-label="${esc(group.heading)}">
          <h2 class="footer__heading">${esc(group.heading)}</h2>
          <ul>
            ${each(
              group.links,
              (link) => `<li><a href="${esc(url(link.href))}">${esc(link.label)}</a></li>`,
            )}
          </ul>
        </nav>`,
        )}

        <div class="footer__legal">
          <p>
            Northwind is a fictional product, designed and built by
            <a href="${esc(url('/work/northwind/'))}">${esc(studio.name)}</a>
            to demonstrate technical marketing design. The dashboard runs on generated
            data, no account exists, and no form submits anywhere.
          </p>
          <p class="footer__status">
            <span class="status-dot" data-tone="good" aria-hidden="true"></span>
            All systems operational
          </p>
        </div>
      </div>
    </footer>`;
  },
};
