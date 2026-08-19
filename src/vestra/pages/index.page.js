import { each, esc } from '../../_lib/html.js';
import { brand, cloths, garments, looks } from '../assets/data.js';
import { swatch } from '../assets/textile.js';
import { cta, garmentGrid, sectionHead } from '../components.js';

export const meta = {
  title: 'Ready-to-wear',
  metaTitle: `${brand.name} — ${brand.tagline}`,
  description: `A small ready-to-wear label working in mill-finished natural cloth.
    Nine styles a season, graded across six sizes, made in Porto.`,
  priority: 1.0,
  scripts: ['ui.js', 'bag-count.js', 'hero.js'],
};

export function render({ url }) {
  const hero = cloths['wool-flannel'];
  const featured = [...garments].sort((a, b) => a.featured - b.featured).slice(0, 3);

  return `
<section class="hero">
  <!-- The cloth is simulated, and it is decoration: the gradient behind it is a
       complete hero on its own, so a device without canvas loses atmosphere and
       nothing else. aria-hidden because "a length of grey flannel moving" is not
       information a screen-reader user can act on. -->
  <canvas class="hero__cloth" data-drape aria-hidden="true"
          data-weave="${esc(hero.weave)}" data-warp="${esc(hero.warp)}"
          data-weft="${esc(hero.weft)}"></canvas>

  <div class="hero__inner">
    <h1 class="display" data-reveal="lines" data-stagger="0.09">Cloth first,<br>then the cut.</h1>
    <p class="label hero__label" data-reveal data-delay="0.3">${esc(brand.city)} · Since ${brand.founded}</p>
    <p class="lede" data-reveal data-delay="0.34" style="margin-top:var(--s-m)">
      ${esc(brand.lede)}</p>
    <div class="hero__actions" data-reveal data-delay="0.46">
      <a class="btn" href="${esc(url('/vestra/shop/'))}">See the collection</a>
      <a class="btn btn--ghost" href="${esc(url('/vestra/fit/'))}">Find your size</a>
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="shell split grid">
    <div>
      <h2 class="h2" data-reveal="lines" data-stagger="0.06"
          style="margin-top:var(--s-2xs)">We buy the cloth before we draw the garment.</h2>
      <div class="prose muted" style="margin-top:var(--s-m);max-width:46ch">
        <p>Nine styles a season, from six cloths, bought from mills we have visited.
          The cloth decides what the garment can be — a 420 gsm flannel will hold a
          volume that a 110 gsm crepe cannot, and pretending otherwise is how clothes
          end up looking like their photographs and not like themselves.</p>
        <p>Everything is graded across six sizes on one consistent rule, and every
          measurement is published. Not the body we imagine you have — the garment,
          flat, as the tape reads it.</p>
      </div>
      <p style="margin-top:var(--s-m)">
        <a class="link-arrow" href="${esc(url('/vestra/atelier/'))}">How it is made</a>
      </p>
    </div>
    <div data-reveal="clip">
      ${swatch({ cloth: cloths['herringbone-tweed'], title: 'Herringbone tweed, woven at 480 gsm', scale: 0.5 })}
    </div>
  </div>
</section>

<section class="section section--fill" aria-labelledby="cloth-heading">
  <div class="shell">
    ${sectionHead({
      title: 'Six cloths, and what each one will do.',
      link: { href: '/vestra/cloth/', label: 'All six' },
      id: 'cloth-heading',
      u: url,
    })}
    <ul class="cloth-row" data-reveal data-stagger="0.08">
      ${each(
        Object.entries(cloths).slice(0, 3),
        ([key, cloth]) => `<li class="cloth-card">
        <a href="${esc(url(`/vestra/cloth/#${key}`))}">
          ${swatch({ cloth, scale: 0.5 })}
          <p class="cloth-card__name">${esc(cloth.name)}</p>
          <p class="cloth-card__meta">${esc(cloth.weight)} · ${esc(cloth.mill)}</p>
        </a>
      </li>`,
      )}
    </ul>
  </div>
</section>

<section class="section" aria-labelledby="shop-heading">
  <div class="shell">
    ${sectionHead({
      label: 'The collection',
      title: 'Three of nine.',
      link: { href: '/vestra/shop/', label: 'Everything' },
      id: 'shop-heading',
      u: url,
    })}
    ${garmentGrid(featured, url)}
  </div>
</section>

<section class="section section--tight" aria-labelledby="look-heading">
  <div class="shell">
    ${sectionHead({
      label: 'Lookbook',
      title: 'Worn together.',
      link: { href: '/vestra/lookbook/', label: 'All looks' },
      id: 'look-heading',
      u: url,
    })}
    <ul class="look-row" data-reveal data-stagger="0.08">
      ${each(
        looks,
        (look) => `<li class="look-card">
        <a href="${esc(url(`/vestra/lookbook/${look.slug}/`))}">
          <span class="look-card__index">${esc(look.index)}</span>
          <span class="look-card__name">${esc(look.name)}</span>
          <span class="look-card__lede">${esc(look.lede)}</span>
          <span class="look-card__season">${esc(look.season)}</span>
        </a>
      </li>`,
      )}
    </ul>
  </div>
</section>

${cta({
  title: 'Sizing is a decision, not a label.',
  body: `Tell us four measurements and we will tell you which size this collection
    was cut for you in — and where it will sit differently from how it is drawn.`,
  href: '/vestra/fit/',
  label: 'Find your size',
  u: url,
})}
`;
}
