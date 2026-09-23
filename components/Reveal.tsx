"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { CONTAINER, ENTER, RISE } from "@/lib/motion";

/**
 * Thin client wrappers that let server components (landing, leaderboard) opt into the
 * app's stepped entrance motion without themselves becoming client components. Reduced
 * motion is handled globally by the root <MotionConfig reducedMotion="user">.
 */

/** Staggers its <Item> children in, one after another. `as` picks the rendered element. */
export function Stagger({
  children,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ol" | "ul" | "section";
}) {
  const M = motion[as];
  return (
    <M variants={CONTAINER} initial="hidden" animate="show" className={className}>
      {children}
    </M>
  );
}

/** One staggered child: steps + fades up. `as` picks the rendered element. */
export function Item({
  children,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "span" | "section" | "p";
}) {
  const M = motion[as];
  return (
    <M variants={RISE} className={className}>
      {children}
    </M>
  );
}

/** A single element that steps + fades in on mount, with an optional delay. */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...ENTER, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
