import { each, esc, escJson } from '../../_lib/html.js';
import { RATE_RULES, hotel, rooms } from '../data.js';
import { ROOM_PALETTE, arch } from '../art.js';
import { money } from '../assets/rates.js';
import { crumbs } from '../components.js';

export const meta = {
  title: 'Check availability',
  description: `Live availability and the full price — fees and tax included — before you
    enter a single personal detail. Free cancellation up to seven days before arrival.`,
  styles: ['booking.css'],
  scripts: ['ui.js', 'booking.js'],
  priority: 0.9,
  breadcrumbs: [
    { label: 'Aurelia', href: '/aurelia/' },
    { label: 'Check availability', href: '/aurelia/book/' },
  ],
};

/** Only the fields the client-side rate engine needs. */
const bookingData = {
  rooms: rooms.map(({ slug, name, baseRate, sleeps, maxGuests, count, size, beds }) => ({
    slug,
    name,
    baseRate,
    sleeps,
    maxGuests,
    count,
    size,
    beds,
  })),
};

const STEPS = [
  { id: 'dates', label: 'Dates' },
  { id: 'room', label: 'Room' },
  { id: 'details', label: 'Details' },
  { id: 'review', label: 'Review' },
];

export function render({ url }) {
  return `
<script type="application/json" id="booking-data">${escJson(bookingData)}</script>

<section class="page-head">
  <div class="shell">
    ${crumbs(meta.breadcrumbs, url)}
    <p class="eyebrow">Booking</p>
    <h1 class="display-2 page-head__title">Check availability.</h1>
    <p class="lede page-head__lede">The whole price — facilities fee and county tax
      included — is shown before you enter a single detail.</p>
  </div>
</section>

<section class="section section--tight">
  <div class="shell">
    <noscript>
      <div class="booking-noscript">
        <h2 class="display-3">The calendar needs JavaScript</h2>
        <p class="text-soft" style="margin-top:var(--space-xs)">
          Availability is calculated in your browser, so the live calendar will not run
          without scripting. Call
          <a href="tel:${esc(hotel.phone.replace(/[^+\d]/g, ''))}">${esc(hotel.phone)}</a>
          or email <a href="mailto:${esc(hotel.email)}">${esc(hotel.email)}</a> and someone
          will book it with you directly.
        </p>
      </div>
    </noscript>

    <div data-booking>
      <ol class="stepper">
        ${each(
          STEPS,
          (step, index) => `<li class="stepper__item" data-step="${esc(step.id)}"
          data-state="${index === 0 ? 'current' : 'todo'}">
          <span class="stepper__num">${String(index + 1).padStart(2, '0')}</span>
          <span>${esc(step.label)}</span>
        </li>`,
        )}
      </ol>

      <p class="booking__status" data-status role="status" aria-live="polite"></p>

      <div class="booking">
        <div>
          ${datesPanel()}
          ${roomPanel()}
          ${detailsPanel()}
          ${reviewPanel()}
          <div class="booking__panel" data-panel="confirmation" hidden>
            <div class="confirmation" data-confirmation></div>
          </div>
        </div>

        <aside class="summary" aria-labelledby="summary-title">
          <h2 class="summary__title" id="summary-title">Your stay</h2>
          <div data-summary></div>
        </aside>
      </div>
    </div>
  </div>
</section>
`;
}

/* ── Step 1 ────────────────────────────────────────────────────────────────── */

function datesPanel() {
  return `<div class="booking__panel" data-panel="dates">
    <h2 class="booking__title" tabindex="-1" data-panel-title>When would you like to come?</h2>
    <p class="text-soft">Pick an arrival, then a departure. Struck-through nights are sold
      out across the whole property.</p>

    <div class="calendar">
      <div class="calendar__head">
        <button class="calendar__nav" type="button" data-cal-prev aria-label="Previous month">
          <span aria-hidden="true">←</span>
        </button>
        <p class="visually-hidden" data-months-label aria-live="polite"></p>
        <button class="calendar__nav" type="button" data-cal-next aria-label="Next month">
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <div class="calendar__months" data-calendar></div>

      <div class="calendar__legend">
        <span><span class="calendar__swatch" data-kind="selected"></span> Arrival / departure</span>
        <span><span class="calendar__swatch" data-kind="range"></span> Nights in your stay</span>
        <span><span class="calendar__swatch" data-kind="sold"></span> Sold out</span>
      </div>
    </div>

    <div class="selection" data-selection></div>

    <div class="field" style="max-width:14rem">
      <label class="field__label" for="guests">Guests</label>
      <select id="guests" data-guests>
        ${[1, 2, 3, 4, 5]
          .map((count) => `<option value="${count}"${count === 2 ? ' selected' : ''}>${count}</option>`)
          .join('')}
      </select>
    </div>

    <div class="booking__actions">
      <button class="button" type="button" data-next="dates" disabled>Choose a room</button>
    </div>
  </div>`;
}

