import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";
import Quote from "@/components/Quote";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Solace — a membership, not a booking",
  description: "Solace is a private travel membership for 300 households, arranging journeys no public itinerary offers.",
};

const NAV_LINKS = [
  { label: "Membership", href: "#membership" },
  { label: "Journeys", href: "#journeys" },
  { label: "Apply", href: "#apply" },
];

const JOURNEYS = [
  { title: "Private access, Kyoto's closed gardens", tag: "Japan, spring" },
  { title: "A single villa, all of Comporta", tag: "Portugal, summer" },
  { title: "Northern lights, by private rail", tag: "Norway, winter" },
];

export default function LuxuryPage() {
  return (
    <div data-site="luxury">
      <Nav name="Solace" links={NAV_LINKS} cta={{ label: "Apply for membership", href: "#apply" }} />
      <Hero
        eyebrow="A membership, capped at 300 households"
        title="We don't sell trips. We arrange access."
        subtitle="Solace is a private travel membership — closed gardens, private collections, chefs who don't take reservations. Each journey is built once, for one household, and never repeated for another."
        primaryCta={{ label: "Apply for membership", href: "#apply" }}
        secondaryCta={{ label: "See recent journeys", href: "#journeys" }}
      />

      <Section id="membership" eyebrow="Membership" title="What membership actually means">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <Reveal>
            <h3 className="font-[family-name:var(--font-display)] text-xl text-(--ink) italic">
              A single point of contact
            </h3>
            <p className="mt-3 text-sm text-(--ink-dim)">
              One advisor, reachable directly, who has already been to everywhere they recommend.
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h3 className="font-[family-name:var(--font-display)] text-xl text-(--ink) italic">
              Access, not itineraries
            </h3>
            <p className="mt-3 text-sm text-(--ink-dim)">
              Relationships built over fifteen years with private collections, closed estates and
              chefs who take no public bookings.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h3 className="font-[family-name:var(--font-display)] text-xl text-(--ink) italic">
              Never resold
            </h3>
            <p className="mt-3 text-sm text-(--ink-dim)">
              An itinerary built for you is retired after your journey — the next member gets
              something built from nothing.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section id="journeys" eyebrow="Recent journeys" title="Built once, for one household">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {JOURNEYS.map((j, i) => (
            <Reveal key={j.title} delay={i * 0.06}>
              <div
                className="flex aspect-[3/4] flex-col justify-end rounded-(--radius-xl) p-6 shadow-[var(--shadow-2)]"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7)), linear-gradient(160deg, #2a2318, #0a0806)",
                }}
              >
                <span className="text-xs tracking-[0.2em] text-(--accent) uppercase">{j.tag}</span>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl text-(--ink) italic">
                  {j.title}
                </h3>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <Quote
          quote="They arranged three hours alone in a garden that's been closed to visitors since 1987. I didn't ask how. I've stopped asking how, honestly."
          name="A member, since 2019"
          role="Household of four, London"
        />
      </Section>

      <Section id="apply" eyebrow="Apply" title="Membership by application, not by payment">
        <Reveal>
          <p className="max-w-2xl text-(--ink-dim)">
            We review applications twice a year and admit roughly twenty households per cycle.
            There is an annual fee, disclosed after acceptance — we&rsquo;ve found leading with the
            number attracts the wrong conversation.
          </p>
        </Reveal>
      </Section>

      <CTA
        title="300 households. A waiting list, not a checkout."
        subtitle="Applications for the spring cycle close March 1st."
        primaryCta={{ label: "Apply for membership", href: "#" }}
      />

      <Footer
        name="Solace"
        tagline="A private travel membership arranging access no public itinerary offers."
        links={[
          { label: "Membership", href: "#membership" },
          { label: "Journeys", href: "#journeys" },
          { label: "Apply", href: "#apply" },
          { label: "Contact", href: "#" },
        ]}
      />
    </div>
  );
}
