import { dateParts, each, esc } from '../../_lib/html.js';
import { changelog } from '../data.js';
import { cta, pageHead } from '../components.js';

export const meta = {
  title: 'Changelog',
  description: `What shipped, when. Private data regions, NWQL joins across signals, tail
    sampling policies and SCIM provisioning — the last four releases in full.`,
  scripts: ['ui.js'],
  breadcrumbs: [
    { label: 'Northwind', href: '/northwind/' },
    { label: 'Changelog', href: '/northwind/changelog/' },
  ],
};

export function render({ url }) {
  return `
${pageHead({
  title: 'What shipped, when.',
  lede: `Monthly releases, written by the engineers who did the work. Breaking changes get
    ninety days' notice and never arrive in a patch.`,
  trail: meta.breadcrumbs,
  url,
})}

<section class="section section--tight">
  <div class="shell" style="max-width:56rem">
    ${each(changelog, (release) => {
      const date = dateParts(release.date);
      return `<article class="release">
      <div class="release__meta">
        <p class="release__version">${esc(release.version)}</p>
        <p class="release__date">
          <time datetime="${esc(date.iso)}">${esc(date.label)}</time>
        </p>
        <p class="release__tag">${esc(release.tag)}</p>
      </div>
      <div class="release__body">
        <h2 class="h3">${esc(release.title)}</h2>
        <ul class="checks" style="margin-top:var(--space-s)">
          ${each(release.items, (item) => `<li>${esc(item)}</li>`)}
        </ul>
      </div>
    </article>`;
    })}
  </div>
</section>

${cta({
  url,
  title: 'Subscribe to the release feed.',
  body: 'Or just book a demo and we will tell you what is coming.',
  primary: { href: '/northwind/demo/', label: 'Book a demo' },
  secondary: { href: '/northwind/docs/', label: 'Read the docs' },
})}
`;
}
