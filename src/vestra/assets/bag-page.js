/**
 * Render the bag from storage.
 *
 * Every line is garment + colour + size, so quantity controls act on that triple
 * rather than on a product — changing the quantity of the coat in size M must
 * not touch the same coat in size L.
 */
import { colourways, garmentBySlug, cloths } from './data.js';
import { sizeLabel } from './fit.js';
import { getBag, lineId, money, onBagChange, removeLine, setQuantity, clearBag, totals } from './bag.js';

const root = document.querySelector('[data-bag-page]');

if (root) {
  const empty = root.querySelector('[data-bag-empty]');
  const filled = root.querySelector('[data-bag-filled]');
  const list = root.querySelector('[data-lines]');
  const summary = root.querySelector('[data-summary]');

  function paint(lines) {
    const has = lines.length > 0;
    if (empty) empty.hidden = has;
    if (filled) filled.hidden = !has;
    if (!has || !list) return;

    list.innerHTML = lines
      .map((line) => {
        const garment = garmentBySlug[line.slug];
        if (!garment) return '';
        const id = lineId(line.slug, line.colour, line.size);
        const colour = colourways[line.colour];
        return `<li class="bag-line">
          <div class="bag-line__body">
            <p class="bag-line__name">${garment.name}</p>
            <p class="bag-line__meta">
              ${cloths[garment.cloth].name} · ${colour ? colour.name : line.colour} ·
              Size ${sizeLabel(line.size, 'UK')}
            </p>
          </div>
          <div class="qty" role="group" aria-label="Quantity for ${garment.name}, size ${sizeLabel(line.size, 'UK')}">
            <button type="button" data-dec="${id}" aria-label="Decrease quantity">−</button>
            <span class="figure" data-qty>${line.quantity}</span>
            <button type="button" data-inc="${id}" aria-label="Increase quantity">+</button>
          </div>
          <p class="bag-line__price figure">${money(garment.price * line.quantity)}</p>
          <button class="bag-line__remove" type="button" data-remove="${id}">Remove</button>
        </li>`;
      })
      .join('');

    if (summary) {
      const t = totals(lines);
      summary.innerHTML = `
        <dl class="summary__rows figure">
          <div><dt>Subtotal</dt><dd>${money(t.subtotal)}</dd></div>
          <div><dt>Shipping</dt><dd>${t.shipping === 0 ? 'Free' : money(t.shipping)}</dd></div>
        </dl>
        <p class="summary__total figure"><span>Total</span> <strong>${money(t.total)}</strong></p>`;
    }
  }

  const announcer = document.querySelector('[data-bag-announce]');

  /**
   * Repeating identical text into a live region is not re-announced by most
   * screen readers, and pressing + twice must be heard twice. A trailing
   * no-break space toggles the string without changing what is read.
   */
  function say(message) {
    if (!announcer) return;
    announcer.textContent =
      announcer.textContent === message ? `${message}\u00a0` : message;
  }

  root.addEventListener('click', (event) => {
    const inc = event.target.closest('[data-inc]');
    const dec = event.target.closest('[data-dec]');
    const rm = event.target.closest('[data-remove]');
    const clear = event.target.closest('[data-clear-bag]');

    if (inc || dec) {
      const id = (inc || dec).dataset[inc ? 'inc' : 'dec'];
      const line = getBag().find((l) => lineId(l.slug, l.colour, l.size) === id);
      if (line) {
        const next = line.quantity + (inc ? 1 : -1);
        setQuantity(id, next);
        const name = garmentBySlug[line.slug] ? garmentBySlug[line.slug].name : 'Item';
        // Dropping to zero removes the line, which is a different event from
        // changing a number and needs to be said as one.
        say(next < 1 ? `${name} removed from the bag.` : `${name}, quantity ${next}.`);
      }
    } else if (rm) {
      const line = getBag().find(
        (l) => lineId(l.slug, l.colour, l.size) === rm.dataset.remove,
      );
      removeLine(rm.dataset.remove);
      const name = line && garmentBySlug[line.slug] ? garmentBySlug[line.slug].name : 'Item';
      say(`${name} removed from the bag.`);
    } else if (clear) {
      clearBag();
      say('Bag emptied.');
    }
  });

  onBagChange(paint);
  window.addEventListener('storage', (e) => {
    if (e.key === 'vestra.bag.v1') paint(getBag());
  });
}
