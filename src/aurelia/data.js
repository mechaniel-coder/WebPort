/**
 * Aurelia content model.
 *
 * Everything the site renders — rooms, rates, menus, experiences, journal — is
 * defined here so pages stay presentational and the booking engine has a single
 * source of truth it can share with the server-rendered pages.
 *
 * All money is in cents to keep the arithmetic exact.
 */

export const hotel = {
  name: 'Aurelia',
  legalName: 'Aurelia Coast Retreat',
  tagline: 'A twenty-two room retreat on the northern Sonoma coast.',
  address: {
    street: '4180 Shoreline Highway',
    locality: 'Sea Ranch',
    region: 'CA',
    postalCode: '95497',
    country: 'US',
  },
  geo: { lat: 38.7096, lng: -123.4569 },
  phone: '+1 (707) 555-0142',
  email: 'stay@example.com',
  checkIn: '16:00',
  checkOut: '11:00',
  rooms: 22,
  opened: 1974,
  restored: 2019,
};

/* ── Rooms ─────────────────────────────────────────────────────────────────── */

export const rooms = [
  {
    slug: 'dune-suite',
    name: 'Dune Suite',
    short: 'Ocean-facing, private terrace',
    baseRate: 68500,
    size: 620,
    sleeps: 2,
    maxGuests: 3,
    beds: 'One king',
    view: 'Open ocean',
    count: 8,
    art: 'dune',
    lede: `The rooms everyone means when they say they stayed at Aurelia. A single long
      window frames nothing but water, and the terrace sits close enough to the bluff edge
      that the sound of the surf never really stops.`,
    detail: `Built into the original 1974 wing and stripped back to its Douglas fir frame in
      the 2019 restoration. The bed faces the window rather than the door — a deliberate
      inversion that costs a little wall space and buys the entire view from where you
      actually spend the night.`,
    features: [
      'Private terrace with two lounge chairs and a gas fire bowl',
      'Douglas fir ceiling and exposed original framing',
      'Soaking tub positioned to the ocean window',
      'Marshall speaker, no television',
      'Filtered coffee, local tea, and a decanter of house amaro',
    ],
    amenities: ['Ocean view', 'Terrace', 'Soaking tub', 'Fireplace', 'Rain shower'],
  },
  {
    slug: 'cliff-house',
    name: 'Cliff House',
    short: 'Two bedrooms, private garden',
    baseRate: 115000,
    size: 1100,
    sleeps: 4,
    maxGuests: 5,
    beds: 'One king, one queen',
    view: 'Ocean and headland',
    count: 3,
    art: 'cliff',
    lede: `A freestanding two-bedroom house at the northern end of the property, with a
      walled garden that stays warm on days the bluff does not.`,
    detail: `The Cliff Houses were the caretaker's cottages before the restoration. They keep
      their original stone hearths and low doorways, and they are the only rooms at Aurelia
      with a kitchen — small, well equipped, and stocked on request from the farm list.`,
    features: [
      'Walled garden with outdoor shower and dining table for six',
      'Original 1974 stone hearth, wood supplied daily',
      'Full kitchen with a Lacanche range',
      'Separate sitting room with a library of coast and food writing',
      'Two bathrooms, one with a freestanding tub',
    ],
    amenities: ['Ocean view', 'Private garden', 'Kitchen', 'Wood fireplace', 'Two bathrooms'],
  },
  {
    slug: 'garden-room',
    name: 'Garden Room',
    short: 'Courtyard-facing, quiet side',
    baseRate: 44500,
    size: 410,
    sleeps: 2,
    maxGuests: 2,
    beds: 'One queen',
    view: 'Cypress courtyard',
    count: 11,
    art: 'garden',
    lede: `Set around the cypress courtyard on the sheltered side of the property. No ocean
      from the window — but the courtyard is where most of Aurelia actually happens.`,
    detail: `The Garden Rooms are the smallest and the quietest, tucked behind the windbreak
      the original owners planted in the seventies. They open onto the courtyard where
      breakfast is served, the sauna sits, and the evening fire is lit at dusk.`,
    features: [
      'French doors onto the cypress courtyard',
      'Deep window seat built into the original framing',
      'Rain shower in honed limestone',
      'Wool throws from a mill in Petaluma',
      'Steps from the sauna and cold plunge',
    ],
    amenities: ['Courtyard', 'Window seat', 'Rain shower', 'Sauna access', 'Quiet wing'],
  },
];

