/**
 * Browser scenarios for the shared motion system.
 *
 * Every assertion here exists because the thing it checks actually broke during
 * the build. Reveal animations fail in a uniquely bad way — the content is in
 * the DOM, the checks that read `textContent` all pass, and the page is blank
 * to a human. So these assert *rendered* state: opacity, transforms and pixels.
 */

/**
 * Every site carrying the motion layer, and what to look at on each.
 *
 * Parameterised rather than copied: these scenarios exist to catch bugs in the
 * *shared* system, so a second hand-written copy would drift from the first and
 * quietly stop covering the same ground.
 */
export const SITES = {
  aurelia: {
    key: 'aurelia',
    path: '/aurelia/',
    lede: '.hero__lede',
    headline: 'very little else',
    cta: '.hero__actions',
    cards: '.rooms > li',
    faces: ['Fraunces', 'Schibsted Grotesk'],
    display: 'Fraunces',
    minHero: 120,
  },
  northwind: {
    key: 'northwind',
    path: '/northwind/',
    lede: '.lede',
    headline: 'roll up your data',
    cta: '.hero__actions',
    cards: '.feature-grid > *, .logos > li',
    faces: ['Geist', 'Geist Mono'],
    display: 'Geist',
    minHero: 70,
  },
  hub: {
    key: 'hub',
    path: '/',
    lede: '.hero__lede',
    headline: 'business actually needed',
    cta: '.hero__meta',
    cards: '.work > li',
    faces: ['Schibsted Grotesk', 'JetBrains Mono'],
    display: 'Schibsted Grotesk',
    minHero: 80,
  },
  forma: {
    key: 'forma',
    path: '/forma/',
    lede: '.lede',
    headline: 'one idea each',
    cta: '.hero__actions',
    cards: '.grid-products > li',
    faces: ['Bricolage Grotesque', 'Instrument Sans'],
    display: 'Bricolage Grotesque',
    minHero: 80,
  },
};

/** The reveal system: content must end up visible, on load and on scroll. */
export async function revealScenario(page, origin, check, site = SITES.aurelia) {
  await page.goto(`${origin}${site.path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2600);

  const at = (name) => `${site.key} ${name}`;

  check(
    at('motion: boot snippet ran and motion.js took over'),
    (await page.evaluate(() => document.documentElement.className)).includes('motion-ready'),
    await page.evaluate(() => document.documentElement.className),
  );

  /* ── Above the fold ──────────────────────────────────────────────────────
   *
   * A ScrollTrigger starting at `top 85%` never fires for an element already
   * sitting low in the first screen, so the hero buttons stayed invisible
   * until a scroll that a visitor had no reason to make. Anything visible at
   * load must animate on load.
   */
  for (const [label, selector] of [
    ['headline', '.hero__title'],
    ['lede', site.lede],
    ['call to action', site.cta],
  ]) {
    const box = await page.locator(selector).first().boundingBox();
    check(
      at(`motion: hero ${label} is on screen without scrolling`),
      box !== null && box.height > 0,
      JSON.stringify(box),
    );
    check(
      at(`motion: hero ${label} finished at full opacity`),
      (await page
        .locator(selector)
        .first()
        .evaluate((el) => getComputedStyle(el).opacity)) === '1',
    );
  }

  /* Nothing in a revealed subtree may stay transparent.
   *
   * Checking the element's own opacity is not enough. SplitText replaces a
   * heading's children with its own line wrappers, so a stylesheet rule aimed
   * at "staggered children" hides those wrappers instead — the heading reports
   * opacity 1, its text is in the DOM, and the reader sees a blank gap.
   *
   * Screenshotting is not enough either, which is how this was first missed:
   * the hero headline sits over moving water, so its element screenshot is a
   * busy, large PNG whether or not a single glyph is drawn.
   *
   * Walking the subtree for a transparent node is what actually catches it.
   */
  const transparent = await page.evaluate(() => {
    const found = [];
    // Matches the trigger's own `top 85%` threshold rather than a plain
    // intersection test. An element straddling the fold is "visible" by the
    // looser test while its ScrollTrigger has legitimately not fired yet, and
    // asserting against that would forbid the boundary case entirely.
    const inView = (el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight * 0.85;
    };

    for (const root of document.querySelectorAll('[data-reveal]')) {
      // Only what the reader can currently see. Content further down the page
      // is *supposed* to be waiting at opacity 0 for its scroll trigger — that
      // is the feature, and asserting against it would forbid scroll reveals
      // altogether.
      if (!inView(root)) continue;

      for (const node of [root, ...root.querySelectorAll('*')]) {
        // Skip anything inside an <svg>. The generated artwork fades its
        // distant ridges and its sun bloom on purpose — partial opacity is the
        // atmospheric perspective, not a stalled animation.
        if (node.closest('svg')) continue;
        const style = getComputedStyle(node);
        if (parseFloat(style.opacity) < 0.99 || style.visibility === 'hidden') {
          found.push(`${root.className.split(' ')[0]} › ${node.tagName.toLowerCase()}`);
        }
      }
    }
    return found;
  });
  check(
    at('motion: no revealed element leaves a transparent descendant'),
    transparent.length === 0,
    transparent.slice(0, 4).join(', ') || 'none',
  );

  // SplitText must hand the accessibility tree the original sentence rather
  // than a pile of line fragments.
  const heading = await page.locator('h1').evaluate((el) => ({
    label: el.getAttribute('aria-label'),
    text: el.textContent.replace(/\s+/g, ' ').trim(),
  }));
  check(
    at('motion: split headline keeps one readable accessible name'),
    (heading.label || heading.text).includes(site.headline),
    heading.label || heading.text,
  );

  /* ── Below the fold ──────────────────────────────────────────────────── */
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(1600);
  const cards = await page
    .locator(site.cards)
    .evaluateAll((nodes) => nodes.map((n) => getComputedStyle(n).opacity));
  check(
    at('motion: scrolled-to content reveals to full opacity'),
    cards.length > 0 && cards.every((value) => value === '1'),
    cards.join(', '),
  );
}

/**
 * Reduced motion.
 *
 * The contract is that nothing is ever hidden from a reader who asked for less
 * motion — not "hidden then quickly shown". The boot snippet must decline to
 * set the flag at all, so no start-state rule can match in the first place.
 */
export async function reducedMotionScenario(browser, origin, check) {
  const context = await browser.newContext({
    reducedMotion: 'reduce',
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  await page.goto(`${origin}/aurelia/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);

  const className = await page.evaluate(() => document.documentElement.className);
  check('reduced motion: the hiding flag is never set', !className.includes('has-motion'), className);
  check('reduced motion: motion.js recorded the opt-out', className.includes('motion-off'), className);

  // Everything readable, immediately — checked before any animation could have
  // run, which is the point.
  const opacities = await page
    .locator('[data-reveal]')
    .evaluateAll((nodes) => nodes.map((n) => getComputedStyle(n).opacity));
  check(
    'reduced motion: no revealable element is hidden',
    opacities.length > 0 && opacities.every((v) => v === '1'),
    opacities.join(', '),
  );

  check(
    'reduced motion: smooth scroll is not installed',
    !(await page.evaluate(() => document.documentElement.classList.contains('lenis'))),
  );

  // The hero still draws — one frame, held still, rather than a blank panel.
  const still = await page.locator('[data-caustics]').screenshot();
  check('reduced motion: hero still renders a frame', still.length > 5000, `${still.length} bytes`);

  await context.close();
}

