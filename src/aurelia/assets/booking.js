/**
 * Aurelia booking engine.
 *
 * A four-step reservation flow built without a date library, a form library or a
 * framework. The interesting parts:
 *
 *   · The calendar is a real `role="grid"` widget with roving tabindex, full
 *     arrow/Home/End/PageUp/PageDown navigation, and per-cell accessible names —
 *     a bare day number tells a screen-reader user nothing.
 *   · Availability and pricing come from rates.js, the same module the build
 *     uses to print rates on the room pages, so the two can never disagree.
 *   · Selecting an arrival date computes the furthest reachable departure (the
 *     night before the next sold-out night) and disables everything past it,
 *     rather than letting someone pick a range that cannot be fulfilled.
 *   · State survives a reload via sessionStorage.
 *
 * Nothing is transmitted anywhere. The confirmation step is local.
 */

import {
  RULES,
  addDays,
  formatDate,
  isAvailable,
  isStayAvailable,
  minimumStay,
  money,
  nightsBetween,
  nightsIn,
  parseDate,
  quote,
  toISO,
  today,
  unitsLeft,
  validateStay,
} from './rates.js';

const root = document.querySelector('[data-booking]');
if (root) start(root);

function start(root) {
  const rooms = JSON.parse(document.getElementById('booking-data').textContent).rooms;
  const roomBySlug = Object.fromEntries(rooms.map((room) => [room.slug, room]));

  const STORAGE_KEY = 'aurelia:booking';
  const STEPS = ['dates', 'room', 'details', 'review'];

  /* ── State ───────────────────────────────────────────────────────────────── */

  const defaults = {
    step: 'dates',
    checkIn: null,
    checkOut: null,
    guests: 2,
    roomSlug: null,
    guest: { firstName: '', lastName: '', email: '', phone: '', notes: '' },
    reference: null,
  };

  let state = load();
  let focusedDate = state.checkIn || today();
  let visibleMonth = startOfMonth(focusedDate);

  function load() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
      if (!saved) return { ...defaults };
      // Drop a stored stay that has since fallen into the past.
      if (saved.checkIn && saved.checkIn < today()) return { ...defaults };
      return { ...defaults, ...saved, guest: { ...defaults.guest, ...saved.guest } };
    } catch {
      return { ...defaults };
    }
  }

  function save() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* Private browsing — the flow still works, it just will not survive a reload. */
    }
  }

  /* ── Elements ────────────────────────────────────────────────────────────── */

  const el = {
    panels: Object.fromEntries(
      STEPS.concat('confirmation').map((step) => [step, root.querySelector(`[data-panel="${step}"]`)]),
    ),
    stepper: root.querySelectorAll('[data-step]'),
    calendar: root.querySelector('[data-calendar]'),
    monthsLabel: root.querySelector('[data-months-label]'),
    prev: root.querySelector('[data-cal-prev]'),
    next: root.querySelector('[data-cal-next]'),
    guests: root.querySelector('[data-guests]'),
    selection: root.querySelector('[data-selection]'),
    status: root.querySelector('[data-status]'),
    options: root.querySelector('[data-options]'),
    optionsNote: root.querySelector('[data-options-note]'),
    summary: root.querySelector('[data-summary]'),
    review: root.querySelector('[data-review]'),
    confirmation: root.querySelector('[data-confirmation]'),
    detailsForm: root.querySelector('[data-details-form]'),
  };

  /* ── Announcements ───────────────────────────────────────────────────────── */

  function announce(message) {
    if (el.status) el.status.textContent = message;
  }

  /* ── Date helpers ────────────────────────────────────────────────────────── */

  function startOfMonth(iso) {
    return `${iso.slice(0, 7)}-01`;
  }

  function shiftMonth(iso, delta) {
    const date = parseDate(iso);
    date.setUTCMonth(date.getUTCMonth() + delta, 1);
    return toISO(date);
  }

  function longDate(iso) {
    return formatDate(iso, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  /* ── Availability across the whole property ──────────────────────────────── */

  /** True when at least one room type has a unit free on this night. */
  function anyRoomAvailable(iso) {
    return rooms.some((room) => isAvailable(room, iso));
  }

  /**
   * With an arrival chosen, the latest departure that can actually be fulfilled:
   * the first fully sold-out night after arrival ends the range.
   */
  function latestCheckout(checkIn) {
    let cursor = checkIn;
    for (let step = 0; step < RULES.maxNights; step += 1) {
      if (!anyRoomAvailable(cursor)) break;
      cursor = addDays(cursor, 1);
    }
    return cursor; // the checkout date itself is not a night
  }

  /** Why a date cannot be chosen right now, or null if it can. */
  function blockedReason(iso) {
    if (iso < today()) return 'in the past';
    if (iso > addDays(today(), RULES.bookingWindowDays)) return 'not yet open for booking';

    // Choosing a departure date.
    if (state.checkIn && !state.checkOut) {
      if (iso <= state.checkIn) return null; // restarts the range instead
      if (iso > latestCheckout(state.checkIn)) return 'not available for the whole stay';
      if (nightsBetween(state.checkIn, iso) < minimumStay(state.checkIn)) {
        return `below the ${minimumStay(state.checkIn)}-night minimum`;
      }
      return null;
    }

    // Choosing an arrival date.
    return anyRoomAvailable(iso) ? null : 'sold out';
  }

  /* ── Calendar rendering ──────────────────────────────────────────────────── */

  const WEEKDAYS = [
    ['Su', 'Sunday'],
    ['Mo', 'Monday'],
    ['Tu', 'Tuesday'],
    ['We', 'Wednesday'],
    ['Th', 'Thursday'],
    ['Fr', 'Friday'],
    ['Sa', 'Saturday'],
  ];

  function monthWeeks(iso) {
    const date = parseDate(iso);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const lead = new Date(Date.UTC(year, month, 1, 12)).getUTCDay();
    const length = new Date(Date.UTC(year, month + 1, 0, 12)).getUTCDate();

    const cells = Array.from({ length: lead }, () => null);
    for (let day = 1; day <= length; day += 1) {
      cells.push(toISO(new Date(Date.UTC(year, month, day, 12))));
    }
    while (cells.length % 7) cells.push(null);

    const weeks = [];
    for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
    return weeks;
  }

  function cellAttributes(iso) {
    const { checkIn, checkOut } = state;
    const isStart = iso === checkIn;
    const isEnd = iso === checkOut;
    const inRange = Boolean(checkIn && checkOut && iso > checkIn && iso < checkOut);
    const reason = blockedReason(iso);
    const sold = reason === 'sold out';
    const selected = isStart || isEnd;

    let edge = '';
    if (isStart && isEnd) edge = 'both';
    else if (isStart) edge = checkOut ? 'start' : 'both';
    else if (isEnd) edge = 'end';

    const left = rooms.reduce((sum, room) => sum + unitsLeft(room, iso), 0);
    const parts = [longDate(iso)];
    if (isStart) parts.push('selected arrival');
    else if (isEnd) parts.push('selected departure');
    else if (inRange) parts.push('within your stay');
    if (reason) parts.push(reason);
    else if (left <= 3) parts.push(`${left} room${left === 1 ? '' : 's'} left`);

    return {
      selected,
      inRange,
      edge,
      sold,
      disabled: Boolean(reason) && reason !== 'sold out' ? true : sold,
      label: parts.join(', '),
    };
  }

  function renderCalendar() {
    const months = [visibleMonth, shiftMonth(visibleMonth, 1)];

    el.calendar.innerHTML = months
      .map((month, monthIndex) => {
        const caption = formatDate(month, { month: 'long', year: 'numeric' });
        const captionId = `cal-caption-${monthIndex}`;

        const head = WEEKDAYS.map(
          ([short, full]) => `<th scope="col"><abbr title="${full}">${short}</abbr></th>`,
        ).join('');

        const body = monthWeeks(month)
          .map((week) => {
            const days = week
              .map((iso) => {
                if (!iso) return '<td class="day-empty"></td>';
                const info = cellAttributes(iso);
                return `<td role="gridcell"
                  class="day"
                  data-date="${iso}"
                  tabindex="${iso === focusedDate ? '0' : '-1'}"
                  aria-selected="${info.selected}"
                  aria-disabled="${info.disabled}"
                  aria-label="${info.label}"
                  data-in-range="${info.inRange}"
                  data-sold="${info.sold}"
                  data-today="${iso === today()}"
                  ${info.edge ? `data-edge="${info.edge}"` : ''}
                >${Number(iso.slice(8))}</td>`;
              })
              .join('');
            return `<tr>${days}</tr>`;
          })
          .join('');

        return `<div class="month">
          <div class="month__caption" id="${captionId}">${caption}</div>
          <table role="grid" aria-labelledby="${captionId}">
            <thead><tr>${head}</tr></thead>
            <tbody>${body}</tbody>
          </table>
        </div>`;
      })
      .join('');

    // If the roving-tabindex date is not on screen, park it on the first day shown.
    if (!el.calendar.querySelector('[tabindex="0"]')) {
      const first = el.calendar.querySelector('[data-date]');
      if (first) {
        focusedDate = first.dataset.date;
        first.tabIndex = 0;
      }
    }

    el.monthsLabel.textContent = `${formatDate(months[0], {
      month: 'long',
      year: 'numeric',
    })} and ${formatDate(months[1], { month: 'long', year: 'numeric' })}`;

    el.prev.disabled = visibleMonth <= startOfMonth(today());
  }

  function moveFocus(iso, { render = true } = {}) {
    focusedDate = iso;
    const monthStart = startOfMonth(iso);
    const secondMonth = shiftMonth(visibleMonth, 1);

    if (monthStart < visibleMonth) visibleMonth = monthStart;
    else if (monthStart > secondMonth) visibleMonth = shiftMonth(monthStart, -1);

    if (render) renderCalendar();
    el.calendar.querySelector(`[data-date="${iso}"]`)?.focus();
  }

  /* ── Selection ───────────────────────────────────────────────────────────── */

  function selectDate(iso) {
    const reason = blockedReason(iso);

    // A click on or before the arrival date restarts the range.
    if (state.checkIn && !state.checkOut && iso <= state.checkIn) {
      state.checkIn = iso;
      state.checkOut = null;
      announce(`Arrival set to ${longDate(iso)}. Now choose a departure date.`);
    } else if (!state.checkIn || state.checkOut) {
      if (reason) {
        announce(`${longDate(iso)} is ${reason}.`);
        return;
      }
      state.checkIn = iso;
      state.checkOut = null;
      state.roomSlug = null;
      announce(`Arrival set to ${longDate(iso)}. Now choose a departure date.`);
    } else {
      if (reason) {
        announce(`${longDate(iso)} is ${reason}.`);
        return;
      }
      state.checkOut = iso;
      const nights = nightsBetween(state.checkIn, state.checkOut);
      announce(
        `${nights} night${nights === 1 ? '' : 's'}, ` +
          `${longDate(state.checkIn)} to ${longDate(state.checkOut)}.`,
      );
    }

    save();
    renderCalendar();
    renderSelection();
    renderSummary();
  }

  /* ── Panels ──────────────────────────────────────────────────────────────── */

  function renderSelection() {
    const { checkIn, checkOut, guests } = state;
    const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;

    el.selection.innerHTML = `
      <div>
        <div class="selection__label">Arrival</div>
        <div class="selection__value">${checkIn ? formatDate(checkIn, { weekday: 'short', month: 'short', day: 'numeric' }) : '—'}</div>
      </div>
      <div>
        <div class="selection__label">Departure</div>
        <div class="selection__value">${checkOut ? formatDate(checkOut, { weekday: 'short', month: 'short', day: 'numeric' }) : '—'}</div>
      </div>
      <div>
        <div class="selection__label">Stay</div>
        <div class="selection__value">${nights ? `${nights} night${nights === 1 ? '' : 's'}` : '—'} · ${guests} guest${guests === 1 ? '' : 's'}</div>
      </div>`;

    root.querySelector('[data-next="dates"]').disabled = !(checkIn && checkOut);
  }

  function renderOptions() {
    const { checkIn, checkOut, guests } = state;
    if (!checkIn || !checkOut) return;

    let anyAvailable = false;

    for (const item of el.options.querySelectorAll('[data-room]')) {
      const room = roomBySlug[item.dataset.room];
      const input = item.querySelector('input');
      const fits = guests <= room.maxGuests;
      const available = isStayAvailable(room, checkIn, checkOut) && fits;
      const priced = quote({ room, checkIn, checkOut, guests });
      const scarcest = Math.min(
        ...nightsIn(checkIn, checkOut).map((night) => unitsLeft(room, night)),
      );

      item.dataset.available = String(available);
      input.disabled = !available;
      if (available) anyAvailable = true;

      item.querySelector('[data-option-total]').textContent = money(priced.total);
      item.querySelector('[data-option-nightly]').textContent =
        `${money(priced.averageNightly)} avg / night`;

      const status = item.querySelector('[data-option-status]');
      if (!fits) {
        status.textContent = `Sleeps up to ${room.maxGuests}`;
        status.dataset.tone = 'none';
      } else if (!available) {
        status.textContent = 'Not available for these dates';
        status.dataset.tone = 'none';
      } else if (scarcest <= 2) {
        status.textContent = `Only ${scarcest} left`;
        status.dataset.tone = 'low';
      } else {
        status.textContent = 'Available';
        status.dataset.tone = 'ok';
      }

      if (input.checked && !available) {
        input.checked = false;
        state.roomSlug = null;
      }
      if (state.roomSlug === room.slug) input.checked = true;
    }

    el.optionsNote.textContent = anyAvailable
      ? ''
      : 'Nothing is available for those dates. Try shifting your arrival by a night or two.';

    root.querySelector('[data-next="room"]').disabled = !state.roomSlug;
  }

  function renderSummary() {
    const { checkIn, checkOut, guests, roomSlug } = state;
    const room = roomSlug ? roomBySlug[roomSlug] : null;

    if (!checkIn || !checkOut) {
      el.summary.innerHTML = `<p class="summary__empty">Choose your dates and a room to see the
        full price, including fees and tax.</p>`;
      return;
    }

    const priced = quote({ room: room || rooms[2], checkIn, checkOut, guests });
    const nights = priced.nightCount;

    const line = (label, value, muted = false) =>
      `<div class="summary__line"${muted ? ' data-muted="true"' : ''}>
        <dt>${label}</dt><dd>${value}</dd></div>`;

    el.summary.innerHTML = `
      <dl class="summary__lines">
        ${line('Dates', `${formatDate(checkIn)} – ${formatDate(checkOut)}`)}
        ${line('Guests', String(guests))}
        ${room ? line('Room', room.name) : line('Room', 'Not chosen yet', true)}
        ${line(`${nights} night${nights === 1 ? '' : 's'}`, money(priced.roomTotal))}
        ${priced.extraGuestTotal ? line(`Extra guest × ${priced.extraGuests}`, money(priced.extraGuestTotal)) : ''}
        ${line('Facilities fee', money(priced.resortTotal), true)}
        ${line('Tax', money(priced.tax), true)}
      </dl>
      <div class="summary__total"><span>Total</span><span>${money(priced.total)}</span></div>
      <p class="summary__note">
        ${money(priced.dueNow)} is held at booking; the balance is settled on departure.
        Free cancellation up to ${RULES.cancellationDays} days before arrival.
        ${room ? '' : 'Prices shown are for the lowest-priced room until you choose one.'}
      </p>

      <table class="breakdown">
        <caption class="visually-hidden">Nightly rate breakdown</caption>
        <thead><tr><th scope="col">Night</th><th scope="col">Rate</th></tr></thead>
        <tbody>
          ${priced.nights
            .map(
              (night) => `<tr>
                <td>${formatDate(night.date, { weekday: 'short', month: 'short', day: 'numeric' })}
                ${night.weekend ? '<span class="breakdown__tag">wknd</span>' : ''}</td>
                <td>${money(night.rate)}</td>
              </tr>`,
            )
            .join('')}
        </tbody>
      </table>`;
  }

  function renderReview() {
    const { checkIn, checkOut, guests, roomSlug, guest } = state;
    const room = roomBySlug[roomSlug];
    if (!room) return;
    const priced = quote({ room, checkIn, checkOut, guests });

    el.review.innerHTML = `
      <div class="review__block">
        <h3 class="review__heading">Your stay</h3>
        <dl>
          <dt>Room</dt><dd>${room.name}</dd>
          <dt>Arrival</dt><dd>${longDate(checkIn)}, from 16:00</dd>
          <dt>Departure</dt><dd>${longDate(checkOut)}, by 11:00</dd>
          <dt>Nights</dt><dd>${priced.nightCount}</dd>
          <dt>Guests</dt><dd>${guests}</dd>
        </dl>
      </div>
      <div class="review__block">
        <h3 class="review__heading">Guest</h3>
        <dl>
          <dt>Name</dt><dd>${escapeHtml(`${guest.firstName} ${guest.lastName}`.trim())}</dd>
          <dt>Email</dt><dd>${escapeHtml(guest.email)}</dd>
          <dt>Phone</dt><dd>${escapeHtml(guest.phone || '—')}</dd>
          <dt>Notes</dt><dd>${escapeHtml(guest.notes || 'None')}</dd>
        </dl>
      </div>
      <div class="review__block">
        <h3 class="review__heading">Total</h3>
        <dl>
          <dt>Accommodation</dt><dd>${money(priced.roomTotal)}</dd>
          ${priced.extraGuestTotal ? `<dt>Extra guest</dt><dd>${money(priced.extraGuestTotal)}</dd>` : ''}
          <dt>Facilities fee</dt><dd>${money(priced.resortTotal)}</dd>
          <dt>Tax</dt><dd>${money(priced.tax)}</dd>
          <dt><strong>Due today</strong></dt><dd><strong>${money(priced.dueNow)}</strong></dd>
          <dt><strong>Total</strong></dt><dd><strong>${money(priced.total)}</strong></dd>
        </dl>
      </div>`;
  }

  function escapeHtml(value) {
    return String(value).replace(
      /[&<>"']/g,
      (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
    );
  }

  /* ── Step navigation ─────────────────────────────────────────────────────── */

  function goTo(step, { moveFocus = true } = {}) {
    state.step = step;
    save();

    for (const [name, panel] of Object.entries(el.panels)) {
      if (panel) panel.hidden = name !== step;
    }

    const index = STEPS.indexOf(step);
    for (const item of el.stepper) {
      const position = STEPS.indexOf(item.dataset.step);
      item.dataset.state =
        step === 'confirmation' || position < index ? 'done' : position === index ? 'current' : 'todo';
    }

    if (step === 'room') renderOptions();
    if (step === 'review') renderReview();
    renderSummary();

    // Focus follows a deliberate step change so screen-reader users land on the
    // new panel — but never on first paint, where an unrequested focus ring on a
    // heading is just noise.
    if (moveFocus) el.panels[step]?.querySelector('[data-panel-title]')?.focus();
  }

  /* ── Wiring ──────────────────────────────────────────────────────────────── */

  el.calendar.addEventListener('click', (event) => {
    const cell = event.target.closest('[data-date]');
    if (cell) {
      moveFocus(cell.dataset.date, { render: false });
      selectDate(cell.dataset.date);
      el.calendar.querySelector(`[data-date="${cell.dataset.date}"]`)?.focus();
    }
  });

  el.calendar.addEventListener('keydown', (event) => {
    const cell = event.target.closest('[data-date]');
    if (!cell) return;
    const current = cell.dataset.date;

    const deltas = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (event.key in deltas) {
      event.preventDefault();
      moveFocus(addDays(current, deltas[event.key]));
    } else if (event.key === 'Home') {
      event.preventDefault();
      moveFocus(addDays(current, -parseDate(current).getUTCDay()));
    } else if (event.key === 'End') {
      event.preventDefault();
      moveFocus(addDays(current, 6 - parseDate(current).getUTCDay()));
    } else if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault();
      moveFocus(shiftMonth(current, event.key === 'PageUp' ? -1 : 1));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectDate(current);
      el.calendar.querySelector(`[data-date="${current}"]`)?.focus();
    }
  });

  el.prev.addEventListener('click', () => {
    visibleMonth = shiftMonth(visibleMonth, -1);
    renderCalendar();
  });

  el.next.addEventListener('click', () => {
    visibleMonth = shiftMonth(visibleMonth, 1);
    renderCalendar();
  });

  el.guests.addEventListener('change', () => {
    state.guests = Number(el.guests.value);
    save();
    renderSelection();
    renderOptions();
    renderSummary();
  });

  el.options.addEventListener('change', (event) => {
    if (event.target.name !== 'room') return;
    state.roomSlug = event.target.value;
    save();
    renderOptions();
    renderSummary();
    announce(`${roomBySlug[state.roomSlug].name} selected.`);
  });

  for (const button of root.querySelectorAll('[data-next]')) {
    button.addEventListener('click', () => {
      const from = button.dataset.next;

      if (from === 'dates') {
        const problems = validateStay(state);
        if (problems.length) {
          announce(problems[0]);
          return;
        }
        goTo('room');
      } else if (from === 'room') {
        if (!state.roomSlug) return announce('Choose a room to continue.');
        goTo('details');
      } else if (from === 'details') {
        if (!submitDetails()) return;
        goTo('review');
      }
    });
  }

  for (const button of root.querySelectorAll('[data-back]')) {
    button.addEventListener('click', () => goTo(button.dataset.back));
  }

  /** Validate the guest form and copy it into state. */
  function submitDetails() {
    const form = el.detailsForm;
    const inputs = [...form.querySelectorAll('input, textarea')];
    let firstInvalid = null;

    for (const input of inputs) {
      const field = input.closest('.field');
      const error = field?.querySelector('.field__error');
      const valid = input.checkValidity();
      field?.setAttribute('data-invalid', String(!valid));
      input.setAttribute('aria-invalid', String(!valid));
      if (error) {
        error.textContent = valid
          ? ''
          : input.validity.valueMissing
            ? `${input.dataset.label} is required.`
            : `Enter a valid ${input.dataset.label.toLowerCase()}.`;
      }
      if (!valid && !firstInvalid) firstInvalid = input;
    }

    if (firstInvalid) {
      announce('Please correct the highlighted fields.');
      firstInvalid.focus();
      return false;
    }

    state.guest = {
      firstName: form.elements.firstName.value.trim(),
      lastName: form.elements.lastName.value.trim(),
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      notes: form.elements.notes.value.trim(),
    };
    save();
    return true;
  }

  root.querySelector('[data-confirm]').addEventListener('click', () => {
    const room = roomBySlug[state.roomSlug];
    const priced = quote({ ...state, room });

    state.reference = `AUR-${parseDate(state.checkIn).getUTCFullYear()}-${Math.random()
      .toString(36)
      .slice(2, 7)
      .toUpperCase()}`;
    save();

    el.confirmation.innerHTML = `
      <h2 class="display-2" tabindex="-1" data-panel-title>We will see you on
        ${formatDate(state.checkIn, { month: 'long', day: 'numeric' })}.</h2>
      <p class="note">Reservation held</p>
      <p class="confirmation__ref">${state.reference}</p>
      <p class="lede">${room.name} for ${priced.nightCount} night${priced.nightCount === 1 ? '' : 's'},
        ${state.guests} guest${state.guests === 1 ? '' : 's'}. A confirmation would normally be sent to
        ${escapeHtml(state.guest.email)}.</p>
      <p class="text-soft">Total ${money(priced.total)} · ${money(priced.dueNow)} held today</p>
      <div class="hero__actions" style="justify-content:center">
        <button class="button" type="button" onclick="window.print()">Print this page</button>
        <button class="button button--ghost" type="button" data-restart>Start another booking</button>
      </div>
      <p class="text-soft" style="max-width:46ch">
        This is a demonstration. No reservation exists, no email is sent, and no payment
        details were collected at any point.</p>`;

    el.confirmation.querySelector('[data-restart]').addEventListener('click', () => {
      state = { ...defaults, guest: { ...defaults.guest } };
      sessionStorage.removeItem(STORAGE_KEY);
      focusedDate = today();
      visibleMonth = startOfMonth(focusedDate);
      el.detailsForm.reset();
      renderCalendar();
      renderSelection();
      goTo('dates');
    });

    goTo('confirmation');
    announce(`Booking confirmed, reference ${state.reference}.`);
  });

  /* ── Restore ─────────────────────────────────────────────────────────────── */

  el.guests.value = String(state.guests);
  if (state.guest) {
    for (const [key, value] of Object.entries(state.guest)) {
      if (el.detailsForm.elements[key]) el.detailsForm.elements[key].value = value;
    }
  }

  renderCalendar();
  renderSelection();
  // A stored confirmation belongs to a finished booking; always resume before it.
  goTo(state.step === 'confirmation' ? 'dates' : state.step, { moveFocus: false });
}
