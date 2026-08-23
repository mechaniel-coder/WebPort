import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

export default function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <div className="glass flex h-full flex-col gap-4 rounded-(--radius-xl) p-7 shadow-[var(--shadow-2)] transition-shadow hover:shadow-[var(--shadow-3)]">
        {icon ? (
          <div className="flex size-10 items-center justify-center rounded-(--radius-md) bg-(--accent-soft) text-(--accent)">
            {icon}
          </div>
        ) : null}
        <h3 className="font-[family-name:var(--font-display)] text-xl text-(--ink)">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-(--ink-dim)">{description}</p>
      </div>
    </Reveal>
  );
}