/**
 * The no-JavaScript path.
 *
 * The failure mode being guarded against is the worst one this system can
 * produce: CSS hides everything that is about to animate, the script that would
 * reveal it never runs, and the page is permanently blank. The start-states are
 * scoped to a class only the boot snippet sets, so with scripting off none of
 * them apply.
 */
export async function noScriptScenario(browser, origin, check) {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(`${origin}/aurelia/`, { waitUntil: 'domcontentloaded' });

  const opacities = await page
    .locator('[data-reveal]')
    .evaluateAll((nodes) => nodes.map((n) => getComputedStyle(n).opacity));
  check(
    'no-js: every revealable element is visible',
    opacities.length > 0 && opacities.every((v) => v === '1'),
    opacities.join(', '),
  );

  const heading = await page.locator('h1').textContent();
  check('no-js: the headline is readable', heading.includes('very little else'), heading.trim());

  await context.close();
}

/**
 * The calendar must lay out as a grid, not merely behave like one.
 *
 * This is here because the booking calendar shipped for weeks with every date
 * cell collapsed into a single column — `.day` is the <td> itself and a
 * `display: grid` on it silently overrode `table-cell`. Every existing check
 * passed throughout: dates were selectable, the roving tabindex moved
 * correctly, the rates were right. Not one of them asked where a cell was.
 *
 * Geometry needs asserting explicitly, because behaviour cannot imply it.
 */
