#!/usr/bin/env node
/**
 * Browser verification — loads every built page in Chromium, fails on console
 * errors, and drives each site's signature interactive system end to end.
 *
 * This is the check that static analysis cannot do: verify.js proves the HTML is
 * sound, this proves the JavaScript actually works.
 *
 *   npm install playwright-core   (dev only — never needed to host the sites)
 *   node browser-check.js
 *   node browser-check.js --shots  (also write responsive screenshots)
 *
 * Skips with a clear message if playwright-core is not installed, so it never
 * blocks a plain `npm run check`.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { basePath } from './site.config.js';

const PORT = 4199;
const HOST = `http://localhost:${PORT}`;
// Scenarios address pages as `${ORIGIN}/aurelia/book/`, so folding the base path
// in here makes every one of them work unchanged against a subdirectory build.
const ORIGIN = `${HOST}${basePath.replace(/\/$/, '')}`;
const SHOTS = process.argv.includes('--shots');
const BREAKPOINTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'desktop', width: 1440, height: 900 },
];

let chromium;
try {
  ({ chromium } = await import('playwright-core'));
} catch {
  console.log('\nplaywright-core is not installed — skipping browser checks.');
  console.log('Install it with `npm install playwright-core` to run them.\n');
  process.exit(0);
}

const executablePath = findChromium();

function findChromium() {
  const candidates = [
    process.env.CHROMIUM_PATH,
    '/opt/pw-browsers/chromium/chrome-linux/chrome',
    '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
  ].filter(Boolean);
  return candidates.find((path) => existsSync(path)) || null;
}

/* ── Server ────────────────────────────────────────────────────────────────── */

