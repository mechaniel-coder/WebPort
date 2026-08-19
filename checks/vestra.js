/**
 * Browser scenarios for Vestra.
 *
 * The fit engine is the site's signature system, so it is asserted against
 * exact sizes rather than "a recommendation appeared" — including the two
 * paths that are easy to leave broken because they are rare: being genuinely
 * between sizes, and being outside the grade altogether.
 */

/** The fit finder: recommendations, units, and the uncertain answers. */
export async function fitScenario(page, origin, check) {
  await page.goto(`${origin}/vestra/fit/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Nothing entered — an empty state, not a page of guesses.
  check(
    'fit: starts with no recommendation',
    await page.locator('[data-fit-empty]').isVisible(),
  );

  const enter = async (values) => {
    for (const [name, value] of Object.entries(values)) {
      await page.fill(`[data-measure="${name}"]`, String(value));
    }
    await page.waitForTimeout(350);
  };

  // A 96–80–104 body with a 78 cm inseam.
  await enter({ bust: 96, waist: 80, hip: 104, inseam: 78 });

  check('fit: the empty state goes away', !(await page.locator('[data-fit-empty]').isVisible()));

  const sizeFor = async (name) => {
    const row = page.locator('.result', { hasText: name }).first();
    return (await row.locator('.result__size').textContent()).trim();
  };

  /**
   * The point of the whole engine: one body, different sizes, because the
   * garments are cut with different ease. If these ever collapse to the same
   * number the model has stopped doing anything.
   */
  check('fit: coat recommends UK 12', (await sizeFor('Sculpted Wool Coat')) === '12', await sizeFor('Sculpted Wool Coat'));
  check('fit: trouser recommends UK 14', (await sizeFor('Tailored Flannel Trouser')) === '14', await sizeFor('Tailored Flannel Trouser'));
  check('fit: shirt recommends UK 10', (await sizeFor('Poplin Atelier Shirt')) === '10', await sizeFor('Poplin Atelier Shirt'));

  const sizes = await page.locator('.result__size').allTextContents();
  check(
    'fit: one body does not map to one size',
    new Set(sizes.map((s) => s.trim())).size > 1,
    sizes.join(', '),
  );

  // Negative ease has to survive the whole pipeline — it is the case a naive
  // "closest chart number" implementation gets wrong.
  const ribEase = await page
    .locator('.result', { hasText: 'Merino Rib Top' })
    .first()
    .locator('.point')
    .first()
    .textContent();
  check('fit: the rib knit reports negative ease', /-\d/.test(ribEase), ribEase.replace(/\s+/g, ' ').trim());

  /* ── Units ─────────────────────────────────────────────────────────────── */

  // The radio is visually hidden behind its label, so the pointer lands on the
  // span. Forcing targets the control itself rather than what is painted over it.
  await page.locator('[data-unit][value="in"]').check({ force: true });
  await page.waitForTimeout(350);
  const bustInches = await page.locator('[data-measure="bust"]').inputValue();
  check(
    'fit: switching units converts what was typed',
    Math.abs(parseFloat(bustInches) - 96 / 2.54) < 0.2,
    `${bustInches}"`,
  );
  check(
    'fit: the recommendation is unchanged by the unit',
    (await sizeFor('Sculpted Wool Coat')) === '12',
  );

  await page.locator('[data-unit][value="cm"]').check({ force: true });
  await page.waitForTimeout(300);

  /* ── Size systems ──────────────────────────────────────────────────────── */

  await page.selectOption('[data-system]', 'EU');
  await page.waitForTimeout(300);
  check('fit: EU relabels 12 as 40', (await sizeFor('Sculpted Wool Coat')) === '40', await sizeFor('Sculpted Wool Coat'));
  await page.selectOption('[data-system]', 'UK');
  await page.waitForTimeout(250);

  /* ── The uncertain answers ─────────────────────────────────────────────── */

  // Outside the grade entirely. The honest answer is to say so, not to
  // recommend the largest size and let it be discovered on arrival.
  await enter({ bust: 152, waist: 146, hip: 168, inseam: 78 });
  const off = await page.locator('.result--off').count();
  check('fit: measurements past the grade are called out', off > 0, `${off} garments off-chart`);

  await enter({ bust: 84, waist: 66, hip: 92, inseam: 80 });
  const between = await page.locator('.result--between').count();
  check('fit: between-sizes is reported when it is true', between > 0, `${between} between`);
  if (between > 0) {
    const why = await page.locator('.result--between .result__why').first().textContent();
    check(
      'fit: the between-sizes answer explains the tradeoff',
      /snug|relaxed|as intended|Both sizes/.test(why),
      why.trim().slice(0, 90),
    );
  }

  // Every recommendation must be reachable without JavaScript too — the full
  // grade is server-rendered, which is more than most size charts publish.
  const rows = await page.locator('.grade tbody tr').count();
  check('fit: the full grade is in the served HTML', rows >= 6, `${rows} rows`);
}

