/**
 * Browser scenarios for Forma's commerce layer.
 * Loaded by browser-check.js when the Forma routes are present.
 */

const parse = (text) => Number(String(text).replace(/[^0-9.]/g, ''));

/** Faceted filtering, URL state, the back button, and variant pricing. */
export async function shopScenario(page, origin, check) {
  await page.goto(`${origin}/forma/shop/`, { waitUntil: 'networkidle' });

  const cards = page.locator('[data-grid] [data-slug]');
  check('shop: all 8 products render server-side', (await cards.count()) === 8);

  // The catalogue must be in the served HTML, not built by script.
  const rawHtml = await page.evaluate(async () =>
    (await fetch(window.location.href)).text(),
  );
  check(
    'shop: catalogue is in the served HTML',
    (rawHtml.match(/data-slug="/g) || []).length === 8,
  );

  const visible = () => page.locator('[data-grid] [data-slug]:not([hidden])').count();

  // Values within one facet are OR'd: lighting (2) + furniture (2) = 4.
  await page.locator('[data-facet="category"][value="lighting"]').check();
  check('shop: one facet value filters', (await visible()) === 2, `${await visible()} shown`);

  await page.locator('[data-facet="category"][value="furniture"]').check();
  check('shop: values within a facet are OR-ed', (await visible()) === 4, `${await visible()} shown`);

  // Separate facets are AND'd: (lighting OR furniture) AND oak = 2.
  await page.locator('[data-facet="material"][value="oak"]').check();
  check('shop: separate facets are AND-ed', (await visible()) === 2, `${await visible()} shown`);

  // Filter state must be in the URL — shareable and bookmarkable.
  const url = new URL(page.url());
  check(
    'shop: filters are reflected in the URL',
    url.searchParams.get('category') === 'lighting,furniture' &&
      url.searchParams.get('material') === 'oak',
    url.search,
  );

  // Removing a chip narrows the set and returns focus to its checkbox.
  await page.locator('[data-chips] .chip button').first().click();
  check('shop: removing a chip re-filters', (await visible()) === 2);

  await page.locator('[data-clear]').click();
  check('shop: clear-all restores everything', (await visible()) === 8);
  check('shop: cleared state gives a clean URL', new URL(page.url()).search === '', page.url());

  // Sorting.
  await page.selectOption('[data-sort]', 'price-asc');
  const firstName = await page
    .locator('[data-grid] [data-slug]:not([hidden]) .product-card__name')
    .first()
    .textContent();
  check('shop: price-ascending sort puts the cheapest first', firstName.includes('Prism Vase'), firstName);

  // A filtered URL must load already filtered.
  await page.goto(`${origin}/forma/shop/?category=tableware`, { waitUntil: 'networkidle' });
  check('shop: a filtered URL loads filtered', (await visible()) === 2, `${await visible()} shown`);

  /* ── Variant pricing ─────────────────────────────────────────────────────── */

  await page.goto(`${origin}/forma/shop/halo-pendant/`, { waitUntil: 'networkidle' });

  const price = () => page.locator('[data-price]').textContent();
  check('product: base price shown', parse(await price()) === 340, await price());

  const firstArt = await page.locator('[data-stage] svg').getAttribute('data-finish');

  // Brass carries a $40 premium; the finish must also redraw the object.
  await page.locator('input[name="finish"][value="brass"]').check();
  check('product: finish premium is applied', parse(await price()) === 380, await price());
  const secondArt = await page.locator('[data-stage] svg').getAttribute('data-finish');
  check('product: choosing a finish redraws the object', firstArt !== secondArt, `${firstArt} → ${secondArt}`);

  // The larger size adds $90 on top of the finish premium.
  await page.locator('input[name="size"][value="lg"]').check();
  check('product: size and finish premiums stack', parse(await price()) === 470, await price());
}

/** Cart persistence, cross-tab sync, and checkout arithmetic. */
export async function cartScenario(page, origin, check) {
  const context = page.context();
  await context.clearCookies();

  await page.goto(`${origin}/forma/shop/prism-vase/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  // Prism Vase, clear finish, small: $95.
  await page.locator('[data-add]').click();
  check('cart: header count updates', (await page.locator('[data-cart-count]').textContent()) === '1');

  // A second, different variant must be its own line rather than merging.
  await page.locator('input[name="size"][value="md"]').check();
  await page.locator('[data-add]').click();
  check('cart: count reflects both items', (await page.locator('[data-cart-count]').textContent()) === '2');

  await page.goto(`${origin}/forma/cart/`, { waitUntil: 'networkidle' });
  check('cart: survives navigation via localStorage', (await page.locator('[data-lines] .cart-line').count()) === 2);
  check(
    'cart: different variants are separate lines',
    (await page.locator('[data-lines] .cart-line').count()) === 2,
  );

  // $95 + $130 (medium adds $35) = $225 → under the $250 free-shipping threshold.
  const summaryText = () => page.locator('[data-summary]').textContent();
  check('cart: subtotal is correct', (await summaryText()).includes('$225.00'), await summaryText());
  check('cart: shipping charged below the threshold', (await summaryText()).includes('$18.00'));

  // Tax is on goods PLUS shipping: round((22500 + 1800) * 0.085) = 2066 cents.
  // Taxing goods alone would give $19.13, so this figure is the assertion.
  check('cart: tax is charged on goods and shipping', (await summaryText()).includes('$20.66'));
  // 22500 + 1800 + 2066 = 26366.
  check('cart: total is correct', (await summaryText()).includes('$263.66'), await summaryText());

  // Crossing the free-shipping threshold must drop the shipping line to zero.
  await page.locator('[data-lines] .cart-line').first().locator('[data-inc]').click();
  check('cart: free shipping unlocks past the threshold', (await summaryText()).includes('Free'));

  /* ── Cross-tab synchronisation ───────────────────────────────────────────── */

  const second = await context.newPage();
  await second.goto(`${origin}/forma/cart/`, { waitUntil: 'networkidle' });
  const before = await second.locator('[data-cart-count]').textContent();

  await page.locator('[data-lines] .cart-line').first().locator('[data-remove]').click();
  await second.waitForFunction(
    (previous) => document.querySelector('[data-cart-count]').textContent !== previous,
    before,
    { timeout: 4000 },
  );
  const after = await second.locator('[data-cart-count]').textContent();
  check('cart: changes sync across tabs via the storage event', before !== after, `${before} → ${after}`);
  await second.close();

  /* ── Checkout ────────────────────────────────────────────────────────────── */

  await page.goto(`${origin}/forma/checkout/`, { waitUntil: 'networkidle' });
  check('checkout: flow is shown when the cart has items', await page.locator('[data-checkout-flow]').isVisible());

  // Empty details must be rejected.
  await page.locator('[data-next="details"]').click();
  check('checkout: empty details rejected', await page.locator('[data-panel="details"]').isVisible());
  check('checkout: invalid field marked', (await page.locator('.field[data-invalid="true"]').count()) > 0);

  await page.fill('#co-name', 'Sam Okonkwo');
  await page.fill('#co-email', 'sam@example.com');
  await page.fill('#co-address', '12 Wythe Avenue');
  await page.fill('#co-city', 'Brooklyn');
  await page.fill('#co-postcode', '11249');
  await page.locator('[data-next="details"]').click();
  check('checkout: advances to delivery', await page.locator('[data-panel="delivery"]').isVisible());

  // Express is never free — not even on an order that qualifies for free standard
  // shipping. Push the cart above the threshold first so the rule is actually tested.
  await page.locator('#ship-standard').isChecked();
  const summaryNow = () => page.locator('[data-summary]').textContent();

  // The radio is the visually-hidden half of a styled option; the label is what
  // a user actually clicks, so drive it the same way.
  await page.locator('label[for="ship-express"]').click();
  check('checkout: express option reflects state', await page.locator('#ship-express').isChecked());
  check(
    'checkout: express shipping is charged at $35',
    (await summaryNow()).includes('$35.00'),
    await summaryNow(),
  );

  await page.locator('label[for="ship-standard"]').click();
  check('checkout: switching back restores standard shipping', !(await summaryNow()).includes('$35.00'));
  await page.locator('label[for="ship-express"]').click();

  await page.locator('[data-next="delivery"]').click();
  check('checkout: advances to review', await page.locator('[data-panel="review"]').isVisible());
  const review = await page.locator('[data-review]').textContent();
  check('checkout: review shows the customer', review.includes('Sam Okonkwo'));

  // Nothing anywhere in the flow may ask for payment details. Inspect the actual
  // form controls rather than the page text — the copy legitimately mentions card
  // numbers in order to say it never asks for one.
  const paymentInputs = await page.evaluate(() =>
    [...document.querySelectorAll('input, select')].filter((el) => {
      const signature = `${el.name} ${el.id} ${el.autocomplete} ${el.type}`.toLowerCase();
      return /\bcc-|card|cvv|cvc|security-?code|expiry|exp-?(month|year)|iban|routing/.test(
        signature,
      );
    }).length,
  );
  check('checkout: no payment fields anywhere in the flow', paymentInputs === 0, `${paymentInputs} found`);

  await page.locator('[data-place-order]').click();
  const reference = await page.locator('.confirmation__ref').textContent();
  check('checkout: order reference issued', /^FRM-[A-Z0-9]{6}$/.test(reference.trim()), reference);
  check('checkout: cart is emptied after ordering', (await page.locator('[data-cart-count]').textContent()) === '0');
}