export const roomBySlug = Object.fromEntries(rooms.map((room) => [room.slug, room]));

/* ── Rates ─────────────────────────────────────────────────────────────────── */

/**
 * Rate rules live in assets/rates.js — the one module both the build and the
 * browser import — and are re-exported here only so page modules have a single
 * obvious place to look. Defining them twice would let the published rate table
 * drift away from the price the booking engine actually quotes.
 */
import { RULES } from './assets/rates.js';

export { SEASONS, RULES as RATE_RULES } from './assets/rates.js';

/* ── Dining ────────────────────────────────────────────────────────────────── */

export const restaurant = {
  name: 'Salt & Ember',
  lede: `Twenty-eight seats, one seating a night, and a menu that is written the morning it
    is served.`,
  chef: 'Ines Okafor',
  service: [
    { label: 'Breakfast', detail: 'Courtyard, 7:30–10:30, included for all guests' },
    { label: 'Dinner', detail: 'One seating at 19:00, Wednesday to Sunday' },
    { label: 'Cellar', detail: 'Tastings at 17:00, Friday and Saturday' },
  ],
};

export const menus = [
  {
    id: 'dinner',
    name: 'Dinner',
    note: 'Five courses, $145. Written each morning; this is a recent evening.',
    courses: [
      {
        name: 'To begin',
        dishes: [
          { name: 'Kumamoto oysters', detail: 'Bull kelp mignonette, frozen buttermilk' },
          { name: 'Grilled bread', detail: 'Cultured butter, smoked sea salt' },
        ],
      },
      {
        name: 'Cold',
        dishes: [
          { name: 'Halibut crudo', detail: 'Green almond, fennel pollen, lemon verbena' },
          { name: 'Bitter leaves', detail: 'Persimmon, aged sheep cheese, walnut' },
        ],
      },
      {
        name: 'Fire',
        dishes: [
          { name: 'Whole rockfish', detail: 'Grilled over madrone, salsa verde' },
          { name: 'Point Reyes lamb', detail: 'Charred allium, sea beans, black garlic' },
        ],
      },
      {
        name: 'To end',
        dishes: [
          { name: 'Bay laurel custard', detail: 'Honeycomb, olive oil' },
          { name: 'Quince and brown butter tart', detail: 'Crème fraîche' },
        ],
      },
    ],
  },
  {
    id: 'breakfast',
    name: 'Breakfast',
    note: 'Served in the courtyard, included with every room.',
    courses: [
      {
        name: 'From the kitchen',
        dishes: [
          { name: 'Soft eggs', detail: 'Cultured butter, chives, sourdough soldiers' },
          { name: 'Buckwheat porridge', detail: 'Toasted hazelnut, pear, raw honey' },
          { name: 'Smoked black cod', detail: 'Potato, dill, soft-boiled egg' },
        ],
      },
      {
        name: 'Always on the table',
        dishes: [
          { name: 'Yesterday’s bread', detail: 'Preserves from the courtyard fruit' },
          { name: 'Coffee', detail: 'Roasted for us in Sebastopol' },
        ],
      },
    ],
  },
];

/* ── Experiences ───────────────────────────────────────────────────────────── */

export const experiences = [
  {
    slug: 'tide-pools',
    name: 'Low-tide walk',
    duration: '2 hours',
    price: 0,
    season: 'Year round, tide dependent',
    art: 'tide',
    summary: `Walked with Ren, who has been counting the sea stars on this stretch of reef
      for eleven years and can tell you which ones came back after the die-off.`,
  },
  {
    slug: 'kelp-kayak',
    name: 'Kelp forest paddle',
    duration: '3 hours',
    price: 14500,
    season: 'May to October',
    art: 'kelp',
    summary: `Out through the gap at slack water and north along the kelp line. Otters most
      mornings, whales in the spring if the timing is kind.`,
  },
  {
    slug: 'cellar',
    name: 'Cellar tasting',
    duration: '90 minutes',
    price: 8500,
    season: 'Friday and Saturday, 17:00',
    art: 'cellar',
    summary: `Six pours from the coastal ridges above us — the cold, difficult vineyards that
      make the wine this coast is quietly good at.`,
  },
  {
    slug: 'bread',
    name: 'Bread morning',
    duration: '4 hours',
    price: 12500,
    season: 'Saturdays',
    art: 'bread',
    summary: `Start the levain at seven, shape at nine, eat at eleven. You go home with a
      culture and the confidence to keep it alive.`,
  },
  {
    slug: 'sauna',
    name: 'Sauna and cold plunge',
    duration: 'Open 15:00–21:00',
    price: 0,
    season: 'Year round',
    art: 'sauna',
    summary: `Cedar sauna in the courtyard, plunge tub fed from the well, and a bench facing
      the windbreak for the part in between.`,
  },
  {
    slug: 'forage',
    name: 'Coastal forage',
    duration: '3 hours',
    price: 9500,
    season: 'November to April',
    art: 'forage',
    summary: `Sea beans, wild mustard, miner's lettuce and — in a good winter — the candy cap
      mushrooms that end up in the custard at dinner.`,
  },
];

