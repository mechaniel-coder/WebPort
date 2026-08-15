/**
 * Aurelia — boutique coastal hospitality.
 *
 * Design language: warm paper, deep ink, a serif display face and a great deal
 * of air. The arched window from the 1974 building is the recurring motif, and
 * the palette is taken off the bluff — sand, weathered fir, sea fog.
 */
import { each, esc } from '../_lib/html.js';
import { absolute } from '../_lib/html.js';
import { hotel } from './data.js';
import { studio } from '../../site.config.js';

const nav = [
  { label: 'Rooms', href: '/aurelia/rooms/' },
  { label: 'Dining', href: '/aurelia/dining/' },
  { label: 'Experiences', href: '/aurelia/experiences/' },
  { label: 'Journal', href: '/aurelia/journal/' },
  { label: 'Story', href: '/aurelia/story/' },
  { label: 'Contact', href: '/aurelia/contact/' },
];

const mark = `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true" focusable="false">
  <path d="M6 34V19a14 14 0 0 1 28 0v15" fill="none" stroke="currentColor" stroke-width="2.4"/>
  <path d="M20 34V6" stroke="currentColor" stroke-width="2.4" opacity="0.45"/>
</svg>`;

export default {
  key: 'aurelia',
  name: hotel.name,
  themeColor: '#23201c',
  styles: ['aurelia.css'],
  socialImage: '/aurelia/assets/social-card.svg',
  favicon: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="32" height="32" rx="6" fill="#23201c"/>
    <path d="M7 26V16a9 9 0 0 1 18 0v10" fill="none" stroke="#efe9df" stroke-width="2.2"/>
  </svg>`,

  organization: () => ({
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: hotel.legalName,
    description: hotel.tagline,
    url: absolute('/aurelia/'),
    telephone: hotel.phone,
    email: hotel.email,
    numberOfRooms: hotel.rooms,
    priceRange: '$$$$',
    checkinTime: hotel.checkIn,
    checkoutTime: hotel.checkOut,
    address: {
      '@type': 'PostalAddress',
      streetAddress: hotel.address.street,
      addressLocality: hotel.address.locality,
      addressRegion: hotel.address.region,
      postalCode: hotel.address.postalCode,
      addressCountry: hotel.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: hotel.geo.lat,
      longitude: hotel.geo.lng,
    },
    amenityFeature: ['Restaurant', 'Sauna', 'Ocean view', 'Free breakfast', 'Free parking'].map(
      (name) => ({ '@type': 'LocationFeatureSpecification', name, value: true }),
    ),
  }),

  header({ url, path }) {
    const current = (href) => (path === href ? ' aria-current="page"' : '');
    return `<header class="masthead" data-masthead>
      <div class="masthead__inner">
        <a class="brand" href="${esc(url('/aurelia/'))}"${current('/aurelia/')}>
          <span class="brand__mark" aria-hidden="true">${mark}</span>
          <span class="brand__name">${esc(hotel.name)}</span>
        </a>

        <button class="masthead__toggle" type="button"
                aria-expanded="false" aria-controls="primary-nav" data-nav-toggle>
          <span class="masthead__toggle-bars" aria-hidden="true"><i></i><i></i></span>
          <span class="masthead__toggle-label">Menu</span>
        </button>

        <nav class="masthead__nav" id="primary-nav" aria-label="Primary" data-nav>
          <ul>
            ${each(
              nav,
              (item) =>
                `<li><a href="${esc(url(item.href))}"${current(item.href)}>${esc(item.label)}</a></li>`,
            )}
          </ul>
          <a class="button button--sm" href="${esc(url('/aurelia/book/'))}">Check availability</a>
        </nav>
      </div>
    </header>`;
  },

  footer({ url }) {
    return `<footer class="footer">
      <div class="footer__inner">
        <div class="footer__brand">
          <span class="footer__mark" aria-hidden="true">${mark}</span>
          <p class="footer__tagline">${esc(hotel.tagline)}</p>
          <address class="footer__address">
            ${esc(hotel.address.street)}<br>
            ${esc(hotel.address.locality)}, ${esc(hotel.address.region)}
            ${esc(hotel.address.postalCode)}<br>
            <a href="tel:${esc(hotel.phone.replace(/[^+\d]/g, ''))}">${esc(hotel.phone)}</a><br>
            <a href="mailto:${esc(hotel.email)}">${esc(hotel.email)}</a>
          </address>
        </div>

        <nav class="footer__group" aria-label="Footer">
          <h2 class="footer__heading">The property</h2>
          <ul>
            ${each(
              nav,
              (item) =>
                `<li><a href="${esc(url(item.href))}">${esc(item.label)}</a></li>`,
            )}
          </ul>
        </nav>

        <div class="footer__group">
          <h2 class="footer__heading">Stay</h2>
          <ul>
            <li><a href="${esc(url('/aurelia/book/'))}">Check availability</a></li>
            <li><a href="${esc(url('/aurelia/rooms/'))}">Rooms and rates</a></li>
            <li><a href="${esc(url('/aurelia/contact/'))}">Plan a visit</a></li>
          </ul>
          <p class="footer__note">
            Check-in ${esc(hotel.checkIn)} · Check-out ${esc(hotel.checkOut)}
          </p>
        </div>

        <p class="footer__legal">
          Aurelia is a fictional property, designed and built by
          <a href="${esc(url('/work/aurelia/'))}">${esc(studio.name)}</a>
          to demonstrate hospitality web design. No bookings are taken and no
          payment details are collected.
        </p>
      </div>
    </footer>`;
  },
};
