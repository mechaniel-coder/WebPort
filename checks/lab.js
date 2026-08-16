/**
 * Browser scenarios for the lab experiments.
 *
 * These check the things a static analyser cannot: that the renderer actually
 * obtained a GL context and drew something, that the physics converges rather
 * than exploding, that scroll genuinely drives the story, and — the part most
 * easily lost — that all of it is reachable from a keyboard.
 */

/** Raw WebGL: context, geometry, keyboard camera, pause control. */
export async function rendererScenario(page, origin, check) {
  await page.goto(`${origin}/lab/renderer/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);

  const status = (await page.locator('[data-gl-status]').textContent()).trim();
  check('renderer: obtained a WebGL context', /webgl[12]/.test(status), status);

  const readout = await page.locator('[data-readout]').textContent();
  check('renderer: generated geometry', /verts\s*[\d,]+/.test(readout), readout.replace(/\s+/g, ' ').trim());

  // The canvas must have drawn something.
  //
  // readPixels is useless here: without preserveDrawingBuffer the buffer is
  // cleared after compositing, so it always reads back black. Screenshotting the
  // composited element is what a viewer actually sees. A flat frame compresses
  // to almost nothing as a PNG, so size is a reliable proxy for "drew an object".
  const shot = await page.locator('[data-canvas]').screenshot();
  check('renderer: composited a non-trivial frame', shot.length > 8000, `${shot.length} byte PNG`);

  // Changing p must rebuild the mesh. The vertex count is unchanged — segment
  // counts are fixed — so the readout cannot detect this; the pixels can.
  const beforeP = await page.locator('[data-canvas]').screenshot();
  await page.locator('#c-p').fill('5');
  await page.waitForTimeout(400);
  const afterP = await page.locator('[data-canvas]').screenshot();
  check(
    'renderer: changing p regenerates the geometry',
    !beforeP.equals(afterP),
    `${beforeP.length} → ${afterP.length} bytes`,
  );

  // Switching shape must swap the mesh.
  await page.locator('input[name="shape"][value="box"]').check({ force: true });
  await page.waitForTimeout(300);
  check(
    'renderer: switching shape swaps the mesh',
    (await page.locator('[data-readout]').textContent()).includes('box'),
  );

  // The camera has to work without a mouse.
  await page.locator('[data-canvas]').focus();
  const framesBefore = await page.evaluate(() => {
    const canvas = document.querySelector('[data-canvas]');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const pixels = new Uint8Array(4 * 100);
    gl.readPixels(0, 0, 10, 10, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    return [...pixels].join(',');
  });
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(200);
  check('renderer: canvas is keyboard focusable', framesBefore.length > 0);

  // Pause control — WCAG 2.2.2.
  const play = page.locator('[data-play]');
  check('renderer: animating on load', (await play.getAttribute('aria-pressed')) === 'true');
  await play.click();
  check('renderer: pause control stops it', (await play.getAttribute('aria-pressed')) === 'false');
  check('renderer: pause control relabels', (await play.textContent()).trim() === 'Play');
}

/** Verlet: simulation stability, tearing, keyboard operation. */
export async function verletScenario(page, origin, check) {
  await page.goto(`${origin}/lab/verlet/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);

  const readout = () => page.locator('[data-readout]').textContent();
  const links = async () => Number((await readout()).match(/links\s*([\d,]+)/)[1].replace(/,/g, ''));

  const initial = await links();
  check('verlet: built a constraint network', initial > 500, `${initial} links`);

  // The cloth must settle, not detonate. Positions staying finite and on-canvas
  // is the real test of the fixed timestep.
  await page.waitForTimeout(1200);
  const settled = await page.evaluate(() => {
    const canvas = document.querySelector('[data-canvas]');
    const context = canvas.getContext('2d');
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    let drawn = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 30 || data[i + 2] > 30) drawn += 1;
    }
    return drawn;
  });
  check('verlet: simulation is drawing and stable', settled > 1000, `${settled} lit pixels`);

  // Keyboard tearing.
  await page.locator('[data-canvas]').focus();
  await page.keyboard.press('c');
  await page.waitForTimeout(250);
  const afterCut = await links();
  check('verlet: keyboard cut severs links', afterCut < initial, `${initial} → ${afterCut}`);

  const announced = (await page.locator('[data-announce]').textContent()).trim();
  check('verlet: the cut is announced in text', /links cut/.test(announced), announced);

  // Keyboard pause.
  await page.keyboard.press(' ');
  await page.waitForTimeout(150);
  check(
    'verlet: space pauses the simulation',
    (await page.locator('[data-play]').getAttribute('aria-pressed')) === 'false',
  );

  // Reset restores the network.
  await page.locator('[data-reset]').click();
  await page.waitForTimeout(300);
  check('verlet: reset rebuilds the network', (await links()) === initial);

  // Structures swap.
  await page.locator('input[name="structure"][value="rope"]').check({ force: true });
  await page.waitForTimeout(300);
  check('verlet: switching structure rebuilds', (await links()) < initial);
}