async function withServer(run) {
  const server = spawn(process.execPath, ['serve.js'], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'ignore',
  });

  try {
    for (let attempt = 0; attempt < 60; attempt += 1) {
      try {
        const response = await fetch(`${HOST}/`);
        if (response.ok) break;
      } catch {
        /* not up yet */
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return await run();
  } finally {
    server.kill();
  }
}

/* ── Assertions ────────────────────────────────────────────────────────────── */

const failures = [];
const notes = [];

function check(label, condition, detail = '') {
  if (condition) notes.push(`  ✓ ${label}`);
  else failures.push(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
}

/* ── Scenarios ─────────────────────────────────────────────────────────────── */

/** Drive Aurelia's booking flow from empty calendar to confirmation. */
async function bookingScenario(page) {
  await page.goto(`${ORIGIN}/aurelia/book/`, { waitUntil: 'networkidle' });

  // Pick the first selectable arrival at least a week out, then a departure.
  const days = page.locator('[data-date][aria-disabled="false"]');
  const total = await days.count();
  check('booking: calendar rendered selectable days', total > 10, `${total} found`);
  if (total < 4) return;

  await days.nth(2).click();
  const arrival = await page.locator('[data-date][aria-selected="true"]').first().textContent();
  check('booking: arrival selected', Boolean(arrival));

  // After choosing an arrival, pick a departure two nights later.
  const departure = page.locator('[data-date][aria-disabled="false"]').nth(4);
  await departure.click();

  const nextButton = page.locator('[data-next="dates"]');
  check('booking: continue enabled after a range', !(await nextButton.isDisabled()));

  const summary = await page.locator('[data-summary]').textContent();
  check('booking: summary shows a total', /\$[\d,]+/.test(summary), summary.slice(0, 60));

  await nextButton.click();
  check('booking: advanced to room step', await page.locator('[data-panel="room"]').isVisible());

  const available = page.locator('.option[data-available="true"] input');
  const options = await available.count();
  check('booking: at least one room available', options > 0, `${options} available`);
  if (options === 0) return;

  await available.first().check({ force: true });
  await page.locator('[data-next="room"]').click();
  check('booking: advanced to details', await page.locator('[data-panel="details"]').isVisible());

  // Submitting empty must be blocked by validation.
  await page.locator('[data-next="details"]').click();
  check(
    'booking: empty details rejected',
    await page.locator('[data-panel="details"]').isVisible(),
  );
  check(
    'booking: invalid field marked',
    (await page.locator('.field[data-invalid="true"]').count()) > 0,
  );

  await page.fill('#firstName', 'Alex');
  await page.fill('#lastName', 'Nakamura');
  await page.fill('#email', 'alex@example.com');
  await page.locator('[data-next="details"]').click();
  check('booking: advanced to review', await page.locator('[data-panel="review"]').isVisible());

  const review = await page.locator('[data-review]').textContent();
  check('booking: review shows the guest', review.includes('Alex Nakamura'));

  await page.locator('[data-confirm]').click();
  const reference = await page.locator('.confirmation__ref').textContent();
  check('booking: confirmation issued', /^AUR-\d{4}-[A-Z0-9]{5}$/.test(reference.trim()), reference);
}

/** Keyboard-drive the calendar grid to prove the roving tabindex works. */
async function calendarKeyboardScenario(page) {
  await page.goto(`${ORIGIN}/aurelia/book/`, { waitUntil: 'networkidle' });

  const focusable = page.locator('[data-date][tabindex="0"]');
  check('calendar: exactly one cell in the tab order', (await focusable.count()) === 1);

  await focusable.first().focus();
  const before = await page.evaluate(() => document.activeElement.dataset.date);

  await page.keyboard.press('ArrowRight');
  const afterRight = await page.evaluate(() => document.activeElement.dataset.date);
  check('calendar: ArrowRight moves one day', dayDelta(before, afterRight) === 1, afterRight);

  await page.keyboard.press('ArrowDown');
  const afterDown = await page.evaluate(() => document.activeElement.dataset.date);
  check('calendar: ArrowDown moves one week', dayDelta(afterRight, afterDown) === 7, afterDown);

  await page.keyboard.press('PageDown');
  const afterPage = await page.evaluate(() => document.activeElement.dataset.date);
  check('calendar: PageDown moves a month', afterPage.slice(0, 7) !== afterDown.slice(0, 7));

  check(
    'calendar: still one cell in the tab order after navigating',
    (await page.locator('[data-date][tabindex="0"]').count()) === 1,
  );
}

function dayDelta(a, b) {
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86400000);
}

/** Tabs, accordion and mobile nav. */
async function widgetScenario(page) {
  await page.goto(`${ORIGIN}/aurelia/dining/`, { waitUntil: 'networkidle' });
  const tabs = page.locator('[role="tab"]');
  await tabs.first().focus();
  await page.keyboard.press('ArrowRight');
  check(
    'tabs: arrow key selects the next tab',
    (await tabs.nth(1).getAttribute('aria-selected')) === 'true',
  );
  check(
    'tabs: the newly selected panel is visible',
    await page.locator('#panel-breakfast').isVisible(),
  );

  await page.goto(`${ORIGIN}/aurelia/contact/`, { waitUntil: 'networkidle' });
  const trigger = page.locator('[data-accordion-trigger]').first();
  check('accordion: collapsed on load', (await trigger.getAttribute('aria-expanded')) === 'false');
  await trigger.click();
  check('accordion: expands on click', (await trigger.getAttribute('aria-expanded')) === 'true');
  check('accordion: panel revealed', await page.locator('#faq-p-0').isVisible());

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${ORIGIN}/aurelia/`, { waitUntil: 'networkidle' });
  const toggle = page.locator('[data-nav-toggle]');
  check('nav: collapsed on mobile', (await toggle.getAttribute('aria-expanded')) === 'false');
  await toggle.click();
  check('nav: opens', (await toggle.getAttribute('aria-expanded')) === 'true');
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 1440, height: 900 });
}

/* ── Page sweep ────────────────────────────────────────────────────────────── */

async function sweep(browser, routes) {
  const context = await browser.newContext({ viewport: BREAKPOINTS[2] });
  const page = await context.newPage();

  const problems = [];
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`${page.url()} → ${message.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`${page.url()} → ${error.message}`));

  for (const route of routes) {
    // Sitemap routes already carry the base path, so they address the server root.
    const response = await page.goto(`${HOST}${route}`, { waitUntil: 'networkidle' });
    if (!response || response.status() >= 400) {
      problems.push(`${route} → HTTP ${response ? response.status() : 'no response'}`);
      continue;
    }
    // A page whose main landmark is empty rendered nothing useful.
    const text = await page.locator('main').innerText();
    if (text.trim().length < 40) problems.push(`${route} → main content looks empty`);
  }

  check(`sweep: ${routes.length} pages load without console errors`, problems.length === 0);
  for (const problem of problems.slice(0, 12)) failures.push(`      ${problem}`);

  await context.close();
}

