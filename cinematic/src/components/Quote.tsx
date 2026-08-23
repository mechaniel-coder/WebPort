import Reveal from "@/components/Reveal";

export default function Quote({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <Reveal>
      <blockquote className="mx-auto max-w-3xl text-center">
        <p className="font-[family-name:var(--font-display)] text-2xl leading-snug text-(--ink) italic md:text-3xl">
          &ldquo;{quote}&rdquo;
        </p>
        <footer className="mt-6 text-sm text-(--ink-dim)">
          <span className="text-(--ink)">{name}</span> — {role}
        </footer>
      </blockquote>
    </Reveal>
  );
}
