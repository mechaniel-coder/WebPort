import type { ReactNode } from "react";

export default function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-5xl px-6 py-24 md:py-32 ${className}`}>
      {(eyebrow || title || description) && (
        <div className="mb-14 max-w-2xl">
          {eyebrow ? (
            <p className="mb-4 text-xs tracking-[0.2em] text-(--accent) uppercase">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 className="font-[family-name:var(--font-display)] text-3xl text-(--ink) md:text-4xl">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-4 text-(--ink-dim)">{description}</p>
          ) : null}
        </div>
      )}
      {children}
    </section>
  );
}
