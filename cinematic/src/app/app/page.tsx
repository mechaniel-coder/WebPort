import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import FeatureCard from "@/components/FeatureCard";
import Stat from "@/components/Stat";
import Quote from "@/components/Quote";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Cadence — training that reads your body, not just your pace",
  description: "Cadence is a running app that adjusts your plan daily from sleep, HRV and how the last run actually felt.",
};

const NAV_LINKS = [
  { label: "How it works", href: "#how" },
  { label: "Plans", href: "#plans" },
  { label: "Reviews", href: "#reviews" },
];

const FEATURES = [
  {
    title: "Plans that move with you",
    description: "Miss a run or sleep badly, and tomorrow's session adjusts automatically — no guilt, no rigid template.",
  },
  {
    title: "Built on real recovery data",
    description: "HRV, resting heart rate and sleep stages, read from your watch, feed directly into tomorrow's intensity.",
  },
  {
    title: "A coach who explains itself",
    description: "Every adjustment comes with the one sentence of reasoning behind it — never a black box.",
  },
];

export default function AppPage() {
  return (
    <div data-site="app">
      <Nav name="Cadence" links={NAV_LINKS} cta={{ label: "Get the app", href: "#plans" }} />
      <Hero
        eyebrow="For runners training for something specific"
        title="Your plan, rewritten every morning."
        subtitle="Cadence reads last night's sleep and this week's fatigue and rebuilds today's session before you've opened the app. No spreadsheet, no guessing whether to push or rest."
        primaryCta={{ label: "Get the app", href: "#plans" }}
        secondaryCta={{ label: "See how it works", href: "#how" }}
        aside={
          <div className="mx-auto flex max-w-xs justify-center">
            <div className="glass w-full max-w-[240px] rounded-[2.5rem] p-3 shadow-[var(--shadow-3)]">
              <div className="rounded-[2rem] bg-(--bg-raised) p-5">
                <p className="text-xs text-(--ink-faint)">Today &middot; Tuesday</p>
                <p className="mt-2 font-[family-name:var(--font-display)] text-2xl text-(--ink) italic">
                  Easy 6mi
                </p>
                <p className="mt-1 text-xs text-(--ink-dim)">Adjusted from tempo — HRV down 18%</p>
                <div className="mt-6 flex items-end gap-1">
                  {[30, 45, 38, 60, 50, 70, 42].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-sm bg-(--accent)" style={{ height: `${h}px`, opacity: 0.5 + i * 0.06 }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        }
      />

      <Section id="how" eyebrow="How it works" title="Three inputs, one honest plan">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} title={f.title} description={f.description} delay={i * 0.05} />
          ))}
        </div>
      </Section>

      <Section className="border-y border-(--line)">
        <div className="grid grid-cols-3 gap-10">
          <Stat value="4.8" label="Average App Store rating" />
          <Stat value="210k" label="Training plans adjusted this week" delay={0.05} />
          <Stat value="61%" label="Fewer overtraining flags vs. fixed plans" delay={0.1} />
        </div>
      </Section>

      <Section id="reviews">
        <Quote
          quote="First app that told me to skip a workout instead of guilting me into it. I finished my marathon block without a single injury for the first time in four tries."
          name="Dana R."
          role="3:14 marathoner, Cadence user since 2024"
        />
      </Section>

      <Section id="plans" eyebrow="Plans" title="Free to start, honest about the rest">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="glass rounded-(--radius-xl) p-8">
            <h3 className="font-[family-name:var(--font-display)] text-xl text-(--ink)">Free</h3>
            <p className="mt-2 text-sm text-(--ink-dim)">Pace tracking and one adaptive plan.</p>
            <p className="mt-6 font-[family-name:var(--font-display)] text-3xl text-(--ink)">$0</p>
          </div>
          <div className="rounded-(--radius-xl) border-2 border-(--accent) bg-(--bg-raised) p-8 shadow-[var(--shadow-3)]">
            <h3 className="font-[family-name:var(--font-display)] text-xl text-(--ink)">Cadence+</h3>
            <p className="mt-2 text-sm text-(--ink-dim)">Full recovery integration and race-specific blocks.</p>
            <p className="mt-6 font-[family-name:var(--font-display)] text-3xl text-(--ink)">
              $9<span className="text-base text-(--ink-dim)">/mo</span>
            </p>
          </div>
        </div>
      </Section>

      <CTA
        title="Stop guessing what today's run should be."
        subtitle="Available on iOS and Android. Syncs with Garmin, Apple Watch and Whoop."
        primaryCta={{ label: "Get the app", href: "#" }}
      />

      <Footer
        name="Cadence"
        tagline="Training plans that adjust to your real recovery, every single day."
        links={[
          { label: "How it works", href: "#how" },
          { label: "Plans", href: "#plans" },
          { label: "Support", href: "#" },
          { label: "Privacy", href: "#" },
        ]}
      />
    </div>
  );
}
