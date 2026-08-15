/**
 * Aurelia rate, availability and quoting logic.
 *
 * This module is deliberately dependency-free and lives in assets/ so it is
 * imported by exactly two consumers with no duplication between them:
 *
 *   · the build, which imports it from page modules to print "from $X" rates
 *   · the browser, which imports it from booking.js at runtime
 *
 * One implementation means the price quoted on a room page can never drift from
 * the price quoted in the booking flow.
 *
 * All money is in integer cents. All dates are 'YYYY-MM-DD' strings, anchored to
 * UTC noon internally so that daylight-saving transitions can never shift a night.
 */

export const SEASONS = [
  { key: 'low', label: 'Winter', months: [0, 1, 10, 11], multiplier: 0.78 },
  { key: 'shoulder', label: 'Shoulder', months: [2, 3, 4, 9], multiplier: 0.92 },
  { key: 'peak', label: 'High season', months: [5, 6, 7, 8], multiplier: 1.22 },
];

export const RULES = {
  weekendMultiplier: 1.15,
  extraGuestFee: 7500,
  resortFee: 4200,
  taxRate: 0.1175,
  cancellationDays: 7,
  maxNights: 21,
  bookingWindowDays: 400,
};

/* ── Date helpers ──────────────────────────────────────────────────────────── */

