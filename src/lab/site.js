/**
 * Meridian Lab — the studio's own R&D.
 *
 * Design language: true black, monospace throughout, an acid accent that shifts
 * per experiment, and visible measurement rules. An instrument panel rather than
 * a product — deliberately unlike Northwind, which is also dark but is a polished
 * commercial SaaS surface in a humanist sans.
 */
import { absolute, each, esc } from '../_lib/html.js';
import { experiments, lab } from './data.js';
import { studio } from '../../site.config.js';

const nav = experiments.map((entry) => ({
  label: entry.name,
  href: `/lab/${entry.slug}/`,
  index: entry.index,
}));

const mark = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true" focusable="false">
  <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-width="2"/>
  <circle cx="16" cy="16" r="4" fill="currentColor"/>
  <path d="M16 1v6M16 25v6M1 16h6M25 16h6" stroke="currentColor" stroke-width="2"/>
</svg>`;

export default {
  key: 'lab',
  name: lab.name,
  themeColor: '#000000',
  colorScheme: 'dark',
  styles: ['lab.css'],

  // Type only. The motion layer is deliberately NOT enabled here: this site's
  // own copy says "no GSAP, no scroll library, no dependencies at all", and
  // loading GSAP onto it would make that claim false. Reveals are done the
  // lab's way instead — native CSS scroll-driven animation, no JavaScript.
  webfonts: true,
  socialImage: '/lab/assets/social-card.svg',
  favicon: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="32" height="32" fill="#000"/>
    <circle cx="16" cy="16" r="10" fill="none" stroke="#c3f53c" stroke-width="2.5"/>
    <circle cx="16" cy="16" r="3" fill="#c3f53c"/>
  </svg>`,

  organization: () => ({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: lab.name,
    description: lab.lede,
    url: absolute('/lab/'),
    isPartOf: { '@type': 'WebSite', name: studio.name, url: absolute('/') },
  }),

  header({ url, path }) {
    const current = (href) => (path === href ? ' aria-current="page"' : '');
    return `<header class="rig">
      <div class="rig__inner">
        <a class="sigil" href="${esc(url('/lab/'))}"${current('/lab/')}>
          <span class="sigil__mark" aria-hidden="true">${mark}</span>
          <span class="sigil__text">${esc(lab.name)}</span>
        </a>

        <button class="rig__toggle" type="button" aria-expanded="false"
                aria-controls="lab-nav" data-nav-toggle>
          <span aria-hidden="true">≡</span>
          <span class="visually-hidden">Menu</span>
        </button>

        <nav class="rig__nav" id="lab-nav" aria-label="Experiments" data-nav
             data-nav-breakpoint="56em">
          <ul>
            ${each(
              nav,
              (item) => `<li>
              <a href="${esc(url(item.href))}"${current(item.href)}>
                <span class="rig__idx" aria-hidden="true">${esc(item.index)}</span>
                ${esc(item.label)}
              </a>
            </li>`,
            )}
          </ul>
          <a class="rig__out" href="${esc(url('/'))}">↖ ${esc(studio.name)}</a>
        </nav>
      </div>
    </header>`;
  },

  footer({ url }) {
    return `<footer class="endplate">
      <div class="endplate__inner">
        <div>
          <span class="endplate__mark" aria-hidden="true">${mark}</span>
          <p class="endplate__line">${esc(lab.tagline)}</p>
        </div>

        <nav class="endplate__group" aria-label="Experiments">
          <h2 class="endplate__heading">Experiments</h2>
          <ul>
            ${each(
              experiments,
              (entry) => `<li>
              <a href="${esc(url(`/lab/${entry.slug}/`))}">
                <span aria-hidden="true">${esc(entry.index)}</span> ${esc(entry.name)}
              </a>
            </li>`,
            )}
          </ul>
        </nav>

        <nav class="endplate__group" aria-label="Studio">
          <h2 class="endplate__heading">Studio</h2>
          <ul>
            <li><a href="${esc(url('/'))}">Work</a></li>
            <li><a href="${esc(url('/lab/colophon/'))}">Colophon</a></li>
            <li><a href="${esc(url('/contact/'))}">Contact</a></li>
          </ul>
        </nav>

        <p class="endplate__legal">
          The lab is in-house research by <a href="${esc(url('/'))}">${esc(studio.name)}</a>,
          not client work. Every experiment is raw platform code — no rendering engine, no
          physics engine, no scroll library, no dependencies of any kind.
        </p>
      </div>
    </footer>`;
  },
};
