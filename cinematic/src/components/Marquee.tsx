export default function Marquee({ items }: { items: string[] }) {
  const loop = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-(--line) py-6">
      <div className="animate-marquee flex w-max gap-16">
        {loop.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="font-[family-name:var(--font-display)] text-2xl whitespace-nowrap text-(--ink-faint) italic"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
