import Link from "next/link";

export default function Footer({
  name,
  tagline,
  links,
}: {
  name: string;
  tagline: string;
  links: { label: string; href: string }[];
}) {
  return (
    <footer className="border-t border-(--line) px-6 py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <p className="font-[family-name:var(--font-display)] text-xl text-(--ink)">
            {name}
          </p>
          <p className="mt-3 text-sm text-(--ink-dim)">{tagline}</p>
        </div>
        <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-(--ink-dim)">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="transition-colors hover:text-(--ink)">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="mx-auto mt-14 flex max-w-5xl flex-col gap-4 border-t border-(--line) pt-8 text-xs text-(--ink-faint) md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} {name}. All rights reserved.</p>
        <Link href="/" className="transition-colors hover:text-(--ink-dim)">
          Part of the Cinematic kit — see all eight
        </Link>
      </div>
    </footer>
  );
}
