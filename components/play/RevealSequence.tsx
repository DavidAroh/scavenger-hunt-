"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { steps } from "@/lib/motion";

/**
 * The Phase-4 rival reveal. Wraps a settled narrative stage: on mount it drops a full-screen
 * "signal intercept" overlay (scanline → SIGNAL DETECTED scramble → a flickering rival glimpse),
 * then wipes away to show the stage underneath.
 *
 * The stage content is always mounted behind the overlay, so nothing is gated on the animation —
 * and reduced-motion users never see the overlay at all: `useReducedMotion` skips it in JS, and a
 * CSS `display:none` backstop (globals.css) guarantees no flash even before hydration settles.
 */

const GLYPHS = "▚▞▙▟░▒▓█/\\|<>=+*#";

/** Random-glyph scramble that resolves to `text` left-to-right over ~0.9s, then holds. */
function Scramble({ text }: { text: string }) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    const TICKS = 16;
    let tick = 0;
    const id = window.setInterval(() => {
      tick += 1;
      const shown = Math.floor((tick / TICKS) * text.length);
      setOut(
        text
          .split("")
          .map((ch, i) => (ch === " " ? " " : i < shown ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(""),
      );
      if (tick >= TICKS) {
        window.clearInterval(id);
        setOut(text);
      }
    }, 55);
    return () => window.clearInterval(id);
  }, [text]);
  return <span aria-label={text}>{out}</span>;
}

// 11×14 hooded-figure bitmap. A peaked hood tapers up to a crown (rows 0–4, 3→5→7→9 wide, so the
// top reads pointed/sinister rather than a rounded arch), framing a face-shaped void that opens and
// closes like a shadowed face (rows 5–8, a 3→5→5→3 diamond). Below it a solid chest (row 9), shoulders
// that flare past the hood to the full 11-wide (rows 10–11), then a cloak tapering to its base (rows
// 12–13). Leaner and taller than the first pass. 1 = a coral block, 0 = empty ("the unknown hunter").
const RIVAL = [
  [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0],
  [0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0],
  [0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0],
  [0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
];

function RivalGlyph() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.25, 1, 0.6, 1] }}
      transition={{ duration: 0.7, ease: steps(6) }}
      className="mx-auto grid w-[150px] gap-[3px]"
      style={{ gridTemplateColumns: "repeat(11, 1fr)" }}
      aria-hidden
    >
      {RIVAL.flat().map((on, i) => (
        <span key={i} className={on ? "block aspect-square bg-coral" : "block aspect-square"} />
      ))}
    </motion.div>
  );
}

function RevealOverlay({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase(1), 160), // scanline + SIGNAL DETECTED
      window.setTimeout(() => setPhase(2), 1150), // rival glimpse
      window.setTimeout(onDone, 2600), // wipe → reveal the stage
    ];
    // Skippable: a hurried player at the booth (or anyone reloading onto this stage) can bail early.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDone();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("keydown", onKey);
    };
  }, [onDone]);

  return (
    <motion.div
      className="reveal-overlay fixed inset-0 z-50 grid cursor-pointer place-items-center overflow-hidden bg-ink"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: steps(3) }}
      onClick={onDone}
      aria-hidden
    >
      <div className="grid-lines absolute inset-0 opacity-40" />
      <motion.div
        className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-coral/40 to-transparent"
        initial={{ top: "-20%" }}
        animate={{ top: "120%" }}
        transition={{ duration: 1.1, ease: steps(12), repeat: 1 }}
      />
      <div className="relative px-6 text-center">
        {phase >= 1 && (
          <p className="font-mono text-2xl font-bold tracking-[0.3em] text-coral sm:text-3xl">
            <Scramble text="SIGNAL DETECTED" />
          </p>
        )}
        {phase >= 2 && (
          <div className="mt-8">
            <RivalGlyph />
            <p className="mt-4 font-mono text-xs uppercase tracking-widest text-fog-300">
              Unknown hunter · proximity: close
            </p>
          </div>
        )}
      </div>
      <p className="absolute inset-x-0 bottom-8 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-fog-500">
        tap to skip
      </p>
    </motion.div>
  );
}

export function RevealSequence({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(true);
  useEffect(() => {
    if (reduce) setShow(false);
  }, [reduce]);

  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {show && !reduce && <RevealOverlay key="reveal" onDone={() => setShow(false)} />}
      </AnimatePresence>
    </div>
  );
}
