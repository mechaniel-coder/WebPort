/**
 * Head construction and structured-data builders.
 *
 * Every page gets a unique title and description, a canonical URL, Open Graph
 * and Twitter card tags, and at least one JSON-LD record. Search engines and
 * link unfurlers are a first-class audience for marketing sites, so this is
 * centralised rather than left to individual pages to remember.
 */
import { absolute, esc, escJson, oneLine, url } from './html.js';
import { bootTag } from './boot.js';
import { studio } from '../../site.config.js';

/**
 * Fonts worth blocking the render for, per site.
 *
 * Only the faces a reader sees first — the display face and the one the body
 * copy is set in. Preloading the whole family list would make a monospace used
 * for small metadata compete for bandwidth during the exact window that decides
 * how quickly the page looks finished.
 *
 * Keyed by site because the sites do not share a typeface: preloading Aurelia's
 * serif on Northwind would be a wasted request on every page, which is worse
 * than not preloading at all.
 */
const PRELOAD_FONTS = {
  aurelia: ['newsreader-var.woff2', 'familjen-var.woff2'],
  northwind: ['redhat-display-var.woff2', 'redhat-text-var.woff2'],
  forma: ['chivo-var.woff2', 'chivo-mono-var.woff2'],
  hub: ['schibsted-var.woff2', 'jetbrains-var.woff2'],
  lab: ['jetbrains-var.woff2', 'schibsted-var.woff2'],
  // Vestra runs on one family, so there is only one file worth the priority.
  vestra: ['epilogue-var.woff2'],
};

/**
 * Compose the <head> for a page.
 *
 * @param {object} options
 * @param {object} options.site  the site definition (src/<site>/site.js)
 * @param {object} options.page  the page's exported `meta`
 * @param {string} options.path  repo-root-relative path, e.g. '/aurelia/rooms/'
 */
export function head({ site, page, path }) {
  const title = page.metaTitle || `${page.title} — ${site.name}`;
  const description = oneLine(page.description);
  const canonical = absolute(path);
  const social = page.socialImage || site.socialImage;
  const socialUrl = social ? absolute(social) : null;

  const records = [];
  if (site.organization) records.push(site.organization());
  if (page.jsonld) records.push(...[].concat(page.jsonld));
  if (page.breadcrumbs) records.push(breadcrumbList(page.breadcrumbs));

  return [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    `<link rel="canonical" href="${esc(canonical)}">`,
    `<meta name="theme-color" content="${esc(site.themeColor)}">`,
    page.noindex ? '<meta name="robots" content="noindex, follow">' : '',

    // Open Graph
    `<meta property="og:type" content="${esc(page.ogType || 'website')}">`,
    `<meta property="og:site_name" content="${esc(site.name)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${esc(canonical)}">`,
    socialUrl ? `<meta property="og:image" content="${esc(socialUrl)}">` : '',
    socialUrl ? '<meta property="og:image:width" content="1200">' : '',
    socialUrl ? '<meta property="og:image:height" content="630">' : '',

    // Twitter
    `<meta name="twitter:card" content="${socialUrl ? 'summary_large_image' : 'summary'}">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
    socialUrl ? `<meta name="twitter:image" content="${esc(socialUrl)}">` : '',

    // Icons — an inline SVG mark, so there is no extra request and no binary asset.
    site.favicon ? `<link rel="icon" href="${esc(svgDataUri(site.favicon))}">` : '',

    // Fonts, before the stylesheets that use them. `crossorigin` is required
    // on a font preload even same-origin: fonts are always fetched in CORS
    // mode, and a preload whose mode does not match is discarded and fetched
    // a second time — the exact opposite of the intent.
    ...(site.webfonts
      ? (PRELOAD_FONTS[site.key] || []).map(
          (file) =>
            `<link rel="preload" as="font" type="font/woff2" crossorigin href="${esc(
              url(`/shared/fonts/${file}`),
            )}">`,
        )
      : []),

    // Styles. Shared reset first, then type, then the site's own design system.
    `<link rel="stylesheet" href="${esc(url('/shared/reset.css'))}">`,
    site.webfonts ? `<link rel="stylesheet" href="${esc(url('/shared/type.css'))}">` : '',
    site.motion ? `<link rel="stylesheet" href="${esc(url('/shared/motion.css'))}">` : '',
    // Site-wide styles, then any stylesheet a single page opts into.
    ...[...(site.styles || []), ...(page.styles || [])].map(
      (file) => `<link rel="stylesheet" href="${esc(site.asset(file))}">`,
    ),

    // Must run before first paint — see src/_lib/boot.js.
    site.motion ? bootTag() : '',

    ...records.map(
      (record) => `<script type="application/ld+json">${escJson(record)}</script>`,
    ),
  ]
    .filter(Boolean)
    .join('\n    ');
}

/** Inline an SVG string as a data URI, safe for use in an href attribute. */
export function svgDataUri(svg) {
  const compact = svg.replace(/\s+/g, ' ').trim();
  return `data:image/svg+xml,${encodeURIComponent(compact)}`;
}

/* ── Structured data builders ──────────────────────────────────────────────── */

export function organization({ name, description, sameAs = [], type = 'Organization' } = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    name: name || studio.name,
    description,
    url: absolute('/'),
    sameAs: sameAs.length ? sameAs : studio.social.map((entry) => entry.href),
  };
}

export function breadcrumbList(trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: absolute(crumb.href),
    })),
  };
}

export function article({ title, description, published, modified, path, section }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: oneLine(description),
    datePublished: published,
    dateModified: modified || published,
    articleSection: section,
    mainEntityOfPage: absolute(path),
    author: { '@type': 'Organization', name: studio.name },
  };
}

export function faqPage(entries) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: oneLine(answer) },
    })),
  };
}
