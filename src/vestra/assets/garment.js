/**
 * The garment page: colour, size, stock and adding to the bag.
 *
 * Stock is per colourway, so changing colour has to re-derive which sizes are
 * available — a size that is in stock in Slate and gone in Ink is the normal
 * case in clothing, and a picker that ignores that will happily sell something
 * that does not exist.
 */
import { garmentBySlug, stockFor, colourways } from './data.js';
import { sizeLabel } from './fit.js';
import { addLine } from './bag.js';

const root = document.querySelector('[data-garment]');

if (root) {
  const garment = garmentBySlug[root.dataset.garment];
  const form = root.querySelector('[data-add-form]');
  const sizeBox = root.querySelector('[data-sizes]');
  const stockNote = root.querySelector('[data-stock]');
  const status = root.querySelector('[data-add-status]');

  if (garment && form && sizeBox) {
    const currentColour = () => {
      const checked = form.querySelector('[data-colour]:checked');
      return checked ? checked.value : garment.colours[0];
    };

    /** Repaint the size row for a colourway, preserving the choice if it survives. */
    function paintSizes() {
      const colour = currentColour();
      const stock = stockFor(garment.slug, colour);
      const previous = form.querySelector('[data-size]:checked');
      const keep = previous ? previous.value : null;

      sizeBox.innerHTML = Object.keys(garment.sizes)
        .map((size) => {
          const left = stock[size];
          const out = left === 0;
          const note = out ? 'Sold out' : left <= 2 ? `${left} left` : '';
          return `<label class="size${out ? ' size--out' : ''}">
            <input type="radio" name="size" value="${size}" data-size ${out ? 'disabled' : ''}
              ${!out && keep === size ? 'checked' : ''}>
            <span>${sizeLabel(size, 'UK')}</span>
            ${note ? `<span class="size__note">${note}</span>` : ''}
          </label>`;
        })
        .join('');

      const available = Object.values(stock).filter((n) => n > 0).length;
      if (stockNote) stockNote.textContent = `${available} of 6 in stock`;

      // Selecting a colour that has sold out of the chosen size silently drops
      // the selection, so say so rather than leaving the button looking ready.
      if (keep && stock[keep] === 0 && status) {
        status.textContent =
          `Size ${sizeLabel(keep, 'UK')} is sold out in ${colourways[colour].name}. ` +
          'Choose another size.';
      }
    }

    form.addEventListener('change', (event) => {
      if (event.target.matches('[data-colour]')) paintSizes();
      if (event.target.matches('[data-size]') && status) status.textContent = '';
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const size = form.querySelector('[data-size]:checked');

      if (!size) {
        if (status) status.textContent = 'Choose a size first.';
        const first = sizeBox.querySelector('[data-size]:not(:disabled)');
        if (first) first.focus();
        return;
      }

      addLine({ slug: garment.slug, colour: currentColour(), size: size.value });
      if (status) {
        status.textContent =
          `Added: ${garment.name}, ${colourways[currentColour()].name}, ` +
          `size ${sizeLabel(size.value, 'UK')}.`;
      }
    });

    paintSizes();
  }
}
