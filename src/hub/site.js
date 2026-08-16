/**
 * The portfolio hub — mounted at the root, this is the site that frames the
 * other three as commissioned work.
 *
 * Design language: warm paper ground, near-black ink, a single saturated accent,
 * and a large typographic scale. Deliberately quiet, because everything it
 * frames is loud.
 */
import { esc, each } from '../_lib/html.js';
import { organization } from '../_lib/seo.js';
import { studio } from '../../site.config.js';
import { studies as work } from './data.js';

const nav = [
  { label: 'Work', href: '/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
];

/**
 * The three case studies, referenced by the nav, the index and the footer.
 * Defined once in data.js so the footer, the index and the case study pages
 * cannot disagree about what the work was.
 */
export { studies as work } from './data.js';

const mark = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <rect width="32" height="32" rx="7" fill="#12110f"/>
  <path d="M8 22V10l8 7 8-7v12" fill="none" stroke="#f5f1e8" stroke-width="2.6"
        stroke-linecap="square" stroke-linejoin="miter"/>
</svg>`;

export default {
  key: 'hub',
  name: studio.name,
  mount: '/',
  themeColor: '#12110f',
  styles: ['hub.css'],
  socialImage: '/assets/social-card.svg',
  favicon: mark,

  organization: () =>
    organization({
      name: studio.name,
      description: studio.tagline,
      type: 'ProfessionalService',
    }),

  header({ url, path }) {
    return `<header class="masthead">
      <div class="shell masthead__inner">
        <a class="wordmark" href="${esc(url('/'))}"${path === '/' ? ' aria-current="page"' : ''}>
          <span class="wordmark__mark" aria-hidden="true">${mark}</span>
          <span class="wordmark__text">${esc(studio.name)}</span>
        </a>
        <nav aria-label="Primary">
          <ul class="masthead__nav">
            ${each(
              nav,
              (item) => `<li>
              <a href="${esc(url(item.href))}"${
                path === item.href ? ' aria-current="page"' : ''
              }>${esc(item.label)}</a>
            </li>`,
            )}
          </ul>
        </nav>
      </div>
    </header>`;
  },

  footer({ url }) {
    return `<footer class="colophon">
      <div class="shell colophon__inner">
        <div class="colophon__brand">
          <p class="colophon__name">${esc(studio.name)}</p>
          <p class="colophon__tagline">${esc(studio.tagline)}</p>
        </div>

        <nav class="colophon__group" aria-label="Case studies">
          <h2 class="colophon__heading">Work</h2>
          <ul>
            ${each(
              work,
              (item) =>
                `<li><a href="${esc(url(`/work/${item.slug}/`))}">${esc(item.name)}</a></li>`,
            )}
          </ul>
        </nav>

        <nav class="colophon__group" aria-label="Elsewhere">
          <h2 class="colophon__heading">Elsewhere</h2>
          <ul>
            ${each(
              studio.social,
              (item) =>
                `<li><a href="${esc(item.href)}" rel="me noopener">${esc(item.label)}</a></li>`,
            )}
            <li><a href="mailto:${esc(studio.email)}">${esc(studio.email)}</a></li>
          </ul>
        </nav>

        <p class="colophon__legal">
          © ${new Date().getFullYear()} ${esc(studio.name)}. Aurelia, Northwind and Forma are
          fictional brands created to demonstrate design and engineering capability.
        </p>
      </div>
    </footer>`;
  },
};
