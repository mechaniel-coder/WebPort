/**
 * The document shell every page is rendered into.
 *
 * Site-specific chrome (header, footer) is supplied by each site's own site.js
 * so the three design systems stay genuinely independent — the only thing
 * shared here is document structure and accessibility scaffolding.
 */
import { esc, url } from './html.js';
import { head } from './seo.js';

/**
 * The motion libraries, in dependency order.
 *
 * Plain `defer` scripts rather than modules. GSAP's distributed builds are UMD,
 * and loading them as modules would mean either a bundler or an import map for
 * no gain — `defer` already gets execution after parsing, in order, without
 * blocking the parser. motion.js comes last and reads them off `window`.
 */
const MOTION_SCRIPTS = [
  '/shared/js/gsap.min.js',
  '/shared/js/ScrollTrigger.min.js',
  '/shared/js/SplitText.min.js',
  '/shared/js/lenis.min.js',
  '/shared/motion.js',
];

export function document({ site, page, path, content, ctx }) {
  const motion = site.motion
    ? MOTION_SCRIPTS.map((file) => `<script defer src="${esc(url(file))}"></script>`).join(
        '\n    ',
      )
    : '';

  const scripts = (page.scripts || [])
    .map((file) => `<script type="module" src="${esc(site.asset(file))}"></script>`)
    .join('\n    ');

  return `<!doctype html>
<html lang="en"${site.colorScheme ? ` data-color-scheme="${esc(site.colorScheme)}"` : ''}>
  <head>
    ${head({ site, page, path })}
  </head>
  <body class="${esc([`site-${site.key}`, page.bodyClass].filter(Boolean).join(' '))}">
    <a class="skip-link" href="#main">Skip to main content</a>
    ${site.header(ctx)}
    <main id="main" tabindex="-1">
${content}
    </main>
    ${site.footer(ctx)}
    ${motion}
    ${scripts}
  </body>
</html>
`;
}
