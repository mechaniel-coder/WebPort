/**
 * Room detail pages, generated from data.js — one route per room type.
 */
import { each, esc } from '../../../_lib/html.js';
import { absolute } from '../../../_lib/html.js';
import { RATE_RULES, hotel, rooms } from '../../data.js';
import { ROOM_PALETTE, arch, horizon } from '../../art.js';
import { SEASONS, lowestRate, money, nightlyRate } from '../../assets/rates.js';
import { cta, crumbs } from '../../components.js';

export const pages = rooms.map((room) => ({
  slug: room.slug,

  meta: {
    title: room.name,
    metaTitle: `${room.name} — Aurelia`,
    description: `${room.short}. ${room.size} sq ft, ${room.beds.toLowerCase()}, sleeps
      ${room.sleeps}. From ${money(lowestRate(room))} per night including breakfast.`,
    scripts: ['ui.js'],
    ogType: 'product',
    breadcrumbs: [
      { label: 'Aurelia', href: '/aurelia/' },
      { label: 'Rooms', href: '/aurelia/rooms/' },
      { label: room.name, href: `/aurelia/rooms/${room.slug}/` },
    ],
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'HotelRoom',
      name: room.name,
      description: room.short,
      url: absolute(`/aurelia/rooms/${room.slug}/`),
      occupancy: { '@type': 'QuantitativeValue', maxValue: room.maxGuests, unitCode: 'C62' },
      floorSize: { '@type': 'QuantitativeValue', value: room.size, unitCode: 'FTK' },
      bed: { '@type': 'BedDetails', typeOfBed: room.beds },
      amenityFeature: room.amenities.map((name) => ({
        '@type': 'LocationFeatureSpecification',
        name,
        value: true,
      })),
      offers: {
        '@type': 'Offer',
        price: (lowestRate(room) / 100).toFixed(2),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: absolute('/aurelia/book/'),
      },
    },
  },

  render: ({ url }) => renderRoom(room, url),
}));

