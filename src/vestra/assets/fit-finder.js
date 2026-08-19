/**
 * The fit finder, in the browser.
 *
 * All of the thinking is in fit.js, which the build also imports — this file
 * only reads the form, calls the same functions, and writes the answer out.
 * That is the point: the recommendation a customer is given and the grade
 * rendered into the static HTML come from one implementation, so they cannot
 * disagree with each other.
 */
import { garments, cloths } from './data.js';
import { POINTS, recommendSize, sizeLabel, toCm, formatLength } from './fit.js';

const form = document.querySelector('[data-fit-form]');
const list = document.querySelector('[data-fit-list]');
const empty = document.querySelector('[data-fit-empty]');

if (form && list && empty) {
  const inputs = [...form.querySelectorAll('[data-measure]')];
  const unitRadios = [...form.querySelectorAll('[data-unit]')];
  const unitLabels = [...form.querySelectorAll('[data-unit-label]')];
  const systemSelect = form.querySelector('[data-system]');

  const currentUnit = () => (unitRadios.find((r) => r.checked) || {}).value || 'cm';

  /** Read the form into a body measurement set, always in centimetres. */
  function readBody() {
    const unit = currentUnit();
    const body = {};
    for (const input of inputs) {
      const value = parseFloat(input.value);
      if (Number.isFinite(value) && value > 0) body[input.dataset.measure] = toCm(value, unit);
    }
    return body;
  }

  const VERDICT_CLASS = { snug: 'is-snug', relaxed: 'is-relaxed', 'as intended': 'is-true' };

  function renderPoints(result) {
    return result.points
      .map(
        (p) => `<li class="point ${VERDICT_CLASS[p.verdict] || ''}">
          <span class="point__name">${POINTS[p.point] ? POINTS[p.point].label : p.point}</span>
          <span class="point__ease figure">${p.easeCm > 0 ? '+' : ''}${p.easeCm.toFixed(1)} cm</span>
          <span class="point__verdict">${p.verdict}</span>
        </li>`,
      )
      .join('');
  }

  function render() {
    const body = readBody();
    const system = systemSelect ? systemSelect.value : 'UK';
    const given = Object.keys(body).length;

    if (!given) {
      empty.hidden = false;
      list.hidden = true;
      list.innerHTML = '';
      return;
    }

    empty.hidden = true;
    list.hidden = false;

    list.innerHTML = garments
      .map((garment) => {
        const result = recommendSize(garment, body);
        const cloth = cloths[garment.cloth];

        if (result.status === 'insufficient') {
          return `<li class="result">
            <p class="result__name">${garment.name}</p>
            <p class="result__none">Needs a measurement this garment is graded on.</p>
          </li>`;
        }

        if (result.status === 'off-chart') {
          return `<li class="result result--off">
            <p class="result__name">${garment.name}</p>
            <p class="result__size">Outside the range</p>
            <p class="result__why">${result.message}</p>
          </li>`;
        }

        const size = sizeLabel(result.best.size, system);
        const alt = result.alternative ? sizeLabel(result.alternative.size, system) : null;

        return `<li class="result${result.status === 'between' ? ' result--between' : ''}">
          <div class="result__head">
            <p class="result__name">
              <a href="${garment.href || `../shop/${garment.slug}/`}">${garment.name}</a>
              <span class="result__cloth">${cloth.name}</span>
            </p>
            <p class="result__size figure">${size}${alt ? ` <span>or ${alt}</span>` : ''}</p>
          </div>
          <p class="result__why">${result.message}</p>
          <ul class="points">${renderPoints(result.best)}</ul>
        </li>`;
      })
      .join('');
  }

  /**
   * Convert what is already typed when the unit changes, rather than
   * reinterpreting it. Someone who typed 86 in centimetres and switches to
   * inches meant the same body, not a 218 cm one.
   */
  function switchUnit(to) {
    for (const input of inputs) {
      const value = parseFloat(input.value);
      if (!Number.isFinite(value)) continue;
      input.value = to === 'in' ? (value / 2.54).toFixed(1) : Math.round(value * 2.54);
    }
    for (const label of unitLabels) label.textContent = to === 'in' ? 'in' : 'cm';
    // Ranges are in centimetres in the markup; inches need different bounds or
    // the browser rejects a perfectly ordinary 34" waist.
    for (const input of inputs) {
      input.min = to === 'in' ? '8' : '20';
      input.max = to === 'in' ? '87' : '220';
      input.step = to === 'in' ? '0.5' : '0.5';
    }
  }

  form.addEventListener('input', (event) => {
    if (event.target.matches('[data-unit]')) switchUnit(event.target.value);
    render();
  });
  form.addEventListener('change', render);

  // Submitting does nothing — the answer is already live. Without this, Enter
  // in a number field reloads the page and throws the measurements away.
  form.addEventListener('submit', (event) => event.preventDefault());

  render();
}
