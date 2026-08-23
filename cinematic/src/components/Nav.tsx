import Link from "next/link";

export default function Nav({
  name,
  links,
  cta,
}: {
  name: string;
  links: { label: string; href: string }[];
  cta?: { label: string; href: string };
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav className="glass flex w-full max-w-5xl items-center justify-between rounded-full px-5 py-3">
        <Link
          href="#top"
          className="font-[family-name:var(--font-display)] text-lg tracking-tight text-(--ink)"
        >
          {name}
        </Link>
        <ul className="hidden items-center gap-8 text-sm text-(--ink-dim) md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="transition-colors hover:text-(--ink)">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        {cta ? (
          <a
            href={cta.href}
            className="rounded-full bg-(--accent) px-4 py-2 text-sm font-medium text-(--accent-ink) transition-transform hover:scale-[1.03]"
          >
            {cta.label}
          </a>
        ) : (
          <span className="w-0 md:w-auto" />
        )}
      </nav>
    </header>
  );
}
