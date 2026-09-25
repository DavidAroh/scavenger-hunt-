"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

const BURSTS = [
  { x: -30, y: -25, delay: 0.02 },
  { x: 28, y: -30, delay: 0.08 },
  { x: -38, y: 4, delay: 0.13 },
  { x: 36, y: 8, delay: 0.18 },
  { x: -23, y: 31, delay: 0.23 },
  { x: 24, y: 33, delay: 0.28 },
];

export function CheckpointSuccess({ qrNumber, label }: { qrNumber: number; label: string }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timeout = window.setTimeout(() => router.replace("/play", { scroll: false }), 3200);
    return () => window.clearTimeout(timeout);
  }, [router]);

  return (
    <motion.aside
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: reduceMotion ? 0 : 14, scale: reduceMotion ? 1 : 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="relative mb-6 overflow-hidden border-3 border-green bg-green/10 p-4 shadow-hard-green sm:p-5"
    >
      <div className="flex items-center gap-4">
        <div className="relative grid h-14 w-14 shrink-0 place-items-center border-3 border-green bg-green text-ink">
          {BURSTS.map((burst, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              className="absolute h-1.5 w-1.5 bg-green"
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
              animate={reduceMotion ? { opacity: 0 } : { opacity: [0, 1, 0], x: burst.x, y: burst.y, scale: [0.4, 1, 0.5] }}
              transition={{ duration: 0.65, delay: burst.delay, ease: "easeOut" }}
            />
          ))}
          <motion.svg viewBox="0 0 32 32" className="h-8 w-8" fill="none" aria-hidden="true">
            <motion.path
              d="m6 16 7 7L27 9"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="square"
              strokeLinejoin="miter"
              initial={{ pathLength: reduceMotion ? 1 : 0, opacity: reduceMotion ? 1 : 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.35, delay: 0.08, ease: "easeOut" }}
            />
          </motion.svg>
        </div>
        <div>
          <p className="label text-green">Checkpoint cleared · QR {String(qrNumber).padStart(2, "0")}</p>
          <p className="mt-1 text-lg font-bold leading-tight">You found {label}.</p>
          <p className="mt-1 text-sm text-fog-200">Your route progress is saved. The next clue is ready.</p>
        </div>
      </div>
    </motion.aside>
  );
}
