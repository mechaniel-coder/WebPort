import { each, esc } from '../../_lib/html.js';
import { experiences, hotel, journal, restaurant, rooms } from '../data.js';
import { EXPERIENCE_ART, ROOM_PALETTE, arch, cypressRow, horizon, vignette } from '../art.js';
import { lowestRate, money } from '../assets/rates.js';
import { cta, sectionHead } from '../components.js';

export const meta = {
  title: 'A coastal retreat',
  metaTitle: 'Aurelia — a coastal retreat on the northern Sonoma coast',
  description: `A twenty-two room retreat on the northern Sonoma coast. Ocean-facing rooms,
    one seating a night at Salt & Ember, and four miles of bluff trail.`,
  priority: 1.0,
  scripts: ['ui.js', 'hero.js'],
};

export function render({ url }) {
  return `
<section class="hero">
  <!-- The canvas is decoration layered over a CSS gradient that is itself a
       complete design. If WebGL is unavailable the canvas hides itself and the
       gradient is what remains, so nothing here is load-bearing. That is why it
       is aria-hidden rather than given a label: describing generated water to a
       screen-reader user tells them nothing they can act on, and the prose
       below already says where the hotel is. -->
  <canvas class="hero__surface" data-caustics aria-hidden="true"></canvas>

  <div class="hero__inner">
    <p class="eyebrow">${esc(hotel.address.locality)}, California</p>
    <h1 class="display-1 hero__title" data-reveal="lines" data-stagger="0.09">
      The coast,<br>and very little else.</h1>
    <p class="hero__lede" data-reveal data-delay="0.35">${esc(hotel.tagline)} Built into the
      bluff in 1974, taken back to its frame in 2019, and run by forty-one people for
      twenty-two rooms.</p>
    <div class="hero__actions" data-reveal data-delay="0.5">
      <a class="button" href="${esc(url('/aurelia/book/'))}">Check availability</a>
      <a class="button button--ghost" href="${esc(url('/aurelia/rooms/'))}">See the rooms</a>
    </div>
  </div>

  <p class="hero__scroll" aria-hidden="true"><span>Scroll</span></p>
</section>

<section class="section section--tight">
  <div class="shell">
    <div class="split">
      <div class="split__body">
        <p class="eyebrow">The property</p>
        <h2 class="display-2" data-reveal="lines" data-stagger="0.07">Ninety minutes past the last coffee shop.</h2>
        <p class="text-soft">Aurelia sits on a mile of bluff between Highway 1 and the open
          Pacific, at the point where the road stops pretending to be convenient. There is no
          town attached to it. That is more or less the entire proposition.</p>
        <p class="text-soft">Twenty-two rooms across three buildings and a walled courtyard,
          a restaurant that serves twenty-eight people once a night, a cedar sauna, and four
          miles of trail that ends at a headland full of elephant seals.</p>
        <a class="link-arrow" href="${esc(url('/aurelia/story/'))}">How it got here</a>
      </div>
      <div class="split__art split__art--arch" data-reveal="clip">
        ${arch({ seed: 'aurelia-intro', palette: 'noon' })}
      </div>
    </div>
  </div>
</section>

<section class="section section--paper" aria-labelledby="rooms-heading">
  <div class="shell">
    ${sectionHead({
      eyebrow: 'Rooms',
      title: 'Three kinds of room, all facing something.',
      link: { href: '/aurelia/rooms/', label: 'All rooms and rates' },
      id: 'rooms-heading',
      url,
    })}

    <ul class="rooms" data-reveal data-stagger="0.09">
      ${each(
        rooms,
        (room) => `<li class="room-card">
        <a href="${esc(url(`/aurelia/rooms/${room.slug}/`))}">
          <div class="room-card__art">
            ${arch({ seed: `room-${room.slug}`, palette: ROOM_PALETTE[room.art] })}
          </div>
          <div class="room-card__body">
            <h3 class="room-card__name">${esc(room.name)}</h3>
            <p class="room-card__meta">
              <span>${esc(room.beds)}</span><span>${room.size} sq ft</span>
              <span>Sleeps ${room.sleeps}</span>
            </p>
            <p class="room-card__rate">${money(lowestRate(room))}
              <span>per night, from</span></p>
          </div>
        </a>
      </li>`,
      )}
    </ul>
  </div>
</section>

<section class="section" aria-labelledby="dining-heading">
  <div class="shell">
    <div class="split split--reverse">
      <div class="split__art" data-reveal="clip">
        ${horizon({ seed: 'dining-home', palette: 'dusk', ratio: 0.75 })}
      </div>
      <div class="split__body">
        <p class="eyebrow">Dining</p>
        <h2 class="display-2" id="dining-heading" data-reveal="lines" data-stagger="0.07">${esc(restaurant.name)}</h2>
        <p class="text-soft">${esc(restaurant.lede)} Ines Okafor cooks what came out of the
          water and off the ridge that day, which means the menu is written after the
          deliveries and printed before service.</p>
        <ul class="feature-list" data-reveal data-stagger="0.06">
          ${each(
            restaurant.service,
            (item) => `<li><strong>${esc(item.label)}</strong> — ${esc(item.detail)}</li>`,
          )}
        </ul>
        <a class="link-arrow" href="${esc(url('/aurelia/dining/'))}">Read the menu</a>
      </div>
    </div>
  </div>
</section>

${cypressRow({ className: 'cypress-rule' })}

<section class="section section--paper" aria-labelledby="experiences-heading">
  <div class="shell">
    ${sectionHead({
      eyebrow: 'Experiences',
      title: 'Things to do that are not sitting down.',
      link: { href: '/aurelia/experiences/', label: 'All experiences' },
      id: 'experiences-heading',
      url,
    })}

    <ul class="experiences" data-reveal data-stagger="0.09">
      ${each(
        experiences.slice(0, 3),
        (item) => `<li class="experience">
        <div class="experience__art">
          ${vignette({ seed: `exp-${item.slug}`, ...EXPERIENCE_ART[item.art] })}
        </div>
        <h3 class="experience__name">${esc(item.name)}</h3>
        <p class="experience__meta">
          <span>${esc(item.duration)}</span>
          <span>${item.price ? money(item.price) : 'Included'}</span>
        </p>
        <p class="text-soft">${esc(item.summary)}</p>
      </li>`,
      )}
    </ul>
  </div>
</section>

<section class="section" aria-labelledby="journal-heading">
  <div class="shell">
    ${sectionHead({
      eyebrow: 'Journal',
      title: 'Notes from the bluff.',
      link: { href: '/aurelia/journal/', label: 'All writing' },
      id: 'journal-heading',
      url,
    })}

    <ul class="posts" data-reveal data-stagger="0.09">
      ${each(
        journal,
        (post) => `<li class="post-card">
        <a href="${esc(url(`/aurelia/journal/${post.slug}/`))}">
          <div class="post-card__frame">
            ${horizon({ seed: `post-${post.slug}`, palette: 'fog', ratio: 0.75 })}
          </div>
          <p class="post-card__meta">${esc(post.section)}</p>
          <h3 class="post-card__title">${esc(post.title)}</h3>
          <p class="post-card__excerpt">${esc(post.excerpt)}</p>
        </a>
      </li>`,
      )}
    </ul>
  </div>
</section>

${cta({
  url,
  title: 'Winter is the good season.',
  body: 'Clearer days, whales off the shelf, and about a third off the summer rate.',
  seed: 'home-cta',
})}
`;
}
