import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import FeatureCard from "@/components/FeatureCard";
import Marquee from "@/components/Marquee";
import Stat from "@/components/Stat";
import Quote from "@/components/Quote";
import PricingCard from "@/components/PricingCard";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Aperture — revenue operations, unified",
  description:
    "Aperture pulls every revenue signal into one instrument panel, so the forecast is a fact, not a guess.",
};

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Customers", href: "#customers" },
  { label: "Pricing", href: "#pricing" },
];

const FEATURES = [
  {
    title: "One source of truth",
    description:
      "Every deal, invoice and support ticket resolved to a single customer record, updated in real time.",
  },
  {
    title: "Forecasting that shows its work",
    description:
      "Confidence intervals, not point estimates — see exactly which deals are carrying the risk.",
  },
  {
    title: "Alerts before the number moves",
    description:
      "Anomaly detection flags churn risk and pipeline slippage days before they hit the board deck.",
  },
  {
    title: "Built for the operator, not the analyst",
    description:
      "No SQL required. Every chart on this page is a saved view your whole team can subscribe to.",
  },
  {
    title: "Governed access by design",
    description:
      "Row-level permissions inherited from your CRM's territory model — nothing to reconfigure.",
  },
  {
    title: "Open by default",
    description:
      "A typed API and webhook stream for every event, so Aperture is a source, not a silo.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Connect your stack",
    description: "CRM, billing and support in one OAuth flow. First sync completes in minutes.",
  },
  {
    n: "02",
    title: "Aperture reconciles the data",
    description: "Duplicate accounts merged, currencies normalized, revenue recognized correctly.",
  },
  {
    n: "03",
    title: "Your team gets one dashboard",
    description: "Finance, sales and success all read from the same live number.",
  },
];

export default function SaaSPage() {
  return (
    <div data-site="saas">
      <Nav name="Aperture" links={NAV_LINKS} cta={{ label: "Start free trial", href: "#pricing" }} />
      <Hero
        eyebrow="Revenue operations, unified"
        title="See the number before it happens."
        subtitle="Aperture pulls every revenue signal — CRM, billing, support — into one instrument panel, so the forecast is a fact your whole team can act on, not a guess finance defends alone."
        primaryCta={{ label: "Start free trial", href: "#pricing" }}
        secondaryCta={{ label: "Watch the product tour", href: "#product" }}
        aside={
          <div className="glass mx-auto grid max-w-3xl grid-cols-1 gap-4 rounded-(--radius-xl) p-6 shadow-[var(--shadow-3)] sm:grid-cols-3">
            {[
              { label: "Net revenue retention", value: "128%" },
              { label: "Pipeline coverage", value: "3.4x" },
              { label: "Forecast accuracy", value: "±2.1%" },
            ].map((m) => (
              <div key={m.label} className="flex flex-col gap-3">
                <span className="text-xs tracking-wide text-(--ink-faint) uppercase">
                  {m.label}
                </span>
                <div className="flex h-16 items-end gap-1.5">
                  {[40, 65, 50, 80, 70, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-(--accent)"
                      style={{ height: `${h}%`, opacity: 0.4 + i * 0.1 }}
                    />
                  ))}
                </div>
                <span className="font-[family-name:var(--font-display)] text-2xl text-(--ink)">
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        }
      />

      <Marquee items={["Northline", "Verdant Capital", "Ostro Labs", "Fieldstone", "Anchorpoint", "Kelvin & Co"]} />

      <Section
        id="product"
        eyebrow="Product"
        title="Every team, one number"
        description="Finance stops reconciling spreadsheets. Sales stops guessing at close dates. Everyone reads from the same live instrument."
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} title={f.title} description={f.description} delay={i * 0.05} />
          ))}
        </div>
      </Section>

      <Section eyebrow="How it works" title="Live in an afternoon">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n}>
              <span className="font-[family-name:var(--font-display)] text-3xl text-(--accent) italic">
                {s.n}
              </span>
              <h3 className="mt-4 text-lg text-(--ink)">{s.title}</h3>
              <p className="mt-2 text-sm text-(--ink-dim)">{s.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="border-y border-(--line)" id="customers">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <Stat value="4,200+" label="Companies forecasting on Aperture" />
          <Stat value="$38B" label="Pipeline tracked monthly" delay={0.05} />
          <Stat value="99.98%" label="Platform uptime, trailing year" delay={0.1} />
          <Stat value="11 min" label="Median time to first insight" delay={0.15} />
        </div>
      </Section>

      <Section>
        <Quote
          quote="We closed our books three days faster the first month, and finance and sales finally argue about strategy instead of whose number is right."
          name="Priya Anand"
          role="VP Revenue Operations, Fieldstone"
        />
      </Section>

      <Section id="pricing" eyebrow="Pricing" title="Straightforward, by seat">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <PricingCard
            name="Team"
            price="$79"
            period="seat/mo"
            description="For teams under 25 replacing spreadsheets."
            features={["Up to 3 data sources", "Standard forecasting models", "Shared dashboards", "Email support"]}
            cta={{ label: "Start free trial", href: "#" }}
          />
          <PricingCard
            name="Growth"
            price="$149"
            period="seat/mo"
            description="For revenue teams standardizing on one number."
            features={[
              "Unlimited data sources",
              "Confidence-interval forecasting",
              "Anomaly alerts",
              "Role-based access",
              "Priority support",
            ]}
            cta={{ label: "Start free trial", href: "#" }}
            featured
            delay={0.05}
          />
          <PricingCard
            name="Enterprise"
            price="Custom"
            description="For multi-entity organizations with compliance needs."
            features={["SSO & SCIM", "Dedicated success engineer", "Custom data residency", "99.99% SLA"]}
            cta={{ label: "Talk to sales", href: "#" }}
            delay={0.1}
          />
        </div>
      </Section>

      <CTA
        title="Stop reconciling. Start forecasting."
        subtitle="Fourteen days, every feature, no card required."
        primaryCta={{ label: "Start free trial", href: "#" }}
        secondaryCta={{ label: "Book a demo", href: "#" }}
      />

      <Footer
        name="Aperture"
        tagline="Revenue operations for teams who make one number the truth."
        links={[
          { label: "Product", href: "#product" },
          { label: "Pricing", href: "#pricing" },
          { label: "Security", href: "#" },
          { label: "Status", href: "#" },
        ]}
      />
    </div>
  );
}
