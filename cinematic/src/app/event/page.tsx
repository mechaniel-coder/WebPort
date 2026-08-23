import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";
import Stat from "@/components/Stat";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Meridian — a summit for people who ship",
  description: "Meridian is a two-day, 400-person summit for operators building revenue infrastructure.",
};

const NAV_LINKS = [
  { label: "Schedule", href: "#schedule" },
  { label: "Speakers", href: "#speakers" },
  { label: "Venue", href: "#venue" },
];

const SCHEDULE = [
  { time: "09:00", title: "Doors & coffee", track: "Main hall" },
  { time: "10:00", title: "Opening keynote — The instrumented company", track: "Main hall" },
  { time: "11:30", title: "Panel — Forecasting under uncertainty", track: "Main hall" },
  { time: "14:00", title: "Workshops — pick one of four", track: "Breakout" },
  { time: "18:30", title: "Dinner & unstructured time", track: "Rooftop" },
];

const SPEAKERS = [
  { name: "Priya Anand", role: "VP Revenue Ops, Fieldstone" },
  { name: "Marcus Webb", role: "CEO, Anchorpoint Hotels" },
  { name: "Elin Voss", role: "Creative Director, Halide Studio" },
  { name: "Jonas Reyes", role: "Founder, Ostro Labs" },
];

export default function EventPage() {
  return (
    <div data-site="event">
      <Nav name="Meridian" links={NAV_LINKS} cta={{ label: "Reserve a seat", href: "#schedule" }} />
      <Hero
        eyebrow="March 14–15 · Lisbon"
        title="Four hundred seats. No livestream."
        subtitle="Meridian is a two-day summit for operators building the systems revenue actually runs on. Deliberately small, deliberately in-person — the hallway conversation is the point."
        primaryCta={{ label: "Reserve a seat", href: "#schedule" }}
        secondaryCta={{ label: "Meet the speakers", href: "#speakers" }}
      />

      <Section className="border-y border-(--line)">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <Stat value="400" label="Seats, capped" />
          <Stat value="2" label="Days" delay={0.05} />
          <Stat value="24" label="Sessions across 4 tracks" delay={0.1} />
          <Stat value="3rd" label="Year running" delay={0.15} />
        </div>
      </Section>

      <Section id="schedule" eyebrow="Day one" title="A schedule with room to breathe">
        <div className="flex flex-col gap-px overflow-hidden rounded-(--radius-xl) border border-(--line)">
          {SCHEDULE.map((s, i) => (
            <Reveal key={s.time} delay={i * 0.04}>
              <div className="flex items-center gap-6 bg-(--bg-raised) px-6 py-5">
                <span className="w-14 shrink-0 font-[family-name:var(--font-display)] text-lg text-(--accent)">
                  {s.time}
                </span>
                <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
                  <span className="text-(--ink)">{s.title}</span>
                  <span className="text-xs text-(--ink-faint)">{s.track}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="speakers" eyebrow="Speakers" title="People who did the thing, not people who watched it happen">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {SPEAKERS.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.05}>
              <div className="glass rounded-(--radius-lg) p-5 text-center">
                <div className="mx-auto size-16 rounded-full bg-(--accent-soft)" />
                <p className="mt-4 text-(--ink)">{s.name}</p>
                <p className="mt-1 text-xs text-(--ink-dim)">{s.role}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="venue" eyebrow="Venue" title="LX Factory, Lisbon">
        <Reveal>
          <p className="max-w-2xl text-(--ink-dim)">
            A converted industrial complex on the river, five minutes from the airport by taxi.
            Room block held at three nearby hotels until February 1st — link sent after
            registration.
          </p>
        </Reveal>
      </Section>

      <CTA
        title="Seats go in order of registration, not payment."
        subtitle="Early rate ends January 15th. 71 seats remaining."
        primaryCta={{ label: "Reserve a seat", href: "#" }}
      />

      <Footer
        name="Meridian"
        tagline="A two-day summit for operators building revenue infrastructure."
        links={[
          { label: "Schedule", href: "#schedule" },
          { label: "Speakers", href: "#speakers" },
          { label: "Venue", href: "#venue" },
          { label: "Past years", href: "#" },
        ]}
      />
    </div>
  );
}
