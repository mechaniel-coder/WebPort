import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";
import Stat from "@/components/Stat";
import Quote from "@/components/Quote";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Halide — a studio for brands with a spine",
  description: "Halide is a ten-person creative studio building identity, motion and web for brands who take a position.",
};

const NAV_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Studio", href: "#studio" },
];

const CAPABILITIES = [
  "Identity systems",
  "Motion & film",
  "Web design & build",
  "Naming & verbal identity",
  "Packaging",
  "Art direction",
];

const WORK = [
  { title: "Anchorpoint", result: "+64% direct booking", tag: "Hospitality identity" },
  { title: "Ostro Records", result: "3 Cannes selections", tag: "Brand film" },
  { title: "Verdant Capital", result: "Rebrand across 12 markets", tag: "Identity system" },
];

export default function AgencyPage() {
  return (
    <div data-site="agency">
      <Nav name="Halide" links={NAV_LINKS} cta={{ label: "Start a project", href: "#studio" }} />
      <Hero
        eyebrow="Creative studio, ten people, no account managers"
        title="We take twelve clients a year. On purpose."
        subtitle="Halide builds identity, motion and web for brands willing to take a position. Every project is led by the same two people who pitch it — that's the whole model."
        primaryCta={{ label: "Start a project", href: "#studio" }}
        secondaryCta={{ label: "See the work", href: "#work" }}
      />

      <Section id="capabilities" eyebrow="Capabilities" title="Narrow on purpose">
        <div className="flex flex-wrap gap-3">
          {CAPABILITIES.map((c, i) => (
            <Reveal key={c} delay={i * 0.04}>
              <span className="glass inline-block rounded-full px-5 py-2.5 text-sm text-(--ink)">
                {c}
              </span>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="work" eyebrow="Selected work" title="Results, not just renders">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {WORK.map((w, i) => (
            <Reveal key={w.title} delay={i * 0.06}>
              <div className="glass flex h-full flex-col justify-between gap-8 rounded-(--radius-xl) p-7 shadow-[var(--shadow-2)]">
                <span className="text-xs tracking-[0.2em] text-(--accent) uppercase">{w.tag}</span>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl text-(--ink) italic">
                    {w.title}
                  </h3>
                  <p className="mt-3 text-sm text-(--ink-dim)">{w.result}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="border-y border-(--line)">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <Stat value="12" label="Clients a year, by design" />
          <Stat value="9 yrs" label="Average client relationship" delay={0.05} />
          <Stat value="2" label="Founders on every project" delay={0.1} />
          <Stat value="0" label="Account managers" delay={0.15} />
        </div>
      </Section>

      <Section id="studio" eyebrow="Studio" title="How we work">
        <Reveal>
          <p className="max-w-2xl text-(--ink-dim)">
            No account layer between you and the people making decisions. Every engagement starts
            with a two-week diagnostic — we tell you what we think is actually wrong before we
            propose what to build. If the diagnostic says you don&rsquo;t need us, we say so and
            invoice for the two weeks. It has happened four times. We&rsquo;d rather be right than
            billable.
          </p>
        </Reveal>
      </Section>

      <Section>
        <Quote
          quote="Most studios pitch you a deck. Halide pitched us a reason our last three rebrands hadn't worked. We hired them for the diagnosis before we'd seen a single mockup."
          name="Marcus Webb"
          role="CEO, Anchorpoint Hotels"
        />
      </Section>

      <CTA
        title="Twelve slots a year. Four are open."
        subtitle="Diagnostics booked six weeks out. Worth the wait."
        primaryCta={{ label: "Start a project", href: "#" }}
        secondaryCta={{ label: "See the work", href: "#work" }}
      />

      <Footer
        name="Halide"
        tagline="A ten-person studio building identity, motion and web for brands with a spine."
        links={[
          { label: "Work", href: "#work" },
          { label: "Capabilities", href: "#capabilities" },
          { label: "Studio", href: "#studio" },
          { label: "Careers", href: "#" },
        ]}
      />
    </div>
  );
}