async function screenshots(browser, routes) {
  const dir = join(process.cwd(), 'screenshots');
  await mkdir(dir, { recursive: true });

  for (const breakpoint of BREAKPOINTS) {
    const context = await browser.newContext({
      viewport: { width: breakpoint.width, height: breakpoint.height },
    });
    const page = await context.newPage();
    for (const route of routes) {
      await page.goto(`${HOST}${route}`, { waitUntil: 'networkidle' });
      const name = route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home';
      await page.screenshot({
        path: join(dir, `${name}-${breakpoint.name}.png`),
        fullPage: false,
      });
    }
    await context.close();
  }
  console.log(`\n  Screenshots written to screenshots/`);
}

/* ── Entry point ───────────────────────────────────────────────────────────── */

async function routesFromSitemap() {
  const xml = await readFile(join(process.cwd(), 'dist', 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => match[1].replace(/^https?:\/\/[^/]+/, ''))
    .filter((route) => !route.endsWith('.xml'));
}

await withServer(async () => {
  if (!executablePath) {
    console.log('\nNo Chromium binary found — skipping browser checks.\n');
    return;
  }

  const browser = await chromium.launch({ executablePath });
  const routes = await routesFromSitemap();

  console.log(`\nBrowser checks — ${routes.length} routes\n`);

  await sweep(browser, routes);

  const context = await browser.newContext({ viewport: BREAKPOINTS[2] });
  const page = await context.newPage();
  page.on('pageerror', (error) => failures.push(`      runtime: ${error.message}`));

  // Matched by suffix so the scenarios still run against a subdirectory build,
  // where every sitemap route is prefixed with the base path.
  const has = (path) => routes.some((route) => route.endsWith(path));

  if (has('/aurelia/book/')) {
    await bookingScenario(page);
    await calendarKeyboardScenario(page);
    await widgetScenario(page);
  }
  if (has('/northwind/pricing/')) {
    const { dashboardScenario, pricingScenario } = await import('./checks/northwind.js');
    await dashboardScenario(page, ORIGIN, check);
    await pricingScenario(page, ORIGIN, check);
  }
  if (has('/forma/shop/')) {
    const { shopScenario, cartScenario } = await import('./checks/forma.js');
    await shopScenario(page, ORIGIN, check);
    await cartScenario(page, ORIGIN, check);
  }
  if (has('/lab/renderer/')) {
    const lab = await import('./checks/lab.js');
    await lab.rendererScenario(page, ORIGIN, check);
    await lab.verletScenario(page, ORIGIN, check);
    await lab.descentScenario(page, ORIGIN, check);
    await lab.motionScenario(page, ORIGIN, check);
  }

  await context.close();

  if (SHOTS) await screenshots(browser, routes.slice(0, 8));
  await browser.close();

  console.log(notes.join('\n'));
  if (failures.length) {
    console.log(`\nFailures\n${failures.join('\n')}`);
    console.log(`\n${notes.length} passed, ${failures.length} failed\n`);
    process.exitCode = 1;
  } else {
    console.log(`\n${notes.length} checks passed\n`);
  }
});
