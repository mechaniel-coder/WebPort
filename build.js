#!/usr/bin/env node
/**
 * Static site generator — zero dependencies, Node 20+.
 *
 * Walks src/<site>/pages/ for `*.page.js` modules, renders each through the
 * shared document shell, and writes clean-URL HTML into dist/. Also copies each
 * site's assets and emits sitemap.xml / robots.txt.
 *
 *   node build.js
 *   BASE_PATH=/WebPort/ SITE_ORIGIN=https://example.github.io node build.js
 */
import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import config, { basePath, origin, sites as siteKeys } from './site.config.js';
import { document } from './src/_lib/layout.js';
import { absolute, url } from './src/_lib/html.js';

const root = dirname(fileURLToPath(import.meta.url));
const srcDir = join(root, 'src');
const outDir = join(root, 'dist');

/* ── Filesystem helpers ────────────────────────────────────────────────────── */

/** Recursively collect files under `dir` matching `predicate`. */
async function walk(dir, predicate) {
  if (!existsSync(dir)) return [];
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await walk(full, predicate)));
    else if (predicate(entry.name)) found.push(full);
  }
  return found.sort();
}

async function writePage(routePath, html) {
  const segments = routePath.replace(/^\/+|\/+$/g, '');
  const target = join(outDir, segments, 'index.html');
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html, 'utf8');
}

/* ── Route derivation ──────────────────────────────────────────────────────── */

/**
 * Turn a page module's file path into a route, relative to the site mount.
 *
 *   pages/index.page.js            → ''
 *   pages/rooms/index.page.js      → 'rooms'
 *   pages/rooms/dune.page.js       → 'rooms/dune'
 *   pages/shop/[product].page.js   → 'shop'   (collection base; slug appended)
 */
function routeFor(pagesDir, file) {
  const rel = relative(pagesDir, file).split(sep).join('/');
  const withoutExt = rel.replace(/\.page\.js$/, '');
  const parts = withoutExt.split('/');
  const last = parts[parts.length - 1];
  if (last === 'index' || last.startsWith('[')) parts.pop();
  return parts.join('/');
}

function joinRoute(mount, segment) {
  const combined = `${mount}/${segment}`.replace(/\/{2,}/g, '/');
  return combined.endsWith('/') ? combined : `${combined}/`;
}

/* ── Site loading ──────────────────────────────────────────────────────────── */

async function loadSite(key) {
  const modulePath = join(srcDir, key, 'site.js');
  // Missing sites are skipped rather than fatal, so the repository can be built
  // at any point while sites are still being added.
  if (!existsSync(modulePath)) return null;

  const module = await import(pathToFileURL(modulePath).href);
  const site = module.default;

  site.key = site.key || key;
  // The hub is the portfolio landing experience, so it mounts at the root.
  site.mount = site.mount || (key === 'hub' ? '/' : `/${key}/`);
  site.asset = (file) => url(`${site.mount}assets/${file}`.replace(/\/{2,}/g, '/'));
  return site;
}

/* ── Render ────────────────────────────────────────────────────────────────── */

/** Expand a page module into one or more concrete pages. */
async function expand(module, baseRoute) {
  if (typeof module.pages === 'function' || Array.isArray(module.pages)) {
    const entries = typeof module.pages === 'function' ? await module.pages() : module.pages;
    return entries.map((entry) => ({
      route: [baseRoute, entry.slug].filter(Boolean).join('/'),
      meta: entry.meta,
      render: entry.render,
    }));
  }
  if (!module.meta || typeof module.render !== 'function') {
    throw new Error('Page module must export `meta` + `render`, or a `pages` collection.');
  }
  return [{ route: baseRoute, meta: module.meta, render: module.render }];
}

async function buildSite(key, routes) {
  const site = await loadSite(key);
  if (!site) {
    console.warn(`  – ${key.padEnd(10)} skipped (src/${key}/site.js not present yet)`);
    return 0;
  }
  const pagesDir = join(srcDir, key, 'pages');
  const files = await walk(pagesDir, (name) => name.endsWith('.page.js'));

  if (files.length === 0) {
    console.warn(`  ! ${key}: no pages found`);
    return 0;
  }

  let count = 0;
  for (const file of files) {
    const module = await import(pathToFileURL(file).href);
    const baseRoute = routeFor(pagesDir, file);

    for (const page of await expand(module, baseRoute)) {
      const path = joinRoute(site.mount, page.route);
      const ctx = {
        site,
        page: page.meta,
        path,
        studio: config.studio,
        url,
        asset: site.asset,
        absolute,
      };

      const content = page.render(ctx);
      await writePage(path, document({ site, page: page.meta, path, content, ctx }));

      if (!page.meta.noindex) {
        routes.push({ path, priority: page.meta.priority ?? (path === site.mount ? 1.0 : 0.7) });
      }
      count += 1;
    }
  }

  // Site assets → dist/<mount>/assets
  const assetsDir = join(srcDir, key, 'assets');
  if (existsSync(assetsDir)) {
    await cp(assetsDir, join(outDir, site.mount.replace(/^\/+/, ''), 'assets'), { recursive: true });
  }

  console.log(`  ✓ ${key.padEnd(10)} ${String(count).padStart(3)} pages  →  ${site.mount}`);
  return count;
}

/* ── Sitemap / robots ──────────────────────────────────────────────────────── */

async function writeSitemap(routes) {
  const today = new Date().toISOString().slice(0, 10);
  const entries = routes
    .map(
      ({ path, priority }) =>
        `  <url>\n    <loc>${absolute(path)}</loc>\n    <lastmod>${today}</lastmod>\n` +
        `    <priority>${priority.toFixed(1)}</priority>\n  </url>`,
    )
    .join('\n');

  await writeFile(
    join(outDir, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`,
    'utf8',
  );

  await writeFile(
    join(outDir, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${origin}${url('/sitemap.xml')}\n`,
    'utf8',
  );
}

/* ── Entry point ───────────────────────────────────────────────────────────── */

async function main() {
  const started = Date.now();
  console.log(`\nBuilding → dist/   base="${basePath}"  origin="${origin}"\n`);

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const routes = [];
  let total = 0;
  for (const key of siteKeys) total += await buildSite(key, routes);

  // Shared reset, copied rather than duplicated per site.
  await mkdir(join(outDir, 'shared'), { recursive: true });
  await cp(join(srcDir, '_lib', 'reset.css'), join(outDir, 'shared', 'reset.css'));

  await writeSitemap(routes);

  // GitHub Pages: skip Jekyll so paths beginning with `_` are served verbatim.
  await writeFile(join(outDir, '.nojekyll'), '', 'utf8');

  console.log(`\n${total} pages in ${Date.now() - started}ms\n`);
}

main().catch((error) => {
  console.error(`\nBuild failed: ${error.message}\n`);
  console.error(error.stack);
  process.exitCode = 1;
});
