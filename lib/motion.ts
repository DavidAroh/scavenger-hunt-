import type { Variants } from "framer-motion";

/** Stepped easing: the "mechanical" feel. Framer Motion accepts an easing function. */
export const steps = (n: number) => (t: number) => Math.min(1, Math.floor(t * n) / n);

export const STAGGER = 0.06; // seconds between children
export const ENTER = { duration: 0.24, ease: steps(4) };

/** An item that steps + fades in. Pairs with CONTAINER for staggered lists. */
export const RISE: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: ENTER },
};

/** A parent that staggers its RISE children in sequence. */
export const CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: STAGGER, delayChildren: 0.04 } },
};
