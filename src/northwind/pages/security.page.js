import { each, esc } from '../../_lib/html.js';
import { compliance, securityPractices } from '../data.js';
import { pipeline } from '../art.js';
import { cta, pageHead, sectionHead } from '../components.js';

export const meta = {
  title: 'Security',
  description: `SOC 2 Type II, ISO 27001, HIPAA and HITRUST. Redaction happens in your own
    network, so sensitive fields never cross the boundary rather than being scrubbed after.`,
  scripts: ['ui.js'],
  breadcrumbs: [
    { label: 'Northwind', href: '/northwind/' },
    { label: 'Security', href: '/northwind/security/' },
  ],
};

export function render({ url }) {
  return `
${pageHead({
  title: 'The data never leaves unredacted.',
  lede: `Most vendors scrub sensitive fields after they arrive. Northwind redacts in the
    collector, inside your network, so the control is demonstrable at the config rather than
    argued from policy.`,
  trail: meta.breadcrumbs,
  url,
})}

<section class="section section--tight">
  <div class="shell">
    <figure style="margin:0">
      ${pipeline({
        highlight: 'collector',
        title:
          'The ingest path with the collector stage highlighted. Redaction, sampling and batching all happen in the collector, inside the customer network, before data reaches Northwind.',
      })}
    </figure>
  </div>
</section>

<section class="section" aria-labelledby="practices-heading">
  <div class="shell">
    ${sectionHead({
      title: 'What we actually do.',
      id: 'practices-heading',
    })}

    <div class="grid grid--2">
      ${each(
        securityPractices,
        (practice) => `<div class="card">
        <h3 class="card__title">${esc(practice.title)}</h3>
        <p class="card__body" style="font-size:var(--step-0)">${esc(practice.text)}</p>
      </div>`,
      )}
    </div>
  </div>
</section>

<section class="section section--raised" aria-labelledby="compliance-heading">
  <div class="shell">
    ${sectionHead({
      title: 'Certifications and attestations.',
      body: 'Reports and questionnaires are available under NDA without going through sales.',
      id: 'compliance-heading',
    })}

    <ul class="compliance">
      ${each(
        compliance,
        (item) => `<li>
        <p class="compliance__name">
          <span class="status-dot" aria-hidden="true"></span>
          ${esc(item.name)}
        </p>
        <p class="compliance__detail">${esc(item.detail)}</p>
      </li>`,
      )}
    </ul>
  </div>
</section>

<section class="section" aria-labelledby="incident-heading">
  <div class="shell">
    <div class="grid grid--2" style="gap:var(--space-2xl);align-items:start">
      <div>
        ${sectionHead({
          title: 'How we behave when it goes wrong.',
          id: 'incident-heading',
        })}
        <p class="lede">A security page that only lists certifications is telling you what an
          auditor checked, not what happens on a bad day.</p>
      </div>

      <table class="spec-table">
        <caption class="visually-hidden">Incident response commitments</caption>
        <tbody>
          ${each(
            [
              ['Initial notification', 'Within 24 hours of confirmation'],
              ['Affected-customer detail', 'Within 72 hours'],
              ['Public post-mortem', 'Within 14 days, including root cause'],
              ['Bug bounty scope', 'All production systems, no ingest carve-out'],
              ['Uptime SLA', '99.95% on Business, credited automatically'],
              ['Status page', 'Independent of our own infrastructure'],
            ],
            ([key, value]) => `<tr><th scope="row">${esc(key)}</th><td>${esc(value)}</td></tr>`,
          )}
        </tbody>
      </table>
    </div>
  </div>
</section>

${cta({
  url,
  title: 'Send us your security questionnaire.',
  body: 'We answer it before the first call rather than after the third.',
  primary: { href: '/northwind/demo/', label: 'Get in touch' },
  secondary: { href: '/northwind/platform/', label: 'How the collector works' },
})}
`;
}
