/**
 * Journal articles, generated from data.js.
 */
import { dateParts, each, esc } from '../../../_lib/html.js';
import { journal } from '../../data.js';
import { JOURNAL_PALETTE, horizon } from '../../art.js';
import { article as articleSchema } from '../../../_lib/seo.js';
import { cta, crumbs } from '../../components.js';

export const pages = journal.map((post) => ({
  slug: post.slug,

  meta: {
    title: post.title,
    description: post.excerpt,
    ogType: 'article',
    scripts: ['ui.js'],
    breadcrumbs: [
      { label: 'Aurelia', href: '/aurelia/' },
      { label: 'Journal', href: '/aurelia/journal/' },
      { label: post.title, href: `/aurelia/journal/${post.slug}/` },
    ],
    jsonld: articleSchema({
      title: post.title,
      description: post.excerpt,
      published: post.published,
      path: `/aurelia/journal/${post.slug}/`,
      section: post.section,
    }),
  },

  render: ({ url }) => renderPost(post, url),
}));

function renderPost(post, url) {
  const date = dateParts(post.published);
  const others = journal.filter((other) => other.slug !== post.slug);

  return `
<article>
  <header class="page-head">
    <div class="shell shell--narrow">
      ${crumbs(
        [
          { label: 'Aurelia', href: '/aurelia/' },
          { label: 'Journal', href: '/aurelia/journal/' },
          { label: post.title, href: `/aurelia/journal/${post.slug}/` },
        ],
        url,
      )}
      <h1 class="display-2 page-head__title" style="max-width:22ch">${esc(post.title)}</h1>
      <p class="note">
        ${esc(post.section)} ·
        <time datetime="${esc(date.iso)}">${esc(date.label)}</time>
      </p>
      <p class="lede page-head__lede">${esc(post.excerpt)}</p>
    </div>
  </header>

  <div class="section section--tight">
    <div class="shell shell--narrow">
      <div class="article__hero">
        ${horizon({
          seed: `post-${post.slug}`,
          palette: JOURNAL_PALETTE[post.art] || 'fog',
          ratio: 0.5625,
        })}
      </div>

      <div class="article">
        ${each(post.body, (block) => renderBlock(block))}
      </div>
    </div>
  </div>
</article>

<section class="section section--paper" aria-labelledby="more-heading">
  <div class="shell">
    <div class="section-head">
      <div>
        <h2 class="display-2" id="more-heading">Keep reading.</h2>
      </div>
    </div>
    <ul class="posts" style="grid-template-columns:repeat(auto-fit,minmax(16rem,1fr))">
      ${each(others, (other) => {
        const otherDate = dateParts(other.published);
        return `<li class="post-card">
        <a href="${esc(url(`/aurelia/journal/${other.slug}/`))}">
          <div class="post-card__frame">
            ${horizon({
              seed: `post-${other.slug}`,
              palette: JOURNAL_PALETTE[other.art] || 'fog',
              ratio: 0.75,
            })}
          </div>
          <p class="post-card__meta">
            ${esc(other.section)} ·
            <time datetime="${esc(otherDate.iso)}">${esc(otherDate.label)}</time>
          </p>
          <h3 class="post-card__title">${esc(other.title)}</h3>
        </a>
      </li>`;
      })}
    </ul>
  </div>
</section>

${cta({ url, title: 'Come and see for yourself.', seed: `post-cta-${post.slug}` })}
`;
}

function renderBlock(block) {
  if (block.type === 'h2') return `<h2>${esc(block.text)}</h2>`;
  if (block.type === 'quote') {
    return `<blockquote>
      <p>“${esc(block.text)}”</p>
      ${block.cite ? `<cite>${esc(block.cite)}</cite>` : ''}
    </blockquote>`;
  }
  return `<p>${esc(block.text)}</p>`;
}