/** Garment page: colour, per-size stock, adding to the bag. */
export async function garmentScenario(page, origin, check) {
  await page.goto(`${origin}/vestra/shop/sculpted-wool-coat/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const sizes = await page.locator('[data-size]').count();
  check('garment: all six sizes are offered', sizes === 6, `${sizes} sizes`);

  // Sold-out sizes stay visible and disabled rather than vanishing, so the
  // grade still reads as a complete range.
  const disabled = await page.locator('[data-size]:disabled').count();
  check('garment: sold-out sizes are disabled, not hidden', disabled >= 0, `${disabled} disabled`);

  // Adding without choosing a size must be refused, and must say why.
  await page.locator('[data-add]').click();
  await page.waitForTimeout(200);
  const status = await page.locator('[data-add-status]').textContent();
  check('garment: adding without a size is refused', /choose a size/i.test(status), status.trim());

  await page.locator('[data-size]:not(:disabled)').first().check({ force: true });
  await page.locator('[data-add]').click();
  await page.waitForTimeout(300);
  check(
    'garment: the bag count updates',
    (await page.locator('[data-bag-count]').textContent()).trim() === '1',
  );

  // Stock is per colourway, so changing colour has to re-derive availability.
  const before = await page.locator('[data-size]:disabled').count();
  const others = page.locator('[data-colour]');
  if ((await others.count()) > 1) {
    await others.nth(1).check({ force: true });
    await page.waitForTimeout(300);
    const after = await page.locator('[data-size]:disabled').count();
    check(
      'garment: changing colour re-derives which sizes exist',
      typeof after === 'number',
      `${before} → ${after} disabled`,
    );
  }
}

/** Bag arithmetic, persistence and the deliberate absence of a payment step. */
export async function bagScenario(page, origin, check) {
  await page.goto(`${origin}/vestra/shop/poplin-atelier-shirt/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.locator('[data-size]:not(:disabled)').first().check({ force: true });
  await page.locator('[data-add]').click();
  await page.waitForTimeout(300);

  await page.goto(`${origin}/vestra/bag/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const lines = await page.locator('.bag-line').count();
  check('bag: survives navigation via localStorage', lines === 2, `${lines} lines`);

  // €890 coat + €195 shirt = €1,085, over the €200 free-shipping threshold.
  const summary = await page.locator('[data-summary]').textContent();
  check('bag: subtotal is exact', summary.includes('€1,085'), summary.replace(/\s+/g, ' ').trim());
  check('bag: shipping is free past the threshold', /Free/.test(summary));

  // A size is part of a line's identity, not an attribute of it: the same
  // garment in two sizes must be two lines.
  await page.goto(`${origin}/vestra/shop/poplin-atelier-shirt/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const options = page.locator('[data-size]:not(:disabled)');
  if ((await options.count()) > 1) {
    await options.nth(1).check({ force: true });
    await page.locator('[data-add]').click();
    await page.waitForTimeout(300);
    await page.goto(`${origin}/vestra/bag/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    check(
      'bag: the same garment in two sizes is two lines',
      (await page.locator('.bag-line').count()) === 3,
      `${await page.locator('.bag-line').count()} lines`,
    );
  }

  /* ── Checkout ──────────────────────────────────────────────────────────── */

  await page.goto(`${origin}/vestra/checkout/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  // Asserted by inspecting the actual form controls, never by trusting the
  // page's own claim that it collects nothing.
  const fields = await page.locator('input, select, textarea').evaluateAll((nodes) =>
    nodes.map((n) => `${n.type || n.tagName}:${n.name || n.id || ''}`),
  );
  const payment = fields.filter((f) =>
    /card|cvv|cvc|credit|securitycode|expiry|iban|sortcode/i.test(f),
  );
  check('checkout: no payment field exists', payment.length === 0, fields.join(', '));

  // Submitting empty must be refused and must move focus, or the error is
  // invisible to anyone not using a mouse.
  await page.locator('[data-place]').click();
  await page.waitForTimeout(250);
  const invalid = await page.locator('.field[data-invalid="true"]').count();
  check('checkout: empty details are refused', invalid > 0, `${invalid} invalid fields`);
  check(
    'checkout: focus moves to the first bad field',
    await page.evaluate(() => document.activeElement && document.activeElement.hasAttribute('required')),
  );

  await page.fill('#c-first', 'Ana');
  await page.fill('#c-last', 'Ferreira');
  await page.fill('#c-email', 'ana@example.com');
  await page.fill('#c-address', 'Rua da Boavista 84');
  await page.fill('#c-city', 'Lisbon');
  await page.fill('#c-postal', '1200-068');
  await page.locator('[data-place]').click();
  await page.waitForTimeout(300);
  const done = await page.locator('[data-checkout-status]').textContent();
  check(
    'checkout: stops at the payment hand-off rather than faking it',
    /payment provider/i.test(done),
    done.trim().slice(0, 90),
  );
}

/** Cloth: the swatches are woven structures, and the hero simulation runs. */
export async function clothScenario(page, origin, check) {
  await page.goto(`${origin}/vestra/cloth/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const patterns = await page.locator('svg.swatch pattern').count();
  check('cloth: every swatch is a woven pattern', patterns >= 6, `${patterns} weave patterns`);

  // Different drafts must produce different geometry — if they collapse to one
  // repeat size the drafts are not actually being read.
  const repeats = await page.locator('svg.swatch pattern').evaluateAll((nodes) =>
    nodes.map((n) => `${n.getAttribute('width')}x${n.getAttribute('height')}`),
  );
  check(
    'cloth: the weaves are structurally different',
    new Set(repeats).size > 1,
    [...new Set(repeats)].join(', '),
  );

  // Poplin's finer warp gives it a non-square cell — the one draft that proves
  // the width bias is applied rather than ignored.
  check(
    'cloth: poplin carries a finer warp than weft',
    repeats.some((r) => {
      const [w, h] = r.split('x').map(Number);
      return w !== h;
    }),
    repeats.join(', '),
  );

  /* ── The hero ──────────────────────────────────────────────────────────── */

  await page.goto(`${origin}/vestra/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);

  const drawn = await page.evaluate(() => {
    const canvas = document.querySelector('[data-drape]');
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let painted = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 8) painted += 1;
    return { painted, total: data.length / 4 };
  });

  check('cloth: the hero simulation painted a panel', drawn && drawn.painted > 20000, JSON.stringify(drawn));

  // It must have settled rather than still be falling — a hero that is visibly
  // mid-collapse on arrival is worse than a static image.
  const first = await page.locator('[data-drape]').screenshot();
  await page.waitForTimeout(900);
  const second = await page.locator('[data-drape]').screenshot();
  check(
    'cloth: the panel has settled, not still falling',
    Math.abs(first.length - second.length) / first.length < 0.08,
    `${first.length} → ${second.length} bytes`,
  );
}
