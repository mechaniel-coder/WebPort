/**
 * Product detail — variant selection.
 *
 * Choosing a finish redraws the object rather than tinting an image, and both
 * finish and size feed the same price function the cart uses, so the number on
 * this page is the number you are charged.
 */

import { add } from './cart.js';
import { COMMERCE, money, variantPrice } from './commerce.js';
import { productArt } from './render.js';

const root = document.querySelector('[data-product]');
if (root) init(root);

function init(root) {
  const product = JSON.parse(document.getElementById('product-data').textContent);

  const stage = root.querySelector('[data-stage]');
  const priceOut = root.querySelector('[data-price]');
  const premiumOut = root.querySelector('[data-premium]');
  const quantityInput = root.querySelector('[data-quantity]');
  const decrement = root.querySelector('[data-step="-1"]');
  const increment = root.querySelector('[data-step="1"]');
  const addButton = root.querySelector('[data-add]');

  const finishInputs = [...root.querySelectorAll('[name="finish"]')];
  const sizeInputs = [...root.querySelectorAll('[name="size"]')];

  const selection = () => ({
    finish: finishInputs.find((input) => input.checked)?.value,
    size: sizeInputs.find((input) => input.checked)?.value,
  });

  function render() {
    const { finish, size } = selection();

    stage.innerHTML = productArt({
      shape: product.shape,
      finish,
      title: `${product.name} in ${finishLabel(finish)} — illustration`,
    });

    const unit = variantPrice(product, { finish, size });
    priceOut.textContent = money(unit);

    const extra = unit - product.price;
    premiumOut.textContent = extra > 0 ? `Includes ${money(extra)} of options` : '';
  }

  function finishLabel(finish) {
    return product.finishLabels?.[finish] || finish;
  }

  function setQuantity(value) {
    const next = Math.max(1, Math.min(COMMERCE.maxQuantity, value));
    quantityInput.value = String(next);
    decrement.disabled = next <= 1;
    increment.disabled = next >= COMMERCE.maxQuantity;
  }

  for (const input of [...finishInputs, ...sizeInputs]) {
    input.addEventListener('change', render);
  }

  decrement.addEventListener('click', () => setQuantity(Number(quantityInput.value) - 1));
  increment.addEventListener('click', () => setQuantity(Number(quantityInput.value) + 1));
  quantityInput.addEventListener('change', () => setQuantity(Number(quantityInput.value) || 1));

  addButton.addEventListener('click', () => {
    const { finish, size } = selection();
    add({ slug: product.slug, finish, size, quantity: Number(quantityInput.value) || 1 });
  });

  setQuantity(1);
  render();
}
