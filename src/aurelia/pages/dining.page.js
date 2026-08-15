import { each, esc } from '../../_lib/html.js';
import { absolute } from '../../_lib/html.js';
import { hotel, menus, restaurant } from '../data.js';
import { horizon, vignette } from '../art.js';
import { cta, pageHead } from '../components.js';

export const meta = {
  title: 'Dining',
  metaTitle: 'Salt & Ember — dining at Aurelia',
  description: `Twenty-eight seats, one seating a night, and a menu written the morning it is
    served. Dinner Wednesday to Sunday, breakfast in the courtyard every day.`,
  scripts: ['ui.js'],
  breadcrumbs: [
    { label: 'Aurelia', href: '/aurelia/' },
    { label: 'Dining', href: '/aurelia/dining/' },
  ],
  jsonld: {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    description: restaurant.lede,
    url: absolute('/aurelia/dining/'),
    servesCuisine: 'Californian coastal',
    priceRange: '$$$',
    acceptsReservations: true,
    telephone: hotel.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: hotel.address.street,
      addressLocality: hotel.address.locality,
      addressRegion: hotel.address.region,
      postalCode: hotel.address.postalCode,
      addressCountry: hotel.address.country,
    },
  },
};

export function render({ url }) {
  return `
${pageHead({
  eyebrow: 'Salt & Ember',
  title: 'One seating. Twenty-eight people.',
  lede: restaurant.lede,
  trail: meta.breadcrumbs,
  url,
})}

<section class="section section--tight">
  <div class="shell">
    <div class="split">
      <div class="split__body">
        <p class="eyebrow">The kitchen</p>
        <h2 class="display-2">Written after the deliveries.</h2>
        <p class="text-soft">${esc(restaurant.chef)} cooks a five-course menu that is decided
          in the morning and printed in the afternoon. There is no à la carte, no substitution
          beyond genuine dietary need, and no second seating — the kitchen cooks one service
          and then stops.</p>
        <p class="text-soft">Almost everything arrives from within sixty miles. The oysters
          come from a bay forty minutes north, the lamb from the ridge behind us, and the
          bread is started the night before in the same oven that fires the fish.</p>
        <ul class="feature-list">
          ${each(
            restaurant.service,
            (item) => `<li><strong>${esc(item.label)}</strong> — ${esc(item.detail)}</li>`,
          )}
        </ul>
      </div>
      <div class="split__art">
        ${horizon({ seed: 'dining-room', palette: 'dusk', ratio: 0.75 })}
      </div>
    </div>
  </div>
</section>

<section class="section section--paper" aria-labelledby="menus-heading">
  <div class="shell shell--narrow">
    <div class="section-head">
      <div>
        <p class="eyebrow">Menus</p>
        <h2 class="display-2" id="menus-heading">A recent week.</h2>
      </div>
    </div>

    <div class="menu-tabs" role="tablist" aria-label="Menus">
      ${each(
        menus,
        (menu, index) => `<button role="tab" type="button"
        id="tab-${esc(menu.id)}"
        aria-controls="panel-${esc(menu.id)}"
        aria-selected="${index === 0}"
        tabindex="${index === 0 ? '0' : '-1'}">${esc(menu.name)}</button>`,
      )}
    </div>

    ${each(
      menus,
      (menu, index) => `<div role="tabpanel"
      id="panel-${esc(menu.id)}"
      aria-labelledby="tab-${esc(menu.id)}"
      tabindex="0"
      ${index === 0 ? '' : 'hidden'}>
      <p class="text-soft" style="margin-bottom:var(--space-l)">${esc(menu.note)}</p>
      ${each(
        menu.courses,
        (course) => `<section class="menu-course">
        <h3 class="menu-course__name">${esc(course.name)}</h3>
        ${each(
          course.dishes,
          (dish) => `<div class="dish">
          <p class="dish__name">${esc(dish.name)}</p>
          <p class="dish__detail">${esc(dish.detail)}</p>
        </div>`,
        )}
      </section>`,
      )}
    </div>`,
    )}
  </div>
</section>

<section class="section" aria-labelledby="cellar-heading">
  <div class="shell">
    <div class="split split--reverse">
      <div class="split__art" style="aspect-ratio:1;border-radius:50%;max-width:22rem">
        ${vignette({ seed: 'dining-cellar', palette: 'dusk', motif: 'glass' })}
      </div>
      <div class="split__body">
        <p class="eyebrow">The cellar</p>
        <h2 class="display-2" id="cellar-heading">Cold, difficult vineyards.</h2>
        <p class="text-soft">The list is almost entirely from the coastal ridges within an
          hour of here — the marginal, fog-bound sites that struggle in a way that turns out
          to suit pinot noir and chardonnay very well.</p>
        <p class="text-soft">Tastings run at 17:00 on Friday and Saturday: six pours, ninety
          minutes, and an argument about whether the 2019s were better than the 2021s.</p>
        <a class="link-arrow" href="${esc(url('/aurelia/experiences/'))}">Book a tasting</a>
      </div>
    </div>
  </div>
</section>

${cta({
  url,
  title: 'Dinner is included in the booking.',
  body: 'Reserve a room and the 19:00 seating is offered at checkout — it is the only way to get a table.',
  seed: 'dining-cta',
})}
`;
}
