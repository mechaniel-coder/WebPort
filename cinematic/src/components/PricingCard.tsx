import Reveal from "@/components/Reveal";

export default function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  featured = false,
  delay = 0,
}: {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: { label: string; href: string };
  featured?: boolean;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <div
        className={`flex h-full flex-col gap-6 rounded-(--radius-xl) p-8 ${
          featured
            ? "border-2 border-(--accent) bg-(--bg-raised) shadow-[var(--shadow-3)]"
            : "glass shadow-[var(--shadow-2)]"
        }`}
      >
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-xl text-(--ink)">
            {name}
          </h3>
          <p className="mt-2 text-sm text-(--ink-dim)">{description}</p>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-[family-name:var(--font-display)] text-4xl text-(--ink)">
            {price}
          </span>
          {period ? <span className="text-sm text-(--ink-dim)">/{period}</span> : null}
        </div>
        <ul className="flex flex-1 flex-col gap-3 text-sm text-(--ink-dim)">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <span className="mt-1 text-(--accent)">&#10003;</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <a
          href={cta.href}
          className={`mt-2 rounded-full px-5 py-3 text-center text-sm font-medium transition-transform hover:scale-[1.02] ${
            featured
              ? "bg-(--accent) text-(--accent-ink)"
              : "border border-(--line) text-(--ink)"
          }`}
        >
          {cta.label}
        </a>
      </div>
    </Reveal>
  );
}
