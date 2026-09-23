"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** Types text in char by char (30ms/char, capped so long strings never exceed maxMs). */
export function Typewriter({
  text,
  speed = 30,
  maxMs = 1200,
  onDone,
  className = "",
  cursor = true,
}: {
  text: string;
  speed?: number;
  maxMs?: number;
  onDone?: () => void;
  className?: string;
  cursor?: boolean;
}) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? text.length : 0);

  useEffect(() => {
    if (reduce) {
      setN(text.length);
      onDone?.();
      return;
    }
    setN(0);
    const per = Math.max(8, Math.min(speed, maxMs / Math.max(1, text.length)));
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) {
        clearInterval(id);
        onDone?.();
      }
    }, per);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, maxMs, reduce]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{text.slice(0, n)}</span>
      {cursor && (
        <span aria-hidden className="cursor-blink">
          ▍
        </span>
      )}
    </span>
  );
}
