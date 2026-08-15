#!/usr/bin/env node
/**
 * Preview server for dist/ — zero dependencies.
 *
 *   node serve.js            → http://localhost:4173
 *   PORT=8080 node serve.js
 *
 * Honours BASE_PATH, so a subdirectory build can be verified exactly as it will
 * be served (e.g. BASE_PATH=/WebPort/ node build.js && BASE_PATH=/WebPort/ node serve.js).
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { basePath } from './site.config.js';

const outDir = join(dirname(fileURLToPath(import.meta.url)), 'dist');
const port = Number(process.env.PORT || 4173);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

/** Resolve a request path to a file inside dist/, or null. */
async function resolveFile(pathname) {
  let rel = decodeURIComponent(pathname);

  // Strip the configured base path so subdirectory builds serve correctly.
  if (basePath !== '/' && rel.startsWith(basePath)) rel = `/${rel.slice(basePath.length)}`;
  else if (basePath !== '/' && `${rel}/` === basePath) rel = '/';

  const candidate = resolve(outDir, `.${normalize(rel)}`);
  // Refuse to serve anything outside dist/.
  if (candidate !== outDir && !candidate.startsWith(outDir + '/')) return null;

  try {
    const info = await stat(candidate);
    if (info.isDirectory()) {
      const index = join(candidate, 'index.html');
      await stat(index);
      return index;
    }
    return candidate;
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${port}`);
  const file = await resolveFile(pathname);

  if (!file) {
    const notFound = await resolveFile('/404/');
    if (notFound) {
      res.writeHead(404, { 'content-type': MIME['.html'] });
      createReadStream(notFound).pipe(res);
      return;
    }
    res.writeHead(404, { 'content-type': MIME['.txt'] });
    res.end(`404 — ${pathname}\n`);
    return;
  }

  res.writeHead(200, {
    'content-type': MIME[extname(file)] || 'application/octet-stream',
    'cache-control': 'no-cache',
  });
  createReadStream(file).pipe(res);
});

server.listen(port, () => {
  console.log(`\n  Serving dist/ at http://localhost:${port}${basePath === '/' ? '' : basePath}\n`);
});
