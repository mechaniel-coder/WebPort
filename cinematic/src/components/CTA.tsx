import Reveal from "@/components/Reveal";

export default function CTA({
  title,
  subtitle,
  primaryCta,
  secondaryCta,
}: {
  title: string;
  subtitle?: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <Reveal>
        <div className="glass relative overflow-hidden rounded-(--radius-xl) px-8 py-16 text-center shadow-[var(--shadow-3)] md:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 80% at 50% 100%, var(--accent-soft), transparent 70%)",
            }}
          />
          <h2 className="relative font-[family-name:var(--font-display)] text-3xl text-(--ink) italic md:text-5xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="relative mx-auto mt-5 max-w-lg text-(--ink-dim)">{subtitle}</p>
          ) : null}
          <div className="relative mt-9 flex flex-wrap items-center justify-center gap-4">
            <a
              href={primaryCta.href}
              className="rounded-full bg-(--accent) px-7 py-3 text-sm font-medium text-(--accent-ink) transition-transform hover:scale-[1.03]"
            >
              {primaryCta.label}
            </a>
            {secondaryCta ? (
              <a
                href={secondaryCta.href}
                className="rounded-full border border-(--line) px-7 py-3 text-sm font-medium text-(--ink) transition-colors hover:border-(--accent)"
              >
                {secondaryCta.label}
              </a>
            ) : null}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