/** 'YYYY-MM-DD' → Date at UTC noon. */
export function parseDate(iso) {
  const [year, month, day] = String(iso).split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

/** Date → 'YYYY-MM-DD'. */
export function toISO(date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso, count) {
  const date = parseDate(iso);
  date.setUTCDate(date.getUTCDate() + count);
  return toISO(date);
}

export function today() {
  return toISO(new Date());
}

/** Number of nights between two dates (check-out is not a night). */
export function nightsBetween(checkIn, checkOut) {
  const ms = parseDate(checkOut) - parseDate(checkIn);
  return Math.round(ms / 86400000);
}

/** Every date occupied as a night, i.e. [checkIn, checkOut). */
export function nightsIn(checkIn, checkOut) {
  const list = [];
  for (let cursor = checkIn; cursor < checkOut; cursor = addDays(cursor, 1)) list.push(cursor);
  return list;
}

export function isWeekendNight(iso) {
  const day = parseDate(iso).getUTCDay();
  return day === 5 || day === 6; // Friday or Saturday night
}

export function formatDate(iso, options = { month: 'short', day: 'numeric' }) {
  return parseDate(iso).toLocaleDateString('en-US', { ...options, timeZone: 'UTC' });
}

/* ── Seasons and nightly rates ─────────────────────────────────────────────── */

export function seasonFor(iso) {
  const month = parseDate(iso).getUTCMonth();
  return SEASONS.find((season) => season.months.includes(month)) || SEASONS[1];
}

/** Rate for a single night, before fees and tax. */
export function nightlyRate(room, iso) {
  const seasonal = room.baseRate * seasonFor(iso).multiplier;
  const withWeekend = isWeekendNight(iso) ? seasonal * RULES.weekendMultiplier : seasonal;
  return Math.round(withWeekend / 100) * 100; // round to the dollar
}

/** The lowest nightly rate a room reaches in the next year — the "from" price. */
export function lowestRate(room) {
  const winterMidweek = room.baseRate * SEASONS[0].multiplier;
  return Math.round(winterMidweek / 100) * 100;
}

/* ── Availability ──────────────────────────────────────────────────────────── */

/**
 * Deterministic pseudo-random availability.
 *
 * A real property would query a PMS. Rather than fake it with `Math.random()` —
 * which would give a different answer on every render and make the calendar feel
 * broken — occupancy is derived from a stable hash of the room and date. The
 * result is stable across reloads, consistent between server and client, and
 * still varies realistically by season.
 */
function hash(text) {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return (value >>> 0) / 4294967296;
}

/** Fraction of a room type already sold for a given night, 0–1. */
export function occupancy(room, iso) {
  const season = seasonFor(iso);
  const pressure = { peak: 0.82, shoulder: 0.58, low: 0.34 }[season.key];
  const weekend = isWeekendNight(iso) ? 0.16 : 0;
  const noise = hash(`${room.slug}:${iso}`) * 0.3 - 0.15;
  return Math.min(1, Math.max(0, pressure + weekend + noise));
}

/** Rooms of this type still bookable on this night. */
export function unitsLeft(room, iso) {
  return Math.max(0, Math.round(room.count * (1 - occupancy(room, iso))));
}

export function isAvailable(room, iso) {
  return unitsLeft(room, iso) > 0;
}

/** True when every night of the stay has at least one unit free. */
export function isStayAvailable(room, checkIn, checkOut) {
  return nightsIn(checkIn, checkOut).every((night) => isAvailable(room, night));
}

/** Minimum nights required for a stay starting on this date. */
export function minimumStay(iso) {
  return seasonFor(iso).key === 'peak' && isWeekendNight(iso) ? 2 : 1;
}

/* ── Quoting ───────────────────────────────────────────────────────────────── */

/**
 * Price a stay.
 *
 * @returns {{
 *   nights: Array<{date: string, rate: number, season: string, weekend: boolean}>,
 *   nightCount: number, roomTotal: number, extraGuestTotal: number,
 *   resortTotal: number, subtotal: number, tax: number, total: number,
 *   averageNightly: number, dueNow: number
 * }}
 */
export function quote({ room, checkIn, checkOut, guests = 2 }) {
  const dates = nightsIn(checkIn, checkOut);
  const nights = dates.map((date) => ({
    date,
    rate: nightlyRate(room, date),
    season: seasonFor(date).label,
    weekend: isWeekendNight(date),
  }));

  const roomTotal = nights.reduce((sum, night) => sum + night.rate, 0);
  const extraGuests = Math.max(0, guests - room.sleeps);
  const extraGuestTotal = extraGuests * RULES.extraGuestFee * nights.length;
  const resortTotal = RULES.resortFee * nights.length;

  const subtotal = roomTotal + extraGuestTotal + resortTotal;
  const tax = Math.round(subtotal * RULES.taxRate);
  const total = subtotal + tax;

  return {
    nights,
    nightCount: nights.length,
    roomTotal,
    extraGuests,
    extraGuestTotal,
    resortTotal,
    subtotal,
    tax,
    total,
    averageNightly: nights.length ? Math.round(roomTotal / nights.length) : 0,
    dueNow: nights.length ? nights[0].rate : 0, // first night held at booking
  };
}

/* ── Validation ────────────────────────────────────────────────────────────── */

/**
 * Validate a requested stay. Returns an array of human-readable problems —
 * empty means the stay is bookable.
 */
export function validateStay({ checkIn, checkOut, guests }) {
  const problems = [];
  const now = today();

  if (!checkIn || !checkOut) {
    problems.push('Choose an arrival and departure date.');
    return problems;
  }
  if (checkIn < now) problems.push('Arrival cannot be in the past.');
  if (checkOut <= checkIn) problems.push('Departure must be after arrival.');

  const nights = nightsBetween(checkIn, checkOut);
  if (nights > RULES.maxNights) {
    problems.push(`Stays are limited to ${RULES.maxNights} nights — call us for anything longer.`);
  }
  if (checkIn > addDays(now, RULES.bookingWindowDays)) {
    problems.push('We take bookings up to about thirteen months ahead.');
  }

  const required = minimumStay(checkIn);
  if (nights > 0 && nights < required) {
    problems.push(`That arrival date has a ${required}-night minimum.`);
  }
  if (guests !== undefined && (guests < 1 || guests > 5)) {
    problems.push('Parties are between one and five guests.');
  }
  return problems;
}

/** Money formatter shared by the build and the browser. */
export function money(cents, { withCents = false } = {}) {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: withCents ? 2 : 0,
    maximumFractionDigits: withCents ? 2 : 0,
  });
}
