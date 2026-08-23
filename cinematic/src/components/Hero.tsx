"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function Hero({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  aside,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  aside?: ReactNode;
}) {
  return (
    <section
      id="top"
      className="relative flex min-h-[92dvh] flex-col justify-center overflow-hidden px-6 pt-32 pb-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, var(--accent-soft), transparent 70%)",
        }}
      />
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-full border border-(--line) px-4 py-1.5 text-xs tracking-[0.2em] text-(--ink-dim) uppercase"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="text-(length:--text-hero) font-[family-name:var(--font-display)] leading-[0.98] tracking-tight text-(--ink) italic"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="mt-8 max-w-xl text-lg text-(--ink-dim)"
        >
          {subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <a
            href={primaryCta.href}
            className="rounded-full bg-(--accent) px-6 py-3 text-sm font-medium text-(--accent-ink) transition-transform hover:scale-[1.03]"
          >
            {primaryCta.label}
          </a>
          {secondaryCta ? (
            <a
              href={secondaryCta.href}
              className="rounded-full border border-(--line) px-6 py-3 text-sm font-medium text-(--ink) transition-colors hover:border-(--accent)"
            >
              {secondaryCta.label}
            </a>
          ) : null}
        </motion.div>
        {aside ? <div className="mt-16 w-full">{aside}</div> : null}
      </div>
    </section>
  );
}
