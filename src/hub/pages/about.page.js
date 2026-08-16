import { each, esc } from '../../_lib/html.js';
import { capabilities, principles, studies } from '../data.js';
import { studio } from '../../../site.config.js';

export const meta = {
  title: 'About',
  description: `How ${studio.name} works: design systems first, accessibility while the code
    is being written rather than after, and every claim verified in a real browser.`,
  priority: 0.8,
};

export function render({ url }) {
  const totalPages = studies.reduce((sum, study) => sum + study.pages, 0);

  return `
<section class="hero">
  <div class="shell">
    <p class="section__label">About</p>
    <h1 class="hero__title" style="font-size:var(--step-4);max-width:18ch">
      A small studio that finishes things.</h1>
    <p class="hero__lede">
      ${esc(studio.name)} designs and builds websites for companies where the site is the
      first impression and often the only one. Three projects, ${totalPages} pages, and every
      interactive system on them written from scratch rather than assembled from plugins.
    </p>
    <div class="hero__meta">
      <span>Design systems</span>
      <span>Front-end engineering</span>
      <span>Accessibility</span>
      <span>Performance</span>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="how-heading">
  <div class="shell case-grid">
    <h2 class="case-grid__label" id="how-heading">How we work</h2>
    <ul class="principles">
      ${each(
        principles,
        (item) => `<li>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.text)}</p>
      </li>`,
      )}
    </ul>
  </div>
</section>

<section class="section section--tight" aria-labelledby="capabilities-heading">
  <div class="shell case-grid">
    <h2 class="case-grid__label" id="capabilities-heading">What we do</h2>
    <table class="capability-table">
      <caption class="visually-hidden">Capabilities</caption>
      <tbody>
        ${each(
          capabilities,
          ([area, detail]) => `<tr>
          <th scope="row">${esc(area)}</th>
          <td>${esc(detail)}</td>
        </tr>`,
        )}
      </tbody>
    </table>
  </div>
</section>

<section class="section" aria-labelledby="honest-heading">
  <div class="shell case-grid">
    <h2 class="case-grid__label" id="honest-heading">Plainly</h2>
    <div class="prose">
      <p>Aurelia, Northwind and Forma are <strong>fictional brands</strong>. They were
        invented so that three very different problems — art direction, technical
        communication and transactional UX — could be solved properly rather than gestured
        at. The companies are not real; the engineering is.</p>

      <p>All imagery is original generated vector artwork. Nothing is licensed, nothing is
        hotlinked, and there is no stock library anywhere in the build. That was a constraint
        rather than a preference, and on Forma it turned into the design.</p>

      <p>Every form on these sites validates and then stops. There is no backend, nothing is
        transmitted, and no payment details are requested at any point on the storefront.
        Each form has a single documented hand-off point where a real endpoint drops in.</p>

      <p>The whole portfolio is <strong>static HTML, CSS and JavaScript with zero runtime
        dependencies</strong> — no framework, no bundler, nothing to keep patched. It is
        hosted by pointing a web server at a directory.</p>
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="shell">
    <a class="button" href="${esc(url('/contact/'))}">Start a project</a>
    <a class="button button--ghost" style="margin-left:var(--space-xs)"
       href="${esc(url('/'))}">See the work</a>
  </div>
</section>
`;
}
