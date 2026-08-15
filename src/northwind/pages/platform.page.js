import { each, esc } from '../../_lib/html.js';
import { features } from '../data.js';
import { pipeline } from '../art.js';
import { codeBlock, cta, pageHead, sectionHead } from '../components.js';

export const meta = {
  title: 'Platform',
  description: `How the three signals fit together: one collector, one store, one query
    language. Redaction happens before data leaves your network.`,
  scripts: ['ui.js'],
  breadcrumbs: [
    { label: 'Northwind', href: '/northwind/' },
    { label: 'Platform', href: '/northwind/platform/' },
  ],
};

export function render({ url }) {
  return `
${pageHead({
  kicker: 'Platform',
  title: 'One pipeline, three signals.',
  lede: `Metrics, traces and logs share a collector, a storage engine and a query language.
    That is the whole architecture, and it is why correlating them does not require exporting
    anything.`,
  trail: meta.breadcrumbs,
  url,
})}

<section class="section section--tight">
  <div class="shell">
    <figure style="margin:0">
      ${pipeline({ highlight: 'store', title: 'The Northwind ingest path: your services send to a collector, which redacts, samples and batches before forwarding to the Northwind columnar store, which is queried with NWQL.' })}
    </figure>
  </div>
</section>

<section class="section" aria-labelledby="collector-heading">
  <div class="shell">
    <div class="grid grid--2" style="gap:var(--space-2xl);align-items:start">
      <div>
        ${sectionHead({
          kicker: 'Collector',
          title: 'The boundary is yours, not ours.',
          id: 'collector-heading',
        })}
        <p class="lede">The collector runs inside your network. Redaction, sampling and
          batching all happen before anything crosses the boundary, which means a sensitive
          field is never transmitted and then scrubbed — it is never transmitted.</p>
        <ul class="checks" style="margin-top:var(--space-m)">
          <li>Standard OpenTelemetry Collector with one Northwind exporter</li>
          <li>Redaction rules are ordinary processor config, reviewable in your repo</li>
          <li>Buffers to disk if we are unreachable, so a Northwind outage is not yours</li>
          <li>No proprietary agent, no kernel module, no sidecar requirement</li>
        </ul>
      </div>

      ${codeBlock({
        language: 'yaml',
        filename: 'otel-collector.yaml',
        code: `# The whole integration. Eleven lines.
processors:
  redact:
    # Never leaves the VPC unredacted
    blocked_key_patterns: ["patient_.*", ".*_ssn"]

exporters:
  northwind:
    endpoint: "ingest.northwind.example"
    api_key: "\${NORTHWIND_API_KEY}"
    compression: zstd`,
      })}
    </div>
  </div>
</section>

<section class="section section--raised" aria-labelledby="signals-heading">
  <div class="shell">
    ${sectionHead({
      kicker: 'Signals',
      title: 'Three ways in, one way out.',
      body: 'Each signal has its own ingest path and its own trade-offs. They share a query language.',
      id: 'signals-heading',
    })}

    <div class="grid grid--3">
      ${each(
        features,
        (feature) => `<a class="card card--link"
        href="${esc(url(`/northwind/features/${feature.slug}/`))}">
        <p class="kicker">${esc(feature.kicker)}</p>
        <h3 class="card__title" style="margin-top:var(--space-2xs)">${esc(feature.name)}</h3>
        <p class="card__body">${esc(feature.summary)}</p>
        <table class="spec-table" style="margin-top:var(--space-m)">
          <caption class="visually-hidden">${esc(feature.name)} specifications</caption>
          <tbody>
            ${each(
              feature.specs.slice(0, 2),
              ([key, value]) => `<tr><th scope="row">${esc(key)}</th><td>${esc(value)}</td></tr>`,
            )}
          </tbody>
        </table>
        <p class="arrow-link" style="margin-top:var(--space-s)">${esc(feature.name)} in detail</p>
      </a>`,
      )}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="query-heading">
  <div class="shell">
    <div class="grid grid--2" style="gap:var(--space-2xl);align-items:start">
      ${codeBlock({
        language: 'nwql',
        filename: 'One query, three signals',
        code: `# p95 latency by endpoint, last hour
metric("http.server.duration")
  | where service == "checkout-api"
  | percentile(95) by endpoint
  | over(1h)

# The traces behind the worst endpoint
trace()
  | where service == "checkout-api"
    and endpoint == "/v1/charge"
    and duration > 800ms

# And the logs those traces emitted
log() | where trace_id in above()`,
      })}

      <div>
        ${sectionHead({
          kicker: 'NWQL',
          title: 'Stop translating between dialects.',
          id: 'query-heading',
        })}
        <p class="lede">During an incident nobody has the working memory to hold three query
          syntaxes at once. NWQL is one language across all three signals, and
          <span class="mono">above()</span> chains a result into the next query.</p>
        <ul class="checks" style="margin-top:var(--space-m)">
          <li>PromQL runs unmodified, so existing dashboards and rules keep working</li>
          <li>Joins across signals on shared resource attributes</li>
          <li>Query results are addressable, so a chain is one expression rather than four tabs</li>
        </ul>
        <a class="arrow-link" style="margin-top:var(--space-m)"
           href="${esc(url('/northwind/docs/'))}">Read the NWQL reference</a>
      </div>
    </div>
  </div>
</section>

${cta({
  url,
  title: 'See it against your own traffic.',
  body: 'A demo is a working account with your collector pointed at it, not a slide deck.',
  primary: { href: '/northwind/demo/', label: 'Book a demo' },
  secondary: { href: '/northwind/pricing/', label: 'See pricing' },
})}
`;
}
