import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import FeatureCard from "@/components/FeatureCard";
import Reveal from "@/components/Reveal";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Fragment 002 — a limited drop",
  description: "Fragment 002 releases in a single run of 500. No restock, no back order.",
};

const NAV_LINKS = [
  { label: "The drop", href: "#drop" },
  { label: "Specs", href: "#specs" },
  { label: "FAQ", href: "#faq" },
];

const SPECS = [
  { title: "Run size", description: "500 units, individually numbered. No second run, ever." },
  { title: "Materials", description: "Cold-forged aluminum shell, sapphire crystal face, vegetable-tanned strap." },
  { title: "Assembly", description: "Built by hand in a four-person workshop, twelve units a day." },
  { title: "Provenance", description: "Each unit ships with a signed certificate and its place in the run." },
];

export default function LaunchPage() {
  return (
    <div data-site="launch">
      <Nav name="Fragment" links={NAV_LINKS} cta={{ label: "Reserve — 214 left", href: "#drop" }} />
      <Hero
        eyebrow="Drop 002 · closes when it closes"
        title="Five hundred. Then it's gone."
        subtitle="Fragment 002 is a single run, numbered by hand, released once. We won't make more, and we won't tell you it's the last chance twice — this is the only time we say it."
        primaryCta={{ label: "Reserve yours", href: "#drop" }}
        secondaryCta={{ label: "See the build", href: "#specs" }}
        aside={
          <div className="glass mx-auto flex max-w-md items-center justify-between rounded-(--radius-xl) p-6 shadow-[var(--shadow-3)]">
            <div>
              <p className="text-xs tracking-[0.2em] text-(--ink-faint) uppercase">Units remaining</p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-4xl text-(--ink)">
                214 <span className="text-lg text-(--ink-dim)">/ 500</span>
              </p>
            </div>
            <div className="h-2 w-32 overflow-hidden rounded-full bg-(--line)">
              <div className="h-full w-[57%] rounded-full bg-(--accent)" />
            </div>
          </div>
        }
      />

      <Section id="drop" eyebrow="The drop" title="One object, no variants">
        <Reveal>
          <p className="max-w-2xl text-(--ink-dim)">
            Fragment 002 comes in a single finish. No colorways, no bundles, no
            &ldquo;special edition of the special edition.&rdquo; The scarcity is the run size,
            not a marketing tactic layered on top of it.
          </p>
        </Reveal>
      </Section>

      <Section id="specs" eyebrow="Specification" title="Built to outlast the hype cycle">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {SPECS.map((s, i) => (
            <FeatureCard key={s.title} title={s.title} description={s.description} delay={i * 0.05} />
          ))}
        </div>
      </Section>

      <Section id="faq" eyebrow="FAQ" title="Before you reserve">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {[
            {
              q: "Is there a restock?",
              a: "No. When the counter hits zero, the product page comes down and Fragment 002 is retired.",
            },
            {
              q: "Can I return it?",
              a: "Thirty days, unworn, in original packaging — same as anything else we sell.",
            },
            {
              q: "When does it ship?",
              a: "Reservations ship in numbered order, six weeks from close, at roughly forty units a week.",
            },
            {
              q: "Is Fragment 001 still available?",
              a: "No — that run closed in 2024. This is exactly why we keep the runs this small.",
            },
          ].map((f, i) => (
            <Reveal key={f.q} delay={i * 0.05}>
              <div className="border-b border-(--line) pb-6">
                <h3 className="text-(--ink)">{f.q}</h3>
                <p className="mt-2 text-sm text-(--ink-dim)">{f.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <CTA
        title="214 left. Then never again."
        subtitle="Reservation holds your number in the run for 15 minutes at checkout."
        primaryCta={{ label: "Reserve yours", href: "#" }}
      />

      <Footer
        name="Fragment"
        tagline="Limited-run objects, built once and never reissued."
        links={[
          { label: "The drop", href: "#drop" },
          { label: "Specs", href: "#specs" },
          { label: "Shipping", href: "#" },
          { label: "Contact", href: "#" },
        ]}
      />
    </div>
  );
}
