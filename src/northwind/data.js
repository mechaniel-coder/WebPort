/**
 * Northwind content model.
 *
 * Northwind is a fictional observability platform. The pricing model below is
 * real arithmetic rather than decoration — the calculator on /pricing/ uses
 * exactly these numbers, and the plan comparison crossovers are genuine.
 *
 * All money is in cents.
 */

export const product = {
  name: 'Northwind',
  tagline: 'Observability for systems that are not allowed to go down.',
  lede: `Metrics, traces and logs in one query language, priced on what you actually
    ingest rather than per seat.`,
  founded: 2021,
  customers: 1840,
  eventsPerDay: '4.1 trillion',
  email: 'sales@example.com',
};

/* ── Plans ─────────────────────────────────────────────────────────────────── */

/**
 * Tiered pricing. `base` is the monthly platform fee; anything beyond the
 * included allowances is charged at the overage rates.
 */
export const plans = [
  {
    id: 'starter',
    name: 'Starter',
    base: 0,
    includedGb: 5,
    includedHosts: 3,
    gbRate: 0,
    hostRate: 0,
    maxGb: 5,
    maxHosts: 3,
    retention: [7],
    blurb: 'Everything working, at a volume where the bill should be zero.',
    features: [
      '5 GB ingest per month',
      '3 monitored hosts',
      '7-day retention',
      'Metrics, traces and logs',
      'Community support',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    base: 8900,
    includedGb: 50,
    includedHosts: 10,
    gbRate: 180,
    hostRate: 1200,
    maxGb: 2000,
    maxHosts: 200,
    retention: [7, 30, 90],
    popular: true,
    blurb: 'The plan most engineering teams under fifty people end up on.',
    features: [
      '50 GB ingest included, then $1.80/GB',
      '10 hosts included, then $12/host',
      'Up to 90-day retention',
      'Unlimited dashboards and alerts',
      'SSO and audit log',
      'Email support, 1 business day',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    base: 49900,
    includedGb: 500,
    includedHosts: 75,
    gbRate: 120,
    hostRate: 900,
    maxGb: 50000,
    maxHosts: 5000,
    retention: [7, 30, 90, 365],
    blurb: 'Volume pricing, longer retention, and someone who answers the phone.',
    features: [
      '500 GB ingest included, then $1.20/GB',
      '75 hosts included, then $9/host',
      'Up to 15-month retention',
      'SAML, SCIM and fine-grained RBAC',
      'Private data regions',
      '99.95% uptime SLA',
      'Shared Slack channel, 1-hour response',
    ],
  },
];

/** Retention beyond the included window multiplies the storage component. */
export const RETENTION = [
  { days: 7, label: '7 days', multiplier: 1 },
  { days: 30, label: '30 days', multiplier: 1 },
  { days: 90, label: '90 days', multiplier: 1.25 },
  { days: 365, label: '15 months', multiplier: 1.9 },
];

export const ANNUAL_DISCOUNT = 0.2;

/* ── Features ──────────────────────────────────────────────────────────────── */

export const features = [
  {
    slug: 'metrics',
    name: 'Metrics',
    kicker: 'Time series',
    summary: 'Ten-second resolution, kept at full fidelity for as long as you pay to keep it.',
    lede: `Most platforms roll your metrics up after a few days, which is exactly when an
      incident review needs them. Northwind keeps raw resolution for the whole retention
      window.`,
    diagram: 'metrics',
    points: [
      {
        title: 'No forced roll-up',
        text: `Ten-second points stay ten-second points. If you buy 90 days, you can query
          the 87th day at the same resolution as this morning.`,
      },
      {
        title: 'Cardinality that does not bankrupt you',
        text: `Tag cardinality is priced into ingest rather than billed as a separate
          surprise. A label with ten thousand values costs what its bytes cost.`,
      },
      {
        title: 'PromQL-compatible',
        text: `Existing Prometheus queries, recording rules and Grafana dashboards run
          unmodified. The migration is a remote-write endpoint change.`,
      },
    ],
    specs: [
      ['Resolution', '10 seconds'],
      ['Ingest protocols', 'Prometheus remote-write, OTLP, StatsD'],
      ['Query languages', 'PromQL, NWQL'],
      ['Max series per account', 'Unlimited'],
    ],
  },
  {
    slug: 'traces',
    name: 'Traces',
    kicker: 'Distributed tracing',
    summary: 'Tail-based sampling that keeps the traces you actually needed.',
    lede: `Head sampling throws away the interesting requests before it knows they were
      interesting. Northwind decides after the trace completes.`,
    diagram: 'traces',
    points: [
      {
        title: 'Tail-based by default',
        text: `The sampling decision happens once the whole trace is assembled, so every
          error and every request over your latency objective is kept, whatever the rate.`,
      },
      {
        title: 'Spans join metrics automatically',
        text: `Service, endpoint and status labels are shared across signals, so a latency
          spike on a metric chart links straight to the traces underneath it.`,
      },
      {
        title: 'OpenTelemetry native',
        text: `OTLP in, no proprietary agent required. The collector config is eleven lines
          and is in the docs.`,
      },
    ],
    specs: [
      ['Sampling', 'Tail-based, policy-driven'],
      ['Ingest protocols', 'OTLP gRPC and HTTP, Jaeger, Zipkin'],
      ['Max span size', '2 MB'],
      ['Trace assembly window', '60 seconds'],
    ],
  },
  {
    slug: 'logs',
    name: 'Logs',
    kicker: 'Log management',
    summary: 'Structured search over everything, without an index tax on every field.',
    lede: `Indexing every field is why log platforms cost more than the infrastructure they
      watch. Northwind indexes metadata and scans the rest, quickly.`,
    diagram: 'logs',
    points: [
      {
        title: 'Index metadata, scan the body',
        text: `Service, host, level and trace ID are indexed. Message bodies are scanned
          from columnar storage, which is fast enough that the difference does not show.`,
      },
      {
        title: 'One query language',
        text: `The same NWQL expression filters logs, traces and metrics. You stop
          translating between three dialects during an incident.`,
      },
      {
        title: 'Live tail that survives volume',
        text: `Streaming tail with server-side filtering, so a noisy deploy does not turn
          the console into a firehose you have to close.`,
      },
    ],
    specs: [
      ['Storage', 'Columnar, compressed ~11:1'],
      ['Indexed fields', 'Metadata only'],
      ['Live tail latency', 'Under 2 seconds'],
      ['Max line length', '256 KB'],
    ],
  },
];

export const featureBySlug = Object.fromEntries(features.map((item) => [item.slug, item]));

/* ── Customers ─────────────────────────────────────────────────────────────── */

export const customers = [
  {
    slug: 'harbourline',
    name: 'Harbourline',
    sector: 'Logistics',
    summary: 'Cut observability spend by 63% while tripling the volume they keep.',
    metrics: [
      { value: '63%', label: 'lower monthly bill' },
      { value: '3.1×', label: 'more data retained' },
      { value: '11 min', label: 'median time to detect' },
    ],
    quote: `We were paying per host on a fleet that autoscaled to four hundred nodes at
      peak. The bill was effectively a random number generator.`,
    attribution: 'Priya Raghavan, Director of Platform Engineering',
    challenge: `Harbourline runs freight routing across sixteen regions. Their previous
      vendor charged per monitored host, and their fleet autoscaled by a factor of eight
      between the overnight trough and the Monday morning peak. Nobody could forecast the
      bill, so the platform team had been quietly reducing what they monitored.`,
    approach: `We moved them to ingest-based pricing and rewrote the collection config to
      drop three high-cardinality debug labels that accounted for 40% of their volume and
      had never been queried. Tail sampling replaced a flat 5% head sample.`,
    outcome: `The bill dropped 63% and stopped fluctuating with the fleet size. Because
      retention was no longer being rationed, incident reviews now have the full window,
      and median time to detect fell from 34 minutes to 11.`,
  },
  {
    slug: 'meridian-health',
    name: 'Meridian Health',
    sector: 'Healthcare',
    summary: 'Passed a HITRUST audit with observability in scope, in one cycle.',
    metrics: [
      { value: '1 cycle', label: 'to audit sign-off' },
      { value: '100%', label: 'PHI redacted at source' },
      { value: '15 mo', label: 'retention in region' },
    ],
    quote: `The question was never whether the tool was good. It was whether we could put
      patient data anywhere near it.`,
    attribution: 'Daniel Osei, VP Infrastructure',
    challenge: `Meridian Health had failed a prior audit because log lines containing
      patient identifiers were leaving their VPC before redaction. Their observability
      stack was in scope for HITRUST and could not stay as it was.`,
    approach: `Redaction moved into the collector, so identifiers never crossed the network
      boundary in the first place. Data landed in a private region in their own cloud
      account, with fifteen-month retention to match their record-keeping obligation.`,
    outcome: `The audit passed in a single cycle with observability fully in scope. Because
      redaction happens at the source, the control is demonstrable at the collector config
      rather than argued from vendor policy.`,
  },
];

export const customerBySlug = Object.fromEntries(customers.map((item) => [item.slug, item]));

export const logos = [
  'Harbourline',
  'Meridian Health',
  'Corvus Pay',
  'Tessellate',
  'Bright Meadow',
  'Ardent Labs',
];

/* ── Changelog ─────────────────────────────────────────────────────────────── */

export const changelog = [
  {
    version: '2026.8',
    date: '2026-08-04',
    title: 'Private data regions in three more clouds',
    tag: 'Platform',
    items: [
      'Private regions available in GCP europe-west4, AWS ap-south-1 and Azure uksouth.',
      'Region is now selectable per data type, so logs can stay in region while metrics go global.',
      'Fixed a case where cross-region trace assembly could drop the final span of a trace.',
    ],
  },
  {
    version: '2026.7',
    date: '2026-07-09',
    title: 'NWQL joins across signals',
    tag: 'Query',
    items: [
      'A single NWQL expression can now join metrics to traces on shared resource attributes.',
      'Query editor gained inline result previews for sub-expressions.',
      'Reduced p99 query latency on log scans by 41% via improved column pruning.',
    ],
  },
  {
    version: '2026.6',
    date: '2026-06-11',
    title: 'Tail sampling policies',
    tag: 'Traces',
    items: [
      'Sampling policies can now key on any span attribute, not just status and duration.',
      'Added a policy simulator that replays yesterday’s traffic against a draft policy.',
      'OTLP ingest now accepts gzip and zstd compression.',
    ],
  },
  {
    version: '2026.5',
    date: '2026-05-14',
    title: 'SCIM provisioning',
    tag: 'Security',
    items: [
      'SCIM 2.0 user and group provisioning for Okta, Entra ID and JumpCloud.',
      'Audit log now records dashboard and alert changes with a full diff.',
      'Session lifetime is configurable per organisation.',
    ],
  },
];

/* ── Docs ──────────────────────────────────────────────────────────────────── */

export const docsNav = [
  {
    section: 'Getting started',
    items: [
      { id: 'quickstart', label: 'Quickstart' },
      { id: 'install', label: 'Install the collector' },
      { id: 'first-query', label: 'Your first query' },
    ],
  },
  {
    section: 'Ingest',
    items: [
      { id: 'metrics-ingest', label: 'Metrics' },
      { id: 'traces-ingest', label: 'Traces' },
      { id: 'logs-ingest', label: 'Logs' },
    ],
  },
  {
    section: 'Reference',
    items: [
      { id: 'nwql', label: 'NWQL' },
      { id: 'limits', label: 'Limits and quotas' },
    ],
  },
];

/* ── Security ──────────────────────────────────────────────────────────────── */

export const compliance = [
  { name: 'SOC 2 Type II', detail: 'Audited annually by a Big Four firm. Report on request.' },
  { name: 'ISO 27001', detail: 'Certified since 2023, covering all production systems.' },
  { name: 'HIPAA', detail: 'BAA available on Business and Enterprise plans.' },
  { name: 'GDPR', detail: 'EU data residency, DPA and SCCs available.' },
  { name: 'HITRUST', detail: 'Inheritable controls documented for customer audits.' },
  { name: 'PCI DSS', detail: 'Level 1 service provider for in-scope deployments.' },
];

export const securityPractices = [
  {
    title: 'Encryption everywhere',
    text: `TLS 1.3 in transit, AES-256 at rest, and per-tenant keys with optional
      customer-managed keys on Business.`,
  },
  {
    title: 'Redaction at the source',
    text: `The collector redacts before data leaves your network, so sensitive fields never
      cross the boundary rather than being scrubbed after arrival.`,
  },
  {
    title: 'Least privilege by default',
    text: `New members get read-only access. Every escalation is time-boxed and written to
      an audit log that cannot be edited from the product.`,
  },
  {
    title: 'Tested by people who are not us',
    text: `Annual third-party penetration test, continuous automated scanning, and a public
      bug bounty with no scope carve-outs for the ingest path.`,
  },
];

/* ── FAQ ───────────────────────────────────────────────────────────────────── */

export const pricingFaqs = [
  {
    question: 'What counts as an event?',
    answer: `Ingest is billed on compressed bytes received, not on event counts. A metric
      point, a span and a log line all cost what their bytes cost, so you never have to
      model three different units.`,
  },
  {
    question: 'What happens if I go over?',
    answer: `Nothing breaks. Overage is billed at the plan rate at the end of the month, and
      you can set a hard cap that starts dropping the lowest-priority data instead if you
      would rather have a ceiling than a bill.`,
  },
  {
    question: 'Do you charge per seat?',
    answer: `No. Every plan includes unlimited users, dashboards and alerts. Charging per
      seat encourages teams to share logins, which is the opposite of what a security
      team wants.`,
  },
  {
    question: 'Can I change plans mid-month?',
    answer: `Yes, in either direction. Upgrades take effect immediately and are prorated;
      downgrades take effect at the next billing cycle so you keep what you paid for.`,
  },
  {
    question: 'Is there a discount for paying annually?',
    answer: `Twenty percent off the platform fee and all overage rates. Annual plans can
      still burst above their committed volume without renegotiating.`,
  },
];
