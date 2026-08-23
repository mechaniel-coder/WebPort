"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

const EASE_SIGNATURE = [0.16, 1, 0.3, 1] as const;

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.42, ease: EASE_SIGNATURE }}>
      {children}
    </MotionConfig>
  );
}

export { EASE_SIGNATURE };