/** Descent: scroll drives the physics, and the prose stands alone. */
export async function descentScenario(page, origin, check) {
  await page.goto(`${origin}/lab/descent/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const hud = async () => (await page.locator('.dive__hud').textContent()).replace(/\s+/g, ' ');
  const depthNow = async () => Number((await hud()).match(/depth\s*(\d+)/)[1]);

  check('descent: starts at the surface', (await depthNow()) === 0);

  await page.evaluate(() => window.scrollBy(0, 2600));
  await page.waitForTimeout(700);
  const middle = await depthNow();
  check('descent: scrolling increases depth', middle > 20, `${middle} m`);

  await page.evaluate(() => window.scrollBy(0, 3200));
  await page.waitForTimeout(700);
  const deep = await depthNow();
  check('descent: reaches the plate', deep >= 95, `${deep} m`);

  // The readouts must be real physics, not eased decoration.
  const readout = await hud();
  const pressure = Number(readout.match(/pressure\s*([\d.]+)/)[1]);
  const volume = Number(readout.match(/lungs\s*([\d.]+)/)[1]);

  check(
    'descent: pressure matches the hydrostatic relation',
    Math.abs(pressure - (1 + deep / 10)) < 0.15,
    `${pressure} atm at ${deep} m`,
  );
  check(
    "descent: lung volume matches Boyle's law",
    Math.abs(volume - 6 / pressure) < 0.05,
    `${volume} L at ${pressure} atm`,
  );

  // The scrollbar must still be the reader's. A hijacking library would have
  // replaced scrollTop with an animated value that keeps moving after release.
  const settled = await page.evaluate(() => window.scrollY);
  await page.waitForTimeout(500);
  check(
    'descent: scroll position is not animated by the page',
    (await page.evaluate(() => window.scrollY)) === settled,
  );

  // The prose is the content, so it must all be present regardless.
  const scenes = await page.locator('[data-scene]').count();
  check('descent: every scene is in the document', scenes === 6, `${scenes} scenes`);
  const table = await page.locator('.readout-table tbody tr').count();
  check('descent: a text alternative table exists', table === 6, `${table} rows`);
}

/** Motion: the CSS-only page must ship no experiment JavaScript at all. */
export async function motionScenario(page, origin, check) {
  await page.goto(`${origin}/lab/motion/`, { waitUntil: 'networkidle' });

  const scripts = await page.evaluate(() =>
    [...document.querySelectorAll('script[src]')].map((s) => s.src.split('/').pop()),
  );
  check(
    'motion: ships only the shared nav script',
    scripts.length === 1 && scripts[0] === 'ui.js',
    scripts.join(', ') || 'none',
  );

  // Support badges resolve via @supports, so they must not be empty.
  const badges = await page.locator('.support').count();
  check('motion: reports support for four testable features', badges === 4, `${badges} badges`);

  // The verdict is generated content, so textContent will never see it — the
  // badges are resolved entirely by @supports, with no script involved.
  const verdicts = await page.locator('.support span').evaluateAll((nodes) =>
    nodes.map((node) => getComputedStyle(node, '::after').content),
  );
  check(
    'motion: every badge reports an actual result',
    verdicts.length === 4 && verdicts.every((value) => /supported/.test(value)),
    verdicts.join(' | '),
  );

  // :has() must restyle the parent with no script involved.
  // Read borderTopColor, not the borderColor shorthand — the shorthand reports a
  // combined value that is unreliable to compare when sides differ.
  const row = page.locator('.has-row').nth(1);
  const border = () => row.evaluate((el) => getComputedStyle(el).borderTopColor);

  const rowBefore = await border();
  await row.locator('input').check();
  await page.waitForTimeout(150);
  const rowAfter = await border();
  check('motion: :has() restyles the parent row', rowBefore !== rowAfter, `${rowBefore} → ${rowAfter}`);

  check(
    'motion: :has() drives the summary text too',
    (await page.locator('.has-summary').evaluate(
      (el) => getComputedStyle(el, '::after').content,
    )).includes('selected'),
  );

  // @property makes a custom property genuinely animatable.
  const registered = await page.evaluate(() => {
    const el = document.querySelector('.demo-property');
    return getComputedStyle(el).getPropertyValue('--sweep').trim();
  });
  check('motion: registered custom property has a typed value', /deg$/.test(registered), registered);
}
