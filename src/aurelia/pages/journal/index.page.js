import { dateParts, each, esc } from '../../../_lib/html.js';
import { journal } from '../../data.js';
import { JOURNAL_PALETTE, horizon } from '../../art.js';
import { cta, pageHead } from '../../components.js';

export const meta = {
  title: 'Journal',
  description: `Writing from the bluff — why winter is the better season here, where the
    oysters come from, and what to stop for on the four miles of trail north.`,
  scripts: ['ui.js'],
  breadcrumbs: [
    { label: 'Aurelia', href: '/aurelia/' },
    { label: 'Journal', href: '/aurelia/journal/' },
  ],
};

export function render({ url }) {
  return `
${pageHead({
  title: 'Notes from the bluff.',
  lede: `Occasional writing about the coast, the kitchen and the seasons — mostly by people
    who work here and have strong opinions about the weather.`,
  trail: meta.breadcrumbs,
  url,
})}

<section class="section">
  <div class="shell">
    <ul class="posts">
      ${each(journal, (post) => {
        const date = dateParts(post.published);
        return `<li class="post-card">
        <a href="${esc(url(`/aurelia/journal/${post.slug}/`))}">
          <div class="post-card__frame">
            ${horizon({
              seed: `post-${post.slug}`,
              palette: JOURNAL_PALETTE[post.art] || 'fog',
              ratio: 0.75,
            })}
          </div>
          <p class="post-card__meta">
            ${esc(post.section)} ·
            <time datetime="${esc(date.iso)}">${esc(date.label)}</time>
          </p>
          <h2 class="post-card__title">${esc(post.title)}</h2>
          <p class="post-card__excerpt">${esc(post.excerpt)}</p>
        </a>
      </li>`;
      })}
    </ul>
  </div>
</section>

${cta({
  url,
  title: 'Read the winter one, then book February.',
  seed: 'journal-cta',
})}
`;
}
