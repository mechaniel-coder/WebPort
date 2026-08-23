import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";
import Quote from "@/components/Quote";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Fennimore — leather goods, made to outlive the warranty",
  description: "Fennimore builds leather bags and small goods from full-grain hide, repaired for life.",
};

const NAV_LINKS = [
  { label: "Shop", href: "#shop" },
  { label: "Materials", href: "#materials" },
  { label: "Repair promise", href: "#repair" },
];

const PRODUCTS = [
  { name: "The Weekender", price: "$680", tone: "linear-gradient(160deg,#3a2a1c,#0e0a06)" },
  { name: "The Field Tote", price: "$420", tone: "linear-gradient(160deg,#4a3626,#100b07)" },
  { name: "The Card Case", price: "$95", tone: "linear-gradient(160deg,#2c2018,#080604)" },
  { name: "The Portfolio", price: "$310", tone: "linear-gradient(160deg,#3f2e20,#0c0806)" },
];

export default function EcommercePage() {
  return (
    <div data-site="ecommerce">
      <Nav name="Fennimore" links={NAV_LINKS} cta={{ label: "Shop the collection", href: "#shop" }} />
      <Hero
        eyebrow="Full-grain leather, cut in Porto"
        title="A bag you'll hand down, not replace."
        subtitle="Fennimore makes leather goods from a single tannery's full-grain hide, built with a repair promise instead of a warranty exclusion list. Every piece ages into something better."
        primaryCta={{ label: "Shop the collection", href: "#shop" }}
        secondaryCta={{ label: "Our materials", href: "#materials" }}
      />

      <Section id="shop" eyebrow="Shop" title="Four pieces. That's the whole line.">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.05}>
              <a href="#" className="group block">
                <div
                  className="aspect-[4/5] rounded-(--radius-lg) shadow-[var(--shadow-2)] transition-shadow group-hover:shadow-[var(--shadow-3)]"
                  style={{ background: p.tone }}
                />
                <div className="mt-4 flex items-center justify-between">
                  <h3 className="text-(--ink)">{p.name}</h3>
                  <span className="text-sm text-(--ink-dim)">{p.price}</span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="materials" eyebrow="Materials" title="One tannery, one hide, no substitutions">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <Reveal>
            <h3 className="font-[family-name:var(--font-display)] text-xl text-(--ink) italic">
              Vegetable-tanned
            </h3>
            <p className="mt-3 text-sm text-(--ink-dim)">
              No chrome, no shortcuts — a six-week tanning process that darkens with light and use
              instead of cracking.
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h3 className="font-[family-name:var(--font-display)] text-xl text-(--ink) italic">
              Solid brass hardware
            </h3>
            <p className="mt-3 text-sm text-(--ink-dim)">
              Cast, not stamped. It develops a patina instead of a plating flake.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h3 className="font-[family-name:var(--font-display)] text-xl text-(--ink) italic">
              Saddle-stitched
            </h3>
            <p className="mt-3 text-sm text-(--ink-dim)">
              Two needles, one thread, hand-pulled — a seam that fails one stitch at a time, not
              all at once.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section id="repair" eyebrow="Repair promise" title="We'll fix it. Every time. Forever.">
        <Reveal>
          <p className="max-w-2xl text-(--ink-dim)">
            Ship anything you bought from us back to Porto and we&rsquo;ll repair it at cost of
            materials only — no matter how old it is, no receipt required. We keep the pattern
            for every piece we&rsquo;ve ever cut.
          </p>
        </Reveal>
      </Section>

      <Section>
        <Quote
          quote="I bought the Weekender in 2019. It's flown with me forty-some times and looks better now than it did new. They repaired a strap for eleven dollars in materials."
          name="Jonah J."
          role="Verified buyer"
        />
      </Section>

      <CTA
        title="Buy it once."
        subtitle="Free shipping over $200. Thirty-day returns, no restocking fee."
        primaryCta={{ label: "Shop the collection", href: "#shop" }}
      />

      <Footer
        name="Fennimore"
        tagline="Leather goods cut in Porto, repaired for life."
        links={[
          { label: "Shop", href: "#shop" },
          { label: "Materials", href: "#materials" },
          { label: "Repair promise", href: "#repair" },
          { label: "Shipping", href: "#" },
        ]}
      />
    </div>
  );
}
