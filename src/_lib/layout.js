/**
 * The document shell every page is rendered into.
 *
 * Site-specific chrome (header, footer) is supplied by each site's own site.js
 * so the three design systems stay genuinely independent — the only thing
 * shared here is document structure and accessibility scaffolding.
 */
import { esc } from './html.js';
import { head } from './seo.js';

export function document({ site, page, path, content, ctx }) {
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
    ${scripts}
  </body>
</html>
`;
}
