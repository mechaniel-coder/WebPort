import { each, esc } from '../../../_lib/html.js';
import { brand, cloths, colourways, garments, money, stockFor } from '../../assets/data.js';
import { swatch } from '../../assets/textile.js';
import { modelNote } from '../../assets/fit.js';
import { colourChips, crumbs, sizeChoices, sizeTable } from '../../components.js';

/**
 * One page per garment, generated from the catalogue.
 */
export const pages = garments.map((garment) => {
  const cloth = cloths[garment.cloth];

  return {
    slug: garment.slug,
    meta: {
      title: garment.name,
      metaTitle: `${garment.name} — ${brand.name}`,
      description: `${garment.lede} Cut from ${cloth.name.toLowerCase()}, ${cloth.weight}, woven at ${cloth.mill}.`,
      styles: ['fit.css'],
      scripts: ['ui.js', 'bag-count.js', 'garment.js'],
      breadcrumbs: [
        { label: brand.name, href: '/vestra/' },
        { label: 'Shop', href: '/vestra/shop/' },
        { label: garment.name, href: `/vestra/shop/${garment.slug}/` },
      ],
      jsonld: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: garment.name,
        description: garment.lede,
        material: cloth.name,
        brand: { '@type': 'Brand', name: brand.name },
        offers: {
          '@type': 'Offer',
          price: (garment.price / 100).toFixed(2),
          priceCurrency: brand.currency,
          availability: 'https://schema.org/InStock',
        },
      },
    },

    render({ url }) {
      const stock = stockFor(garment.slug, garment.colours[0]);
      const inStock = Object.values(stock).filter((n) => n > 0).length;

      return `
<section class="page-head page-head--tight">
  <div class="shell">${crumbs(this.meta.breadcrumbs, url)}</div>
</section>

<section class="section section--tight">
  <div class="shell garment" data-garment="${esc(garment.slug)}">

    <div class="garment__cloth" data-reveal="clip">
      ${swatch({ cloth, title: `${cloth.name} — the cloth this garment is cut from`, scale: 0.5 })}
      <p class="garment__clothnote">
        <strong>${esc(cloth.name)}</strong> · ${esc(cloth.weight)} · ${esc(cloth.mill)}<br>
        <span class="muted">${esc(cloth.note)}</span>
      </p>
    </div>

    <div class="garment__detail">
      <p class="label">${esc(garment.category)}</p>
      <h1 class="h1" style="margin-top:var(--s-2xs)">${esc(garment.name)}</h1>
      <p class="garment__price figure">${esc(money(garment.price))}</p>
      <p class="lede" style="margin-top:var(--s-s)">${esc(garment.lede)}</p>

      <form class="garment__form" data-add-form>
        <fieldset>
          <legend class="label" style="margin-bottom:var(--s-xs)">Colour</legend>
          <div class="chips">${colourChips(garment)}</div>
        </fieldset>

        <fieldset style="margin-top:var(--s-m)">
          <legend class="label" style="margin-bottom:var(--s-xs)">
            Size <span class="garment__stock" data-stock>${inStock} of 6 in stock</span>
          </legend>
          <div class="sizes" data-sizes>${sizeChoices(garment, garment.colours[0])}</div>
          <p class="garment__fitlink">
            <a class="link-arrow" href="${esc(url('/vestra/fit/'))}">Which size am I?</a>
          </p>
        </fieldset>

        <p class="garment__status" data-add-status role="status"></p>

        <button class="btn btn--block" type="submit" data-add style="margin-top:var(--s-m)">
          Add to bag</button>

        <p class="garment__terms muted">
          ${brand.returnDays}-day returns, postage paid. Nothing on this site can
          actually be purchased.
        </p>
      </form>

      <div class="prose muted" style="margin-top:var(--s-l)">
        <p>${esc(garment.detail)}</p>
        ${modelNote(garment) ? `<p><strong>${esc(modelNote(garment))}</strong></p>` : ''}
      </div>

      <div style="margin-top:var(--s-l)">
        <p class="label">Care</p>
        <ul class="ticks">${each(garment.care, (c) => `<li>${esc(c)}</li>`)}</ul>
      </div>
    </div>
  </div>
</section>

<section class="section section--fill" aria-labelledby="grade-heading">
  <div class="shell shell--narrow">
    <p class="label">Measurements</p>
    <h2 class="h2" id="grade-heading" style="margin-top:var(--s-2xs)">The grade.</h2>
    <p class="muted" style="margin-top:var(--s-s)">
      This garment is cut with <strong>${
        garment.ease.bust !== undefined
          ? `${garment.ease.bust > 0 ? '+' : ''}${garment.ease.bust} cm of ease at the bust`
          : `${garment.ease.waist > 0 ? '+' : ''}${garment.ease.waist} cm of ease at the waist`
      }</strong> — ${esc(garment.cut.toLowerCase())}.
    </p>
    <div class="grade-scroll" data-scroll-region tabindex="0" role="region"
         aria-label="Size grade for ${esc(garment.name)}, scrollable"
         style="margin-top:var(--s-m)">
      ${sizeTable(garment)}
    </div>
  </div>
</section>
`;
    },
  };
});
