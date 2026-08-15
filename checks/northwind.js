/**
 * Browser scenarios for Northwind's two interactive systems.
 * Loaded by browser-check.js when the Northwind routes are present.
 */

/** Range switching, crosshair, keyboard readout, table views, live ticker. */
export async function dashboardScenario(page, origin, check) {
  await page.goto(`${origin}/northwind/`, { waitUntil: 'networkidle' });

  const dash = page.locator('[data-dashboard]');
  check('dashboard: renders server-side', (await dash.locator('svg.chart').count()) >= 3);

  // Charts must exist in the HTML before scripting — the demo has to survive
  // a failed script load.
  const rawHtml = await page.evaluate(async () => {
    const response = await fetch(window.location.href);
    return response.text();
  });
  check('dashboard: charts are in the served HTML, not built by JS', rawHtml.includes('data-chart="line"'));

  const before = await dash.locator('[data-figure="latency"] path[stroke^="var"]').count();
  check('dashboard: latency chart has three series', before === 3, `${before} paths`);

  // Range filter scopes everything below it. Compare the LAST tick — the first
  // is the y-axis zero, which is the same in every range.
  const xTick = () => dash.locator('[data-figure="latency"] .chart__tick').last().textContent();
  const before24h = await xTick();
  check('dashboard: 24h labels are times', /^\d{2}:\d{2}$/.test(before24h), before24h);

  await dash.locator('[data-range-button="7d"]').click();
  check(
    'dashboard: range button becomes pressed',
    (await dash.locator('[data-range-button="7d"]').getAttribute('aria-pressed')) === 'true',
  );
  const after7d = await xTick();
  check('dashboard: switching range re-renders the chart', before24h !== after7d, after7d);

  await dash.locator('[data-range-button="24h"]').click();

  // Crosshair via pointer. `hover` scrolls the figure into view first — the
  // dashboard sits well below the fold, so raw viewport coordinates would miss.
  const figure = dash.locator('[data-figure="latency"]');
  const box = await figure.boundingBox();
  await figure.hover({ position: { x: box.width * 0.6, y: box.height * 0.5 } });
  const tip = figure.locator('[data-tip]');
  check('dashboard: crosshair tooltip appears on hover', await tip.isVisible());
  const tipText = await tip.textContent();
  check('dashboard: tooltip lists every series', /p50[\s\S]*p95[\s\S]*p99/.test(tipText), tipText.slice(0, 60));

  // The same readout must be reachable from the keyboard.
  await page.mouse.move(4, 4);
  await figure.focus();
  await page.keyboard.press('ArrowLeft');
  check('dashboard: keyboard produces the same readout', await tip.isVisible());
  await page.keyboard.press('Escape');
  check('dashboard: Escape dismisses the readout', !(await tip.isVisible()));

  // Table view — the non-visual route to the same numbers.
  const toggle = dash.locator('[data-table-toggle="latency"]');
  check('dashboard: table hidden initially', !(await dash.locator('#table-latency').isVisible()));
  await toggle.click();
  check('dashboard: table view opens', await dash.locator('#table-latency').isVisible());
  check(
    'dashboard: table has a row per data point',
    (await dash.locator('#table-latency tbody tr').count()) === 48,
  );
  await toggle.click();

  // Bars carry their own tooltip rather than a crosshair.
  const bar = dash.locator('.chart__bar').first();
  await bar.focus();
  check(
    'dashboard: bar tooltip on keyboard focus',
    await dash.locator('[data-figure="errors"] [data-tip]').isVisible(),
  );

  // Live ticker.
  const live = dash.locator('[data-live]');
  await live.click();
  check('dashboard: live toggle turns on', (await live.getAttribute('aria-pressed')) === 'true');
  await live.click();
  check('dashboard: live toggle turns off', (await live.getAttribute('aria-pressed')) === 'false');
}

/** The pricing calculator's arithmetic, plan caps and recommendation. */
export async function pricingScenario(page, origin, check) {
  await page.goto(`${origin}/northwind/pricing/`, { waitUntil: 'networkidle' });

  const calc = page.locator('[data-calculator]');
  const results = calc.locator('[data-results]');
  check('pricing: calculator renders all three plans', (await results.locator('.plan-result').count()) === 3);

  const priceOf = async (name) =>
    results
      .locator('.plan-result')
      .filter({ hasText: name })
      .locator('.plan-result__value')
      .textContent();

  // Default position: 100 GB, 25 hosts, 30-day retention.
  // Team  = $89 + 50 GB × $1.80 + 15 hosts × $12 = $89 + $90 + $180 = $359
  // Starter caps at 5 GB, so it must be unavailable.
  await calc.locator('[data-input="gb"]').fill('5');
  await calc.locator('[data-input="hosts"]').fill('4');
  await page.waitForTimeout(50);

  check('pricing: Starter is unavailable past its cap', (await priceOf('Starter')).trim() === '—');
  const team = (await priceOf('Team')).trim();
  check('pricing: Team priced by real tiered arithmetic', team === '$359', team);

  // Business at the same config: $499 flat, nothing over its allowances.
  const business = (await priceOf('Business')).trim();
  check('pricing: Business is its flat platform fee here', business === '$499', business);
  check(
    'pricing: cheapest plan is recommended',
    (await results
      .locator('.plan-result[data-recommended="true"] .plan-result__name')
      .textContent()) .includes('Team'),
  );

  // Push volume up until Business genuinely wins — the crossover is real.
  await calc.locator('[data-input="gb"]').fill('9');
  await calc.locator('[data-input="hosts"]').fill('7');
  await page.waitForTimeout(50);
  const winner = await results
    .locator('.plan-result[data-recommended="true"] .plan-result__name')
    .textContent();
  check('pricing: Business wins at high volume (real crossover)', winner.includes('Business'), winner);

  // Annual discount.
  const beforeAnnual = await priceOf('Business');
  // The checkbox is the visually-hidden half of a switch; the label is what a
  // user actually clicks, so drive it the same way.
  await calc.locator('.switch').click();
  check(
    'pricing: annual switch reflects state',
    await calc.locator('[data-input="annual"]').isChecked(),
  );
  await page.waitForTimeout(50);
  const afterAnnual = await priceOf('Business');
  const parse = (text) => Number(text.replace(/[^0-9.]/g, ''));
  check(
    'pricing: annual billing applies a 20% discount',
    Math.abs(parse(afterAnnual) / parse(beforeAnnual) - 0.8) < 0.01,
    `${beforeAnnual} → ${afterAnnual}`,
  );

  const recommendation = await calc.locator('[data-recommendation]').textContent();
  check('pricing: recommendation names a plan and a price', /\$[\d,]+\/month/.test(recommendation));
}
