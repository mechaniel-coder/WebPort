import Reveal from "@/components/Reveal";

export default function Stat({
  value,
  label,
  delay = 0,
}: {
  value: string;
  label: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="flex flex-col gap-2">
        <span className="font-[family-name:var(--font-display)] text-4xl text-(--ink) md:text-5xl">
          {value}
        </span>
        <span className="text-sm text-(--ink-dim)">{label}</span>
      </div>
    </Reveal>
  );
}
