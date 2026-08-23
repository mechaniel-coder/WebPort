import Link from "next/link";
import Reveal from "@/components/Reveal";
import { SITES } from "@/lib/sites";

export default function IndexPage() {
  return (
    <div data-site="index" className="mx-auto max-w-5xl px-6 py-24">
      <header className="mb-20 max-w-2xl">
        <p className="mb-4 text-xs tracking-[0.2em] text-(--ink-faint) uppercase">
          Cinematic — a kit of eight
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-5xl leading-[1.05] text-(--ink) italic md:text-6xl">
          One token system. Eight identities.
        </h1>
        <p className="mt-6 text-lg text-(--ink-dim)">
          Eight full landing pages, one per Cinematic Kit site category, sharing a single design
          system — near-black ground, giant serif display type, film grain and glass — with only
          the accent colour changing per site.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {SITES.map((site, i) => (
          <Reveal key={site.slug} delay={i * 0.04}>
            <Link
              href={`/${site.slug}`}
              className="group relative block overflow-hidden rounded-(--radius-xl) border border-(--line) bg-(--bg-raised) p-8 shadow-[var(--shadow-2)] transition-transform hover:-translate-y-1"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(60% 60% at 50% 0%, ${site.accent}22, transparent 70%)`,
                }}
              />
              <span
                className="relative text-xs tracking-[0.2em] uppercase"
                style={{ color: site.accent }}
              >
                {site.category}
              </span>
              <h2 className="relative mt-3 font-[family-name:var(--font-display)] text-3xl text-(--ink) italic">
                {site.name}
              </h2>
              <p className="relative mt-3 text-sm text-(--ink-dim)">{site.headline}</p>
              <span className="relative mt-6 inline-block text-sm text-(--ink) opacity-70 transition-opacity group-hover:opacity-100">
                View site →
              </span>
            </Link>
          </Reveal>
        ))}
      </div>

      <footer className="mt-24 border-t border-(--line) pt-8 text-xs text-(--ink-faint)">
        <p>
          Built with Next.js, Tailwind CSS and Framer Motion. All copy, names and metrics on
          these pages are fictional demonstration content.
        </p>
      </footer>
    </div>
  );
}
