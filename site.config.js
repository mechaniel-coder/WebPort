/**
 * Global configuration for every site in this repository.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  RENAME ME
 *  `studio.name` is the single placeholder identity referenced across all four
 *  sites — the hub masthead, every footer credit, the JSON-LD Organization
 *  record, and the case-study bylines. Change it here and it changes everywhere.
 *  The adjacent fields (email, social, location) are placeholders too.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const studio = {
  name: 'Studio Meridian',
  shortName: 'Meridian',
  tagline: 'Design and engineering for brands that need to be taken seriously.',
  email: 'hello@example.com',
  phone: '+1 (000) 000-0000',
  location: 'Remote — worldwide',
  social: [
    { label: 'GitHub', href: 'https://github.com/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
    { label: 'Dribbble', href: 'https://dribbble.com/' },
  ],
};

/**
 * Absolute origin used for canonical URLs, Open Graph tags and sitemap entries.
 *
 * This is the domain the portfolio is hosted on. Change it here if that moves,
 * or override per build:  SITE_ORIGIN=https://staging.example.net npm run build
 *
 * Note this is separate from the placeholder addresses on the three client
 * sites — those deliberately use example.com, which is the reserved
 * documentation domain, because the brands are fictional.
 */
export const origin = (process.env.SITE_ORIGIN || 'https://exostech.pro').replace(/\/+$/, '');

/**
 * Path prefix the built output will be served from.
 *
 *   '/'          → hosting `dist/` at a domain root (the committed build)
 *   '/WebPort/'  → GitHub Pages project site (the Actions workflow uses this)
 *
 * Every internal link runs through the `url()` helper in src/_lib/html.js, so
 * this is the only place the prefix is defined.
 */
export const basePath = normalizeBase(process.env.BASE_PATH || '/');

function normalizeBase(value) {
  let base = String(value).trim();
  if (!base.startsWith('/')) base = `/${base}`;
  if (!base.endsWith('/')) base = `${base}/`;
  return base.replace(/\/{2,}/g, '/');
}

/**
 * Build order. `hub` is listed first so it is the landing experience; the three
 * client sites follow. Adding a directory under src/ and listing it here is all
 * that is required to add a site.
 */
export const sites = ['hub', 'aurelia', 'northwind', 'forma', 'vestra', 'lab'];

export default { studio, origin, basePath, sites };
