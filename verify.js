#!/usr/bin/env node
/**
 * Integrity checker for the built output — zero dependencies.
 *
 * This is the gate that decides whether a build is shippable. It checks the
 * things that silently rot in a static site and that nobody notices until a
 * client does: dead internal links, missing metadata, unlabelled graphics,
 * malformed structured data, duplicate ids.
 *
 *   node verify.js
 *
 * Exits non-zero if any error-level check fails.
 */
import { readFile, readdir } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { basePath, origin } from './site.config.js';
import { CSP_HASH, SNIPPET } from './src/_lib/boot.js';

const root = dirname(fileURLToPath(import.meta.url));
const outDir = join(root, 'dist');

const errors = [];
const warnings = [];

const fail = (file, message) => errors.push({ file, message });
const warn = (file, message) => warnings.push({ file, message });

/* ── Helpers ───────────────────────────────────────────────────────────────── */

async function walk(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await walk(full)));
    else found.push(full);
  }
  return found;
}

/** All matches of a global regex, returning capture group `group`. */
function matchAll(html, regex, group = 1) {
  return [...html.matchAll(regex)].map((match) => match[group]);
}

/** Strip tags and entities to approximate an element's text content. */
function textOf(fragment) {
  return fragment
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function attrOf(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i'));
  return match ? match[1] : null;
}

/**
 * Map an in-page URL to a file on disk.
 * Returns { path, fragment } or null for external/non-resolvable schemes.
 */
function toDiskPath(href) {
  if (!href) return null;
  // Canonical, Open Graph and sitemap URLs are absolute but point at our own
  // output, so resolve them rather than dismissing them as external.
  if (href.startsWith(`${origin}/`)) href = href.slice(origin.length);
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) return null; // external, mailto, tel, data
  if (href.startsWith('#')) return { path: null, fragment: href.slice(1) };
  if (!href.startsWith('/')) return null; // relative paths are not used by this build

  const [pathPart, fragment] = href.split('#');
  let rel = pathPart;
  if (basePath !== '/' && rel.startsWith(basePath)) rel = `/${rel.slice(basePath.length)}`;

  const candidate = resolve(outDir, `.${rel}`);
  const withIndex = rel.endsWith('/') ? join(candidate, 'index.html') : candidate;

  if (existsSync(withIndex) && statSync(withIndex).isFile()) {
    return { path: withIndex, fragment: fragment || null };
  }
  // Extensionless path that is really a directory.
  const asDir = join(candidate, 'index.html');
  if (existsSync(asDir)) return { path: asDir, fragment: fragment || null };

  return { path: false, fragment: fragment || null, attempted: pathPart };
}

/* ── Per-document checks ───────────────────────────────────────────────────── */