function renderRoom(room, url) {
  const others = rooms.filter((other) => other.slug !== room.slug);

  return `
<section class="page-head">
  <div class="shell">
    ${crumbs(
      [
        { label: 'Aurelia', href: '/aurelia/' },
        { label: 'Rooms', href: '/aurelia/rooms/' },
        { label: room.name, href: `/aurelia/rooms/${room.slug}/` },
      ],
      url,
    )}
    <p class="eyebrow">${esc(room.short)}</p>
    <h1 class="display-2 page-head__title">${esc(room.name)}</h1>
    <p class="lede page-head__lede">${esc(room.lede)}</p>
  </div>
</section>

<section class="section section--tight">
  <div class="shell">
    <div class="split">
      <div class="split__art split__art--arch">
        ${arch({ seed: `room-${room.slug}`, palette: ROOM_PALETTE[room.art] })}
      </div>
      <div class="split__body">
        <dl class="stats">
          <div><dt>Size</dt><dd>${room.size} sq ft</dd></div>
          <div><dt>Beds</dt><dd>${esc(room.beds)}</dd></div>
          <div><dt>View</dt><dd>${esc(room.view)}</dd></div>
          <div><dt>Sleeps</dt><dd>${room.sleeps}${
            room.maxGuests > room.sleeps ? ` (max ${room.maxGuests})` : ''
          }</dd></div>
        </dl>

        <p class="text-soft">${esc(room.detail)}</p>

        <ul class="tags">
          ${each(room.amenities, (amenity) => `<li>${esc(amenity)}</li>`)}
        </ul>

        <p class="room-card__rate" style="font-size:var(--step-3)">
          ${money(lowestRate(room))} <span>per night, from</span>
        </p>
        <a class="button" href="${esc(url('/aurelia/book/'))}">Check availability</a>
      </div>
    </div>
  </div>
</section>

<section class="section section--paper" aria-labelledby="in-the-room">
  <div class="shell">
    <div class="split split--reverse">
      <div class="split__art">
        ${horizon({ seed: `room-detail-${room.slug}`, palette: ROOM_PALETTE[room.art], ratio: 0.75 })}
      </div>
      <div class="split__body">
        <p class="eyebrow">In the room</p>
        <h2 class="display-2" id="in-the-room">What is actually in it.</h2>
        <ul class="feature-list">
          ${each(room.features, (feature) => `<li>${esc(feature)}</li>`)}
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="rate-heading">
  <div class="shell">
    <div class="section-head">
      <div>
        <p class="eyebrow">Rates</p>
        <h2 class="display-2" id="rate-heading">What it costs, by season.</h2>
      </div>
    </div>

    <table class="breakdown" style="max-width:38rem">
      <caption class="visually-hidden">${esc(room.name)} nightly rates by season</caption>
      <thead>
        <tr>
          <th scope="col">Season</th>
          <th scope="col">Midweek</th>
          <th scope="col">Fri &amp; Sat</th>
        </tr>
      </thead>
      <tbody>
        ${each(SEASONS, (season) => {
          const sample = sampleNight(season, false);
          const weekend = sampleNight(season, true);
          return `<tr>
            <td>${esc(season.label)}</td>
            <td>${money(nightlyRate(room, sample))}</td>
            <td>${money(nightlyRate(room, weekend))}</td>
          </tr>`;
        })}
      </tbody>
    </table>

    <p class="text-soft" style="font-size:var(--step--1);margin-top:var(--space-s);max-width:52rem">
      Plus a ${money(RATE_RULES.resortFee)} nightly facilities fee and
      ${(RATE_RULES.taxRate * 100).toFixed(2)}% county tax, both shown in every quote before
      you enter any details.
      ${
        room.maxGuests > room.sleeps
          ? `Additional guests beyond ${room.sleeps} are ${money(RATE_RULES.extraGuestFee)} per night.`
          : ''
      }
      Breakfast, sauna and parking are included.
    </p>
  </div>
</section>

<section class="section section--paper" aria-labelledby="other-rooms">
  <div class="shell">
    <div class="section-head">
      <div>
        <p class="eyebrow">Also here</p>
        <h2 class="display-2" id="other-rooms">The other rooms.</h2>
      </div>
    </div>
    <ul class="rooms" style="grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))">
      ${each(
        others,
        (other) => `<li class="room-card">
        <a href="${esc(url(`/aurelia/rooms/${other.slug}/`))}">
          <div class="room-card__art">
            ${arch({ seed: `room-${other.slug}`, palette: ROOM_PALETTE[other.art] })}
          </div>
          <div class="room-card__body">
            <h3 class="room-card__name">${esc(other.name)}</h3>
            <p class="room-card__meta"><span>${esc(other.beds)}</span>
              <span>${other.size} sq ft</span></p>
            <p class="room-card__rate">${money(lowestRate(other))}
              <span>per night, from</span></p>
          </div>
        </a>
      </li>`,
      )}
    </ul>
  </div>
</section>

${cta({
  url,
  title: `Look for a ${room.name.toLowerCase()}.`,
  body: `Live availability by night, with the whole price before you enter a single detail.`,
  seed: `cta-${room.slug}`,
})}
`;
}

/**
 * A representative date inside a season, used to print example rates.
 * Anchored to a fixed year so the published table is stable between builds.
 */
function sampleNight(season, weekend) {
  const month = season.months[Math.floor(season.months.length / 2)];
  for (let day = 1; day <= 28; day += 1) {
    const date = new Date(Date.UTC(2026, month, day, 12));
    const isWeekend = date.getUTCDay() === 5 || date.getUTCDay() === 6;
    if (isWeekend === weekend) return date.toISOString().slice(0, 10);
  }
  return `2026-${String(month + 1).padStart(2, '0')}-15`;
}