/* ── Step 2 ────────────────────────────────────────────────────────────────── */

function roomPanel() {
  return `<div class="booking__panel" data-panel="room" hidden>
    <h2 class="booking__title" tabindex="-1" data-panel-title>Which room?</h2>
    <p class="text-soft">Prices are for your whole stay, including the facilities fee and
      county tax.</p>

    <p class="form-status" data-options-note role="status"></p>

    <ul class="options" data-options>
      ${each(
        rooms,
        (room) => `<li class="option" data-room="${esc(room.slug)}" data-available="true">
        <label class="option__label" for="room-${esc(room.slug)}">
          <input type="radio" name="room" id="room-${esc(room.slug)}"
                 value="${esc(room.slug)}">
          <span class="option__art">
            ${arch({ seed: `room-${room.slug}`, palette: ROOM_PALETTE[room.art] })}
          </span>
          <span>
            <span class="option__name">${esc(room.name)}</span>
            <span class="option__meta">${esc(room.beds)} · ${room.size} sq ft ·
              ${esc(room.view)}</span>
            <span class="option__status" data-option-status></span>
          </span>
          <span class="option__price">
            <span class="option__total" data-option-total>—</span>
            <span class="option__nightly" data-option-nightly></span>
          </span>
        </label>
      </li>`,
      )}
    </ul>

    <div class="booking__actions">
      <button class="button button--ghost" type="button" data-back="dates">Back</button>
      <button class="button" type="button" data-next="room" disabled>Enter details</button>
    </div>
  </div>`;
}

/* ── Step 3 ────────────────────────────────────────────────────────────────── */

function detailsPanel() {
  return `<div class="booking__panel" data-panel="details" hidden>
    <h2 class="booking__title" tabindex="-1" data-panel-title>Who is coming?</h2>
    <p class="text-soft">Nothing is transmitted — this demonstration keeps everything in your
      own browser and forgets it when you close the tab.</p>

    <form class="form-grid form-grid--2" data-details-form novalidate>
      <div class="field">
        <label class="field__label" for="firstName">First name</label>
        <input id="firstName" name="firstName" type="text" required
               data-label="First name" autocomplete="given-name">
        <p class="field__error" aria-live="polite"></p>
      </div>

      <div class="field">
        <label class="field__label" for="lastName">Last name</label>
        <input id="lastName" name="lastName" type="text" required
               data-label="Last name" autocomplete="family-name">
        <p class="field__error" aria-live="polite"></p>
      </div>

      <div class="field">
        <label class="field__label" for="email">Email</label>
        <input id="email" name="email" type="email" required
               data-label="Email address" autocomplete="email"
               spellcheck="false" autocapitalize="off">
        <p class="field__error" aria-live="polite"></p>
      </div>

      <div class="field">
        <label class="field__label" for="phone">Phone</label>
        <input id="phone" name="phone" type="tel" data-label="Phone number"
               autocomplete="tel">
        <p class="field__hint">Optional — used only if we need to reach you on the day.</p>
        <p class="field__error" aria-live="polite"></p>
      </div>

      <div class="field span-2">
        <label class="field__label" for="notes">Anything we should know?</label>
        <textarea id="notes" name="notes" data-label="Notes"></textarea>
        <p class="field__hint">Dietary requirements, accessibility needs, an anniversary,
          a dog.</p>
        <p class="field__error" aria-live="polite"></p>
      </div>
    </form>

    <div class="booking__actions">
      <button class="button button--ghost" type="button" data-back="room">Back</button>
      <button class="button" type="button" data-next="details">Review</button>
    </div>
  </div>`;
}

/* ── Step 4 ────────────────────────────────────────────────────────────────── */

function reviewPanel() {
  return `<div class="booking__panel" data-panel="review" hidden>
    <h2 class="booking__title" tabindex="-1" data-panel-title>Does this look right?</h2>

    <div class="review" data-review></div>

    <p class="text-soft" style="font-size:var(--step--1)">
      Only the first night is held today; the balance is settled on departure. Free
      cancellation up to ${RATE_RULES.cancellationDays} days before arrival, after which the
      first night is charged. No card details are collected by this demonstration.
    </p>

    <div class="booking__actions">
      <button class="button button--ghost" type="button" data-back="details">Back</button>
      <button class="button" type="button" data-confirm>Confirm reservation</button>
    </div>
  </div>`;
}
