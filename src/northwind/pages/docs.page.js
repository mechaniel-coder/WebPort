import { each, esc } from '../../_lib/html.js';
import { docsNav } from '../data.js';
import { codeBlock, crumbs } from '../components.js';

export const meta = {
  title: 'Documentation',
  description: `Quickstart, collector installation, ingest reference and the NWQL language
    reference. Point a collector at Northwind in about five minutes.`,
  styles: ['docs.css'],
  scripts: ['ui.js'],
  breadcrumbs: [
    { label: 'Northwind', href: '/northwind/' },
    { label: 'Docs', href: '/northwind/docs/' },
  ],
};

export function render({ url }) {
  return `
<div class="docs">
  <div class="shell docs__layout">
    <nav class="docs__nav" aria-labelledby="docs-nav-heading">
      <h2 class="visually-hidden" id="docs-nav-heading">Documentation sections</h2>
      ${each(
        docsNav,
        (group) => `<div class="docs__group">
        <p class="docs__group-title">${esc(group.section)}</p>
        <ul>
          ${each(
            group.items,
            (item) => `<li><a href="#${esc(item.id)}">${esc(item.label)}</a></li>`,
          )}
        </ul>
      </div>`,
      )}
    </nav>

    <div class="docs__body">
      ${crumbs(meta.breadcrumbs, url)}
      <h1 class="h1" style="margin-block:var(--space-2xs) var(--space-m)">Getting data in.</h1>
      <p class="lede">Northwind ingests OpenTelemetry, Prometheus remote-write and syslog.
        If you already run an OTel collector, the integration is one exporter block.</p>

      <section class="docs__section" id="quickstart">
        <h2 class="h2">Quickstart</h2>
        <p class="muted">Five minutes from nothing to a chart. You need an API key, which the
          free tier issues without a card.</p>

        ${codeBlock({
          language: 'shell',
          filename: 'Terminal',
          code: `# 1. Install the collector
curl -fsSL https://get.northwind.example/install.sh | sh

# 2. Point it at your account
northwind configure --api-key "\${NORTHWIND_API_KEY}"

# 3. Send something
northwind test --signal metrics
# → 200 OK · 1 metric accepted · view at app.northwind.example`,
        })}
      </section>

      <section class="docs__section" id="install">
        <h2 class="h2">Install the collector</h2>
        <p class="muted">The collector is the standard OpenTelemetry Collector with one
          extra exporter. If you have an existing deployment, add the exporter rather than
          replacing anything.</p>

        ${codeBlock({
          language: 'yaml',
          filename: 'otel-collector.yaml',
          code: `receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

processors:
  batch:
    timeout: 5s
  redact:
    # Redaction happens here, before anything leaves your network
    blocked_key_patterns: [".*_ssn", "patient_.*", "authorization"]

exporters:
  northwind:
    endpoint: "ingest.northwind.example:443"
    api_key: "\${NORTHWIND_API_KEY}"
    compression: zstd
    sending_queue:
      # Buffer to disk so our outage is not your outage
      storage: file_storage

service:
  pipelines:
    metrics:
      receivers: [otlp]
      processors: [redact, batch]
      exporters: [northwind]`,
        })}

        <div class="callout">
          <p><strong>On Kubernetes</strong>, the Helm chart wraps all of the above:
            <span class="mono">helm install northwind northwind/collector --set apiKey=…</span></p>
        </div>
      </section>

      <section class="docs__section" id="first-query">
        <h2 class="h2">Your first query</h2>
        <p class="muted">NWQL reads left to right as a pipeline. Every stage takes the
          previous stage's result.</p>

        ${codeBlock({
          language: 'nwql',
          filename: 'NWQL',
          code: `metric("http.server.duration")
  | where service == "checkout-api"
  | percentile(95) by endpoint
  | over(1h)`,
        })}
      </section>

      <section class="docs__section" id="metrics-ingest">
        <h2 class="h2">Metrics</h2>
        <p class="muted">Accepts OTLP, Prometheus remote-write and StatsD. Existing
          Prometheus setups need only a remote-write URL change — recording rules, alerting
          rules and Grafana dashboards are unaffected.</p>

        ${codeBlock({
          language: 'yaml',
          filename: 'prometheus.yml',
          code: `remote_write:
  - url: "https://ingest.northwind.example/api/v1/write"
    authorization:
      credentials_file: /etc/northwind/api-key`,
        })}
      </section>

      <section class="docs__section" id="traces-ingest">
        <h2 class="h2">Traces</h2>
        <p class="muted">OTLP over gRPC or HTTP. Sampling policy is set server-side, so you
          do not redeploy services to change what is kept.</p>

        ${codeBlock({
          language: 'yaml',
          filename: 'sampling-policy.yaml',
          code: `policies:
  - name: keep-all-errors
    type: status_code
    status_codes: [ERROR]

  - name: keep-slow
    type: latency
    threshold_ms: 800

  - name: baseline
    type: probabilistic
    sampling_percentage: 5`,
        })}
      </section>

      <section class="docs__section" id="logs-ingest">
        <h2 class="h2">Logs</h2>
        <p class="muted">Structured JSON is preferred but not required — unstructured lines
          are parsed with the rules you configure and stored either way.</p>

        ${codeBlock({
          language: 'nwql',
          filename: 'NWQL',
          code: `log()
  | where service == "checkout-api" and level >= "warn"
  | where body ~ "timeout"
  | count() by host
  | over(15m)`,
        })}
      </section>

      <section class="docs__section" id="nwql">
        <h2 class="h2">NWQL reference</h2>
        <table class="spec-table">
          <caption class="visually-hidden">NWQL functions</caption>
          <tbody>
            ${each(
              [
                ['metric(name)', 'Select a metric series by name'],
                ['trace()', 'Select spans'],
                ['log()', 'Select log records'],
                ['where expr', 'Filter; supports ==, !=, >, <, ~ (regex) and in'],
                ['percentile(n) by k', 'Percentile aggregate, grouped'],
                ['count() by k', 'Count, grouped'],
                ['over(window)', 'Bucket into a time window'],
                ['above()', 'Reference the previous query’s result set'],
              ],
              ([signature, meaning]) =>
                `<tr><th scope="row" class="mono">${esc(signature)}</th><td style="font-family:var(--font-sans)">${esc(meaning)}</td></tr>`,
            )}
          </tbody>
        </table>
      </section>

      <section class="docs__section" id="limits">
        <h2 class="h2">Limits and quotas</h2>
        <table class="spec-table">
          <caption class="visually-hidden">Platform limits</caption>
          <tbody>
            ${each(
              [
                ['Max log line', '256 KB'],
                ['Max span size', '2 MB'],
                ['Trace assembly window', '60 seconds'],
                ['Metric resolution', '10 seconds'],
                ['Ingest rate limit', 'None — bursts are absorbed and billed'],
                ['Query timeout', '120 seconds'],
                ['API rate limit', '600 requests/minute/key'],
              ],
              ([key, value]) => `<tr><th scope="row">${esc(key)}</th><td>${esc(value)}</td></tr>`,
            )}
          </tbody>
        </table>

        <div class="callout" style="margin-top:var(--space-l)">
          <p>These docs are an excerpt written to demonstrate documentation design. The
            endpoints are not real — see <a href="${esc(url('/northwind/demo/'))}">book a
            demo</a> if you want to talk about the real thing.</p>
        </div>
      </section>
    </div>
  </div>
</div>
`;
}
