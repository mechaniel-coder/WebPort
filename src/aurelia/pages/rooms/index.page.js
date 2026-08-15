import { each, esc } from '../../../_lib/html.js';
import { RATE_RULES, hotel, rooms } from '../../data.js';
import { ROOM_PALETTE, arch } from '../../art.js';
import { SEASONS, lowestRate, money } from '../../assets/rates.js';
import { cta, pageHead } from '../../components.js';

export const meta = {
  title: 'Rooms and rates',
  description: `Twenty-two rooms in three types — ocean-facing suites, two-bedroom cliff
    houses and courtyard rooms. Rates, sizes and what is actually in each one.`,
  scripts: ['ui.js'],
  breadcrumbs: [
    { label: 'Aurelia', href: '/aurelia/' },
    { label: 'Rooms', href: '/aurelia/rooms/' },
  ],
};

export function render({ url }) {
  return `
${pageHead({
  eyebrow: `${hotel.rooms} rooms`,
  title: 'Three kinds of room.',
  lede: `Eight ocean-facing suites, three freestanding cliff houses, and eleven courtyard
    rooms on the sheltered side. Every rate includes breakfast, the sauna, and parking.`,
  trail: meta.breadcrumbs,
  url,
})}

<section class="section">
  <div class="shell">
    <ul class="rooms">
      ${each(
        rooms,
        (room) => `<li class="room-card">
        <a href="${esc(url(`/aurelia/rooms/${room.slug}/`))}">
          <div class="room-card__art">
            ${arch({ seed: `room-${room.slug}`, palette: ROOM_PALETTE[room.art] })}
          </div>
          <div class="room-card__body">
            <h2 class="room-card__name">${esc(room.name)}</h2>
            <p class="room-card__meta">
              <span>${esc(room.beds)}</span><span>${room.size} sq ft</span>
              <span>${esc(room.view)}</span><span>Sleeps ${room.sleeps}</span>
            </p>
            <p class="text-soft">${esc(room.short)}</p>
            <p class="room-card__rate">${money(lowestRate(room))}
              <span>per night, from</span></p>
          </div>
        </a>
      </li>`,
      )}
    </ul>
  </div>
</section>

<section class="section section--paper" aria-labelledby="rates-heading">
  <div class="shell">
    <div class="section-head">
      <div>
        <p class="eyebrow">How rates work</p>
        <h2 class="display-2" id="rates-heading">No surprises at checkout.</h2>
      </div>
    </div>

    <div class="split">
      <div class="split__body">
        <p class="text-soft">Rates move with the season and with the day of the week, and
          both movements are published rather than discovered. A ${money(RATE_RULES.resortFee)}
          nightly facilities fee covers the sauna, the trail maintenance and parking; it is
          shown in every quote from the first screen, not added at the end.</p>
        <p class="text-soft">Tax is Sonoma County transient occupancy at
          ${(RATE_RULES.taxRate * 100).toFixed(2)}%. There is no service charge and no
          tipping — staff are salaried, and that is priced into the room rate.</p>
        <a class="link-arrow" href="${esc(url('/aurelia/book/'))}">See live rates</a>
      </div>

      <div>
        <table class="breakdown" style="margin-top:0">
          <caption class="visually-hidden">Seasonal rate multipliers</caption>
          <thead>
            <tr>
              <th scope="col">Season</th>
              <th scope="col">Months</th>
              <th scope="col">Rate</th>
            </tr>
          </thead>
          <tbody>
            ${each(
              SEASONS,
              (season) => `<tr>
              <td>${esc(season.label)}</td>
              <td>${esc(monthRange(season.months))}</td>
              <td>${season.multiplier < 1 ? '−' : '+'}${Math.abs(
                Math.round((season.multiplier - 1) * 100),
              )}%</td>
            </tr>`,
            )}
            <tr>
              <td>Friday and Saturday</td>
              <td>All year</td>
              <td>+${Math.round((RATE_RULES.weekendMultiplier - 1) * 100)}%</td>
            </tr>
            <tr>
              <td>Additional guest</td>
              <td>Per night</td>
              <td>${money(RATE_RULES.extraGuestFee)}</td>
            </tr>
          </tbody>
        </table>
        <p class="text-soft" style="font-size:var(--step--1);margin-top:var(--space-s)">
          Two-night minimum on Friday and Saturday between June and September.
          Free cancellation up to ${RATE_RULES.cancellationDays} days before arrival.
        </p>
      </div>
    </div>
  </div>
</section>

${cta({
  url,
  title: 'See what is open.',
  body: 'The calendar shows live availability by room type, with the full price before you enter a single detail.',
  seed: 'rooms-cta',
})}
`;
}

/** '0,1,10,11' → 'Nov–Feb'. Months are stored unordered, so sort by calendar year. */
function monthRange(months) {
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const sorted = [...months].sort((a, b) => a - b);

  // Detect a run that wraps the year end, e.g. Nov, Dec, Jan, Feb.
  const wraps = sorted.includes(0) && sorted.includes(11);
  if (wraps) {
    const tail = sorted.filter((month) => month >= 6);
    const head = sorted.filter((month) => month < 6);
    return `${names[Math.min(...tail)]}–${names[Math.max(...head)]}`;
  }
  const contiguous = sorted.every((month, index) => index === 0 || month === sorted[index - 1] + 1);
  return contiguous
    ? `${names[sorted[0]]}–${names[sorted[sorted.length - 1]]}`
    : sorted.map((month) => names[month]).join(', ');
}
