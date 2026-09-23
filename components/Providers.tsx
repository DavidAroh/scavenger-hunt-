"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";

/**
 * App-wide motion config. `reducedMotion="user"` makes ALL Framer Motion animations
 * (these new ones and the pre-existing Gate/AnswerStage/FinishView ones) collapse to
 * opacity-only when the OS "reduce motion" setting is on — the CSS media query in
 * globals.css only covers CSS animations, not Framer's JS-driven transforms.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