/* ── Journal ───────────────────────────────────────────────────────────────── */

export const journal = [
  {
    slug: 'the-case-for-winter',
    title: 'The case for winter on this coast',
    published: '2026-01-18',
    section: 'Seasons',
    art: 'winter',
    excerpt: `Everyone comes in August. The coast is arguably better in February, and it is
      certainly more itself.`,
    body: [
      { type: 'p', text: `The northern Sonoma coast has a reputation problem in winter, and it is mostly a misunderstanding about fog.` },
      { type: 'p', text: `Summer here is the foggy season. Cold water upwells along the shelf, warm inland air draws across it, and the result sits on the bluff from June to August like a wet sheet. Visitors book August expecting California and get a grey ceiling at forty yards. It lifts by two most days, and by then half the afternoon is gone.` },
      { type: 'h2', text: 'What February actually looks like' },
      { type: 'p', text: `Winter storms arrive, dump, and leave. The days between them are the clearest of the year — the kind of visibility where you can pick out the Farallones from the bluff trail, which is a hundred kilometres of sightline. The light comes in low and stays gold for most of the afternoon rather than the twenty minutes you get in July.` },
      { type: 'quote', text: `The best week I have had in eleven years here was the second week of January. Nobody believes me.`, cite: 'Ren, who leads the tide-pool walks' },
      { type: 'p', text: `The wildlife calendar is also better. Grey whales pass south through December and north again from February, close enough to the shelf to watch from the terrace with a coffee. The elephant seals haul out at the point in January. The tide pools are at their fullest in the winter minus tides, which fall in daylight rather than at four in the morning.` },
      { type: 'h2', text: 'The practical part' },
      { type: 'p', text: `Rooms are roughly a third less than August. The restaurant takes reservations the same week rather than the same month. The bluff trail is empty, and the fire in the courtyard is lit every night from November because it needs to be.` },
      { type: 'p', text: `Bring a real coat. The wind is the honest inconvenience of the season and no amount of writing about golden light will change it.` },
    ],
  },
  {
    slug: 'where-the-oysters-come-from',
    title: 'Where the oysters come from',
    published: '2025-11-04',
    section: 'Kitchen',
    art: 'oyster',
    excerpt: `Forty minutes north, in a bay that freezes the hands of everyone who works it.
      A morning with the people who grow what we open at seven.`,
    body: [
      { type: 'p', text: `The oysters at dinner travel less far than most of the staff. They are grown in a shallow bay forty minutes north, on racks that go under at high water and sit in the wind at low.` },
      { type: 'p', text: `We drove up at five to see a harvest, which is the only honest way to write about it.` },
      { type: 'h2', text: 'Cold, and then colder' },
      { type: 'p', text: `Harvest happens at the bottom of the tide, which in November means the dark. Four people work a rack line in chest waders, flipping bags, culling the undersized back into the water, and stacking the rest into crates that come off the flats on a sled.` },
      { type: 'p', text: `Nobody talks much. The water is nine degrees and the wind comes straight down the bay.` },
      { type: 'quote', text: `People think it is farming. It is closer to unloading a lorry, in the sea, in the dark, for four hours.`, cite: 'Marta, who has run the lease since 2011' },
      { type: 'h2', text: 'Why they taste the way they do' },
      { type: 'p', text: `The bay is fed by a river at one end and the open Pacific at the other, so salinity swings with the season. Autumn oysters, after the summer has concentrated the bay, are the saltiest and the firmest. Spring oysters are softer and sweeter and worse for the mignonette, which is why the recipe changes in March.` },
      { type: 'p', text: `That is the whole argument for buying from forty minutes away rather than from a distributor. Not provenance as decoration — just the ability to change what you do in the kitchen because you know what happened in the bay that week.` },
    ],
  },
  {
    slug: 'field-guide-bluff-trail',
    title: 'A field guide to the bluff trail',
    published: '2025-09-22',
    section: 'Coast',
    art: 'trail',
    excerpt: `Four miles, one gate, and about six things worth stopping for. What to look at
      between the front door and the point.`,
    body: [
      { type: 'p', text: `The bluff trail starts at the gate past the Cliff Houses and runs four miles north to the point. It is flat, it is unshaded, and it takes most people a little over two hours with the stops. These are the stops.` },
      { type: 'h2', text: 'The first half mile' },
      { type: 'p', text: `Coastal prairie, which is a polite name for grass that has been sculpted by wind into something closer to a haircut. Look for the bush lupine that flowers violently blue in April and looks dead for the rest of the year. It is not dead.` },
      { type: 'h2', text: 'The reef' },
      { type: 'p', text: `At a mile the trail passes above the reef where the tide-pool walks go. From the top you can read the whole structure — the surge channels running perpendicular to the shore, the flat mid-tide bench, the deep pools at the outer edge that only clear at a minus tide.` },
      { type: 'h2', text: 'The cypress row' },
      { type: 'p', text: `Planted as a windbreak by a rancher in the twenties and now the most photographed thing on the property that we did not plant. They lean uniformly inland at about fifteen degrees, which is a fairly precise record of the prevailing wind.` },
      { type: 'h2', text: 'The point' },
      { type: 'p', text: `Elephant seals from December, cormorants year round on the stack, and the best whale-watching angle on this stretch because the shelf comes close in. Turn around here — the trail continues but crosses onto land that is not ours to send you across.` },
    ],
  },
];

