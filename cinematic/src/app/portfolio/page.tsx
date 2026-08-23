import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";
import Quote from "@/components/Quote";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Noctis — direction & motion",
  description: "The portfolio of Noctis, a director working across film, motion and brand identity.",
};

const NAV_LINKS = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const WORK = [
  { title: "Fathom", client: "Ostro Records", year: "2025", tag: "Music video" },
  { title: "Undertow", client: "Verdant Capital", year: "2024", tag: "Brand film" },
  { title: "Halide Rebrand", client: "Halide Studio", year: "2024", tag: "Identity + motion" },
  { title: "Nine Rooms", client: "Anchorpoint Hotels", year: "2023", tag: "Short documentary" },
];

export default function PortfolioPage() {
  return (
    <div data-site="portfolio">
      <Nav name="Noctis" links={NAV_LINKS} cta={{ label: "Start a project", href: "#contact" }} />
      <Hero
        eyebrow="Director & motion designer"
        title="Stillness, held a second too long."
        subtitle="I make films and motion systems for brands who'd rather be remembered than recalled. Twelve years, four continents, one visual language: restraint that pays off."
        primaryCta={{ label: "View the reel", href: "#work" }}
        secondaryCta={{ label: "About the work", href: "#about" }}
      />

      <Section id="work" eyebrow="Selected work" title="A reel, not a résumé">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-(--radius-xl) border border-(--line) md:grid-cols-2">
          {WORK.map((w, i) => (
            <Reveal key={w.title} delay={i * 0.05}>
              <a
                href="#"
                className="group flex h-full flex-col justify-between gap-10 bg-(--bg-raised) p-8 transition-colors hover:bg-(--bg)"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs tracking-[0.2em] text-(--ink-faint) uppercase">
                    {w.tag}
                  </span>
                  <span className="text-xs text-(--ink-faint)">{w.year}</span>
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-3xl text-(--ink) italic transition-transform group-hover:translate-x-1">
                    {w.title}
                  </h3>
                  <p className="mt-2 text-sm text-(--ink-dim)">{w.client}</p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="about" eyebrow="About" title="Twelve years behind the camera, and in front of the timeline">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <Reveal className="md:col-span-2">
            <p className="text-(--ink-dim)">
              I started as an editor, which means I still think in cuts before I think in shots.
              Every project moves through the same discipline: a brief written down before a
              single frame is captured, a palette locked before the shoot, and a motion system
              built once so the client&rsquo;s next five deliverables don&rsquo;t need to reinvent it.
            </p>
            <p className="mt-4 text-(--ink-dim)">
              Recent work spans music video, brand film and the motion identity systems that keep
              a brand consistent from a 30-second spot down to a loading spinner. Based in
              Lisbon, working everywhere.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="flex flex-col gap-4 text-sm text-(--ink-dim)">
              <li className="flex justify-between border-b border-(--line) pb-3">
                <span>Directed</span>
                <span className="text-(--ink)">47 films</span>
              </li>
              <li className="flex justify-between border-b border-(--line) pb-3">
                <span>Award selections</span>
                <span className="text-(--ink)">Cannes, Vimeo Staff Pick x6</span>
              </li>
              <li className="flex justify-between border-b border-(--line) pb-3">
                <span>Studio</span>
                <span className="text-(--ink)">Lisbon / remote</span>
              </li>
            </ul>
          </Reveal>
        </div>
      </Section>

      <Section>
        <Quote
          quote="Noctis delivered a brand film and, without being asked, a motion system our internal team has used for two years since. Rare to get both."
          name="Elin Voss"
          role="Creative Director, Halide Studio"
        />
      </Section>

      <CTA
        title="Have a story worth slowing down for?"
        subtitle="Currently booking for spring. Replies within two business days."
        primaryCta={{ label: "Start a project", href: "#contact" }}
      />

      <Footer
        name="Noctis"
        tagline="Direction and motion design for brands built to last past the campaign."
        links={[
          { label: "Work", href: "#work" },
          { label: "About", href: "#about" },
          { label: "Instagram", href: "#" },
          { label: "Vimeo", href: "#" },
        ]}
      />
    </div>
  );
}