export async function calendarLayoutScenario(page, origin, check) {
  await page.goto(`${origin}/aurelia/book/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);

  const rows = await page.evaluate(() => {
    const table = document.querySelector('[role="grid"]');
    return [...table.querySelectorAll('tbody tr')].map((row) => {
      const lefts = [...row.children].map((cell) => Math.round(cell.getBoundingClientRect().left));
      return {
        cells: row.children.length,
        distinctColumns: new Set(lefts).size,
        height: Math.round(row.getBoundingClientRect().height),
      };
    });
  });

  check('calendar: every week has seven cells', rows.every((r) => r.cells === 7), JSON.stringify(rows[1]));
  check(
    'calendar: a week lays out across seven columns',
    rows.every((r) => r.distinctColumns === 7),
    `week 2 occupied ${rows[1] && rows[1].distinctColumns} columns`,
  );
  check(
    'calendar: a week is one cell tall, not seven',
    rows.every((r) => r.height < 80),
    `tallest row ${Math.max(...rows.map((r) => r.height))}px`,
  );

  // WCAG 2.5.8: a pointer target needs 24px minimum, and 44px is the
  // comfortable figure for a date picker used on a phone.
  const cell = await page.locator('.day').first().boundingBox();
  check(
    'calendar: date cells meet the minimum target size',
    cell.width >= 24 && cell.height >= 24,
    `${Math.round(cell.width)}×${Math.round(cell.height)}`,
  );
}

/** Webfonts must actually load, and must not shift the layout when they do. */
export async function typeScenario(page, origin, check, site = SITES.aurelia) {
  await page.goto(`${origin}${site.path}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const loaded = await page.evaluate(() =>
    [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family),
  );
  for (const family of site.faces) {
    check(`type: ${site.key} loaded ${family}`, loaded.includes(family), loaded.join(', '));
  }

  // Family names containing a space come back quoted, so compare the first
  // entry with its quotes stripped rather than testing the raw string.
  const used = await page.locator('h1').evaluate((el) => getComputedStyle(el).fontFamily);
  const first = used.split(',')[0].trim().replace(/^["']|["']$/g, '');
  check(
    `type: ${site.key} headline is set in the display face`,
    first === site.display,
    used,
  );

  // The hero must be display-scale, not a large paragraph. The old scale
  // topped out at ~84px, which is most of why this site read as basic.
  const size = await page
    .locator('h1')
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  check(
    `type: ${site.key} hero is set at display scale`,
    size > site.minHero,
    `${Math.round(size)}px`,
  );

  // Metric-matched fallbacks exist so the swap moves nothing. Compare the
  // headline's box before and after the webfonts are applied.
  const shift = await page.evaluate(async (selector) => {
    const el = document.querySelector(selector);
    const before = el.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--font-sans', 'sans-serif');
    const after = el.getBoundingClientRect().height;
    document.documentElement.style.removeProperty('--font-sans');
    return Math.abs(after - before);
  }, site.lede);
  check(
    `type: ${site.key} fallback face matches the webfont metrics`,
    shift < 4,
    `${shift.toFixed(1)}px difference`,
  );
}

/**
 * The lab is deliberately exempt from the motion library.
 *
 * Its own copy claims "no GSAP, no scroll library, no dependencies at all",
 * and that claim is part of the product rather than a note in a README. A
 * future change that switches `motion: true` on for consistency would make the
 * page lie about itself while every other check stayed green, so the exemption
 * is asserted rather than left as a convention someone has to remember.
 */
export async function labPurityScenario(page, origin, check) {
  await page.goto(`${origin}/lab/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const scripts = await page.evaluate(() =>
    [...document.querySelectorAll('script[src]')].map((s) => s.src.split('/').pop()),
  );
  for (const banned of ['gsap.min.js', 'ScrollTrigger.min.js', 'lenis.min.js', 'motion.js']) {
    check(`lab: ships no ${banned}`, !scripts.includes(banned), scripts.join(', ') || 'none');
  }

  const globals = await page.evaluate(() =>
    ['gsap', 'ScrollTrigger', 'Lenis', 'SplitText'].filter((key) => key in window),
  );
  check('lab: no animation library on window', globals.length === 0, globals.join(', ') || 'none');

  // It does take the type layer, which is what makes it look like the rest.
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() =>
    [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family),
  );
  check(
    'lab: uses the studio typefaces',
    loaded.includes('JetBrains Mono') || loaded.includes('Schibsted Grotesk'),
    loaded.join(', '),
  );

  /**
   * The reveal must never be able to hide content permanently.
   *
   * Scroll-driven animations are wrapped in `@supports`, so a browser without
   * them applies no start-state at all. That is a stronger guarantee than the
   * JavaScript system on the other sites, which needs a boot snippet and a
   * timeout to reach the same place — and it is worth asserting, because the
   * whole failure mode of a reveal system is content that is present in the
   * DOM and invisible on screen.
   */
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll('[data-rise]')].filter((el) => {
      const r = el.getBoundingClientRect();
      if (!(r.bottom > 0 && r.top < window.innerHeight * 0.85)) return false;
      return parseFloat(getComputedStyle(el).opacity) < 0.99;
    }).length,
  );
  check('lab: nothing on screen is left invisible by a reveal', hidden === 0, `${hidden} hidden`);

  /**
   * And every one of them must actually resolve when scrolled to.
   *
   * The check above only looks at the first screen, which is not enough: a
   * scroll-driven animation with `fill-mode: both` holds its start state until
   * the element enters the range, so an element whose range never completes
   * stays at opacity 0 for good. Walking the whole page is what turns that from
   * a risk into something tested.
   */
  const stuck = await page.evaluate(async () => {
    const wait = () => new Promise((r) => setTimeout(r, 260));
    const step = Math.round(window.innerHeight * 0.6);
    const names = [];

    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await wait();
      for (const el of document.querySelectorAll('[data-rise]')) {
        const r = el.getBoundingClientRect();
        // Fully inside the viewport, so its entry range is definitely complete.
        if (r.top < 0 || r.bottom > window.innerHeight) continue;
        if (parseFloat(getComputedStyle(el).opacity) < 0.99) {
          names.push(el.className || el.tagName.toLowerCase());
        }
      }
    }
    window.scrollTo(0, 0);
    return names;
  });
  check(
    'lab: every reveal resolves once its element is fully in view',
    stuck.length === 0,
    stuck.slice(0, 4).join(', ') || 'none',
  );
}
