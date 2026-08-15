/**
 * Pricing calculator.
 *
 * The arithmetic is real tiered pricing, not a lookup table: platform fee plus
 * per-unit overage beyond each plan's included allowance, with a retention
 * multiplier on the storage component and an annual discount.
 *
 * Because every plan is priced for the same configuration, the crossover points
 * are genuine — there are volumes where Team beats Business and volumes where it
 * very much does not, and the calculator will tell you which one you are in.
 */

const data = JSON.parse(document.getElementById('pricing-data').textContent);
const { plans, retention, annualDiscount } = data;

/* ── Pricing model ─────────────────────────────────────────────────────────── */

/**
 * Monthly cost of a configuration on a plan, in cents.
 * Returns null when the plan cannot serve the configuration at all.
 */
export function priceFor(plan, { gb, hosts, retentionDays, annual }) {
  if (gb > plan.maxGb || hosts > plan.maxHosts) return null;
  if (!plan.retention.includes(retentionDays)) return null;

  const multiplier = retention.find((entry) => entry.days === retentionDays)?.multiplier ?? 1;

  const gbOverage = Math.max(0, gb - plan.includedGb) * plan.gbRate;
  const hostOverage = Math.max(0, hosts - plan.includedHosts) * plan.hostRate;

  // Retention lengthens how long ingested data is stored, so it scales the
  // storage component — the platform fee and per-host charge are unaffected.
  const storage = Math.round(gbOverage * multiplier);
  const monthly = plan.base + storage + hostOverage;

  return Math.round(annual ? monthly * (1 - annualDiscount) : monthly);
}

function money(cents) {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

/* ── Slider scales ─────────────────────────────────────────────────────────── */

/**
 * Ingest and host counts span three orders of magnitude, so the sliders are
 * logarithmic — a linear slider would spend 90% of its travel in a range nobody
 * has, and be unusable at the low end where most teams actually sit.
 */
const GB_STOPS = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
const HOST_STOPS = [1, 3, 5, 10, 25, 50, 75, 100, 250, 500, 1000];

const atStop = (stops, index) => stops[Math.max(0, Math.min(stops.length - 1, index))];

/* ── UI ────────────────────────────────────────────────────────────────────── */

function init(root) {
  const gbInput = root.querySelector('[data-input="gb"]');
  const hostInput = root.querySelector('[data-input="hosts"]');
  const retentionInputs = [...root.querySelectorAll('[name="retention"]')];
  const annualInput = root.querySelector('[data-input="annual"]');

  const gbOut = root.querySelector('[data-output="gb"]');
  const hostOut = root.querySelector('[data-output="hosts"]');
  const results = root.querySelector('[data-results]');
  const recommendation = root.querySelector('[data-recommendation]');

  function readState() {
    return {
      gb: atStop(GB_STOPS, Number(gbInput.value)),
      hosts: atStop(HOST_STOPS, Number(hostInput.value)),
      retentionDays: Number(retentionInputs.find((input) => input.checked).value),
      annual: annualInput.checked,
    };
  }

  function render() {
    const state = readState();

    gbOut.textContent = state.gb >= 1000 ? `${state.gb / 1000} TB` : `${state.gb} GB`;
    hostOut.textContent = String(state.hosts);

    const priced = plans.map((plan) => ({ plan, cost: priceFor(plan, state) }));
    const affordable = priced.filter((entry) => entry.cost !== null);
    const best = affordable.length
      ? affordable.reduce((low, entry) => (entry.cost < low.cost ? entry : low))
      : null;

    results.textContent = '';
    for (const { plan, cost } of priced) {
      results.append(planCard(plan, cost, state, best && plan.id === best.plan.id));
    }

    recommendation.textContent = '';
    const line = document.createElement('p');

    if (!best) {
      line.textContent =
        `That configuration is past the published plans — at ${state.gb} GB and ` +
        `${state.hosts} hosts you are into Enterprise, which is quoted rather than listed.`;
    } else {
      const perMonth = money(best.cost);
      line.innerHTML = '';
      line.append(
        document.createTextNode('At '),
        strong(`${state.gb} GB`),
        document.createTextNode(' a month across '),
        strong(`${state.hosts} hosts`),
        document.createTextNode(' with '),
        strong(retention.find((entry) => entry.days === state.retentionDays).label),
        document.createTextNode(' retention, '),
        strong(best.plan.name),
        document.createTextNode(' is cheapest at '),
        strong(`${perMonth}/month`),
        document.createTextNode(state.annual ? ', billed annually.' : '.'),
      );
    }
    recommendation.append(line);
  }

  function strong(text) {
    const node = document.createElement('strong');
    node.textContent = text;
    return node;
  }

  function planCard(plan, cost, state, recommended) {
    const card = document.createElement('div');
    card.className = 'plan-result';
    card.dataset.recommended = String(Boolean(recommended));

    const name = document.createElement('p');
    name.className = 'plan-result__name';
    name.textContent = plan.name;
    if (recommended) {
      const badge = document.createElement('span');
      badge.className = 'plan-result__badge';
      badge.textContent = 'Cheapest';
      name.append(' ', badge);
    }

    const value = document.createElement('p');
    value.className = 'plan-result__value';

    const note = document.createElement('p');
    note.className = 'plan-result__note';

    if (cost === null) {
      value.textContent = '—';
      card.dataset.unavailable = 'true';
      note.textContent = reasonUnavailable(plan, state);
    } else {
      value.textContent = money(cost);
      const overGb = Math.max(0, state.gb - plan.includedGb);
      const overHosts = Math.max(0, state.hosts - plan.includedHosts);
      const parts = [`${money(plan.base)} platform`];
      if (overGb) parts.push(`${overGb} GB over`);
      if (overHosts) parts.push(`${overHosts} hosts over`);
      note.textContent = parts.join(' · ');
    }

    card.append(name, value, note);
    return card;
  }

  function reasonUnavailable(plan, state) {
    if (state.gb > plan.maxGb) return `Caps at ${plan.maxGb} GB`;
    if (state.hosts > plan.maxHosts) return `Caps at ${plan.maxHosts} hosts`;
    return `No ${retention.find((entry) => entry.days === state.retentionDays).label} retention`;
  }

  for (const input of [gbInput, hostInput, annualInput, ...retentionInputs]) {
    input.addEventListener('input', render);
    input.addEventListener('change', render);
  }

  render();
}

/* ── Boot ──────────────────────────────────────────────────────────────────── */

// Deliberately last: `init` reads module-level consts declared above, and a
// top-of-file call would run before they leave the temporal dead zone.
const root = document.querySelector('[data-calculator]');
if (root) init(root);