function checkDocument(file, html, name) {
  // --- Document basics -----------------------------------------------------
  if (!/<html[^>]*\slang="[a-z-]+"/i.test(html)) {
    fail(name, 'missing <html lang="…">');
  }

  // Scope the title check to <head>. Inline SVG legitimately uses <title> for
  // accessible names, and those must not be counted as document titles.
  const headHtml = html.slice(0, html.search(/<\/head>/i) + 1 || html.length);
  const titles = matchAll(headHtml, /<title>([\s\S]*?)<\/title>/gi);
  if (titles.length !== 1) fail(name, `expected exactly 1 <title>, found ${titles.length}`);
  else if (!titles[0].trim()) fail(name, 'empty <title>');
  else if (titles[0].length > 70) warn(name, `<title> is ${titles[0].length} chars (>70 may truncate in SERPs)`);

  const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  if (!description) fail(name, 'missing meta description');
  else if (!description[1].trim()) fail(name, 'empty meta description');
  else if (description[1].length > 165) {
    warn(name, `meta description is ${description[1].length} chars (>165 may truncate)`);
  }

  if (!/<link\s+rel="canonical"\s+href="[^"]+"/i.test(html)) fail(name, 'missing canonical link');

  // --- Heading structure ---------------------------------------------------
  const h1s = matchAll(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi);
  if (h1s.length === 0) fail(name, 'no <h1>');
  else if (h1s.length > 1) fail(name, `${h1s.length} <h1> elements (expected 1)`);
  else if (!textOf(h1s[0])) fail(name, '<h1> has no text content');

  // --- Structured data -----------------------------------------------------
  for (const block of matchAll(
    html,
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi,
  )) {
    try {
      const parsed = JSON.parse(block);
      if (!parsed['@context'] || !parsed['@type']) {
        fail(name, 'JSON-LD block missing @context or @type');
      }
    } catch (error) {
      fail(name, `malformed JSON-LD: ${error.message}`);
    }
  }

  // --- Duplicate ids -------------------------------------------------------
  const ids = matchAll(html, /\sid="([^"]+)"/gi);
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) fail(name, `duplicate id="${id}"`);
    seen.add(id);
  }

  // --- Images and graphics -------------------------------------------------
  for (const tag of matchAll(html, /(<img\b[^>]*>)/gi)) {
    if (attrOf(tag, 'alt') === null) fail(name, `<img> without alt: ${tag.slice(0, 80)}`);
  }

  // A <canvas> is a bitmap with no semantics at all — assistive technology gets
  // nothing from it unless the element itself is labelled or explicitly hidden.
  for (const tag of matchAll(html, /(<canvas\b[^>]*>)/gi)) {
    const hidden = /aria-hidden\s*=\s*"true"/i.test(tag);
    const named = attrOf(tag, 'aria-label') || attrOf(tag, 'aria-labelledby');
    if (!hidden && !named) {
      fail(name, `<canvas> has no accessible name and is not aria-hidden: ${tag.slice(0, 80)}`);
    }
    // A labelled canvas is being presented as content, so it needs a role too —
    // otherwise it is announced as an unlabelled generic element.
    if (named && !/role\s*=\s*"/i.test(tag)) {
      fail(name, `<canvas> has an accessible name but no role: ${tag.slice(0, 80)}`);
    }
  }

  // Inline SVG must either be hidden from AT or carry an accessible name.
  for (const match of html.matchAll(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/gi)) {
    const [, attributes, inner] = match;
    const hidden = /aria-hidden\s*=\s*"true"/i.test(attributes);
    const labelled =
      /aria-label\s*=\s*"[^"]+"/i.test(attributes) ||
      /aria-labelledby\s*=\s*"[^"]+"/i.test(attributes) ||
      /<title\b/i.test(inner);
    if (!hidden && !labelled) {
      fail(name, 'inline <svg> is neither aria-hidden nor given an accessible name');
    }
  }

  // --- Controls with no accessible name ------------------------------------
  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const [, attributes, inner] = match;
    const href = attrOf(`<a${attributes}>`, 'href');
    if (!href) continue;
    const named = textOf(inner) || /aria-label\s*=\s*"[^"]+"/i.test(attributes);
    if (!named) fail(name, `link to "${href}" has no accessible name`);
  }

  for (const match of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    const [, attributes, inner] = match;
    const named = textOf(inner) || /aria-label(?:ledby)?\s*=\s*"[^"]+"/i.test(attributes);
    if (!named) fail(name, 'button has no accessible name');
  }

  // --- Form labelling ------------------------------------------------------
  // A control is labelled explicitly (<label for>), implicitly (wrapped in a
  // <label> that has text), or via ARIA. All three are valid.
  const labelBlocks = [...html.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/gi)].filter(
    (match) => textOf(match[1]),
  );

  for (const tag of matchAll(html, /(<(?:input|select|textarea)\b[^>]*>)/gi)) {
    const type = (attrOf(tag, 'type') || 'text').toLowerCase();
    if (['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) continue;

    const id = attrOf(tag, 'id');
    const labelled =
      (id && new RegExp(`<label[^>]*\\sfor="${id}"`, 'i').test(html)) ||
      labelBlocks.some((match) => match[0].includes(tag)) ||
      attrOf(tag, 'aria-label') ||
      attrOf(tag, 'aria-labelledby');

    if (!labelled) fail(name, `form control has no associated label: ${tag.slice(0, 90)}`);
  }

  // --- Internal links ------------------------------------------------------
  const references = [
    ...matchAll(html, /<a\b[^>]*\shref="([^"]+)"/gi),
    ...matchAll(html, /<link\b[^>]*\shref="([^"]+)"/gi),
    ...matchAll(html, /<script\b[^>]*\ssrc="([^"]+)"/gi),
    ...matchAll(html, /<img\b[^>]*\ssrc="([^"]+)"/gi),
    ...matchAll(html, /<(?:use|image)\b[^>]*\shref="([^"]+)"/gi),
    // Social card images are referenced only from meta tags, so a missing one is
    // invisible until a link is shared somewhere. Resolve them like any other asset.
    ...matchAll(html, /<meta\b[^>]*\s(?:property|name)="(?:og|twitter):image"[^>]*\scontent="([^"]+)"/gi),
  ];

  for (const href of references) {
    const resolved = toDiskPath(href);
    if (!resolved) continue;

    if (resolved.path === false) {
      fail(name, `broken internal link → ${resolved.attempted}`);
      continue;
    }
    // Same-document fragment: the target id must exist here.
    if (resolved.path === null && resolved.fragment) {
      if (!seen.has(resolved.fragment)) {
        fail(name, `fragment #${resolved.fragment} has no matching id`);
      }
    }
  }
}