export const journalBySlug = Object.fromEntries(journal.map((post) => [post.slug, post]));

/* ── Story ─────────────────────────────────────────────────────────────────── */

export const timeline = [
  {
    year: '1974',
    title: 'Built as a family compound',
    text: `An architect from Berkeley builds eleven rooms and two caretaker cottages into the
      bluff, using Douglas fir milled twenty miles inland and stone from the site.`,
  },
  {
    year: '1989',
    title: 'The first hotel',
    text: `The family opens it to guests, more or less by accident, after a decade of letting
      friends stay. Nothing is changed except the addition of a kitchen.`,
  },
  {
    year: '2016',
    title: 'Closed',
    text: `Thirty years of salt air have done what salt air does. The property closes with the
      framing sound and almost nothing else.`,
  },
  {
    year: '2019',
    title: 'Restored, not replaced',
    text: `Reopened with twenty-two rooms. Every original frame that could be saved was saved;
      the rest was rebuilt in the same fir, from the same mill, which is still running.`,
  },
];

export const values = [
  {
    title: 'One seating',
    text: `The restaurant serves twenty-eight people once a night. It is the only way a kitchen
      this size can cook the menu it wants to cook.`,
  },
  {
    title: 'No televisions',
    text: `Not a statement about screens — just that every room faces something better, and a
      wall-mounted panel would be the only thing in the room that was not made nearby.`,
  },
  {
    title: 'Staffed properly',
    text: `Forty-one people for twenty-two rooms, all salaried, no tipping. It is priced into
      the room rate, which is why the room rate is what it is.`,
  },
];

/* ── FAQ ───────────────────────────────────────────────────────────────────── */

export const faqs = [
  {
    question: 'What time is check-in and check-out?',
    answer: `Check-in is from ${hotel.checkIn}, check-out is ${hotel.checkOut}. Arrive earlier
      and we will take your bags and point you at the courtyard or the bluff trail.`,
  },
  {
    question: 'Is there a minimum stay?',
    answer: `Two nights on Friday and Saturday between June and September. Single nights are
      available every other night of the year.`,
  },
  {
    question: 'What is the cancellation policy?',
    answer: `Cancel more than ${RULES.cancellationDays} days before arrival for a full
      refund. Inside that window the first night is charged.`,
  },
  {
    question: 'Are children welcome?',
    answer: `Yes, in the Cliff Houses, which have the space and the second bathroom. The
      restaurant seats children at the 19:00 service.`,
  },
  {
    question: 'Can we bring a dog?',
    answer: `One dog per Cliff House, no charge. The bluff trail is a working conservation
      easement, so dogs stay leashed on it.`,
  },
  {
    question: 'How do we get there?',
    answer: `Two and a half hours from San Francisco on Highway 1, or ninety minutes from
      Santa Rosa. The last forty minutes have no cell service — download the directions.`,
  },
];