/* ── Cross-file consistency ────────────────────────────────────────────────── */

/**
 * The inline boot snippet is allowed by a SHA-256 hash rather than by opening
 * the policy with 'unsafe-inline'. That means three host configurations quote a
 * hash of a fourth file's contents, and nothing in the browser tells you when
 * they disagree — the script is just silently blocked, and the only symptom is
 * that reveal animations stop working on production but not locally.
 *
 * So the hash is recomputed from source here and every config that carries one
 * is checked against it.
 */
async function checkCspHash() {
  const consumers = [
    'netlify.toml',
    'vercel.json',
    join('deploy', 'aws', 'README.md'),
  ];

  for (const name of consumers) {
    const path = join(root, name);
    if (!existsSync(path)) {
      warn(name, 'expected to carry the CSP hash, but the file is missing');
      continue;
    }

    const text = await readFile(path, 'utf8');
    const quoted = [...text.matchAll(/sha256-[A-Za-z0-9+/]+=*/g)].map((m) => m[0]);

    if (!quoted.length) {
      fail(name, `no CSP hash found — the inline boot script needs '${CSP_HASH}'`);
      continue;
    }
    for (const found of quoted) {
      if (found !== CSP_HASH) {
        fail(
          name,
          `stale CSP hash '${found}' — src/_lib/boot.js now hashes to '${CSP_HASH}'`,
        );
      }
    }
  }

  // The snippet must also actually appear in the built pages that claim motion,
  // byte-for-byte. A build that emits a re-formatted copy would hash differently
  // and be blocked in production while passing every check above.
  const motionPages = [];
  for (const file of await walk(outDir)) {
    if (!file.endsWith('.html')) continue;
    const html = await readFile(file, 'utf8');
    if (!html.includes('/shared/motion.js')) continue;
    motionPages.push(file);
    if (!html.includes(SNIPPET)) {
      fail(
        relative(outDir, file).split(sep).join('/'),
        'loads motion.js but does not contain the exact boot snippet',
      );
    }
  }
  if (!motionPages.length) warn('dist/', 'no page loads the motion system');
}

/* ── Entry point ───────────────────────────────────────────────────────────── */

async function main() {
  if (!existsSync(outDir)) {
    console.error('\ndist/ does not exist — run `node build.js` first.\n');
    process.exit(1);
  }

  const files = await walk(outDir);
  const pages = files.filter((file) => file.endsWith('.html'));

  for (const file of pages) {
    const name = relative(outDir, file).split(sep).join('/');
    checkDocument(file, await readFile(file, 'utf8'), name);
  }

  // Build-level expectations.
  for (const required of ['sitemap.xml', 'robots.txt', '.nojekyll']) {
    if (!existsSync(join(outDir, required))) fail('dist/', `missing ${required}`);
  }

  await checkCspHash();

  const report = (list, label) => {
    if (!list.length) return;
    console.log(`\n${label} (${list.length})\n`);
    const grouped = new Map();
    for (const item of list) {
      if (!grouped.has(item.file)) grouped.set(item.file, []);
      grouped.get(item.file).push(item.message);
    }
    for (const [file, messages] of grouped) {
      console.log(`  ${file}`);
      for (const message of messages) console.log(`    · ${message}`);
    }
  };

  report(warnings, 'Warnings');
  report(errors, 'Errors');

  console.log(
    `\nChecked ${pages.length} pages — ${errors.length} errors, ${warnings.length} warnings\n`,
  );
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
