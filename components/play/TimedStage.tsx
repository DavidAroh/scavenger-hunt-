"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { StageView } from "@/lib/hunt";
import { submitAnswerAction, type PlayState } from "@/app/play/actions";
import { BracketFrame } from "../ui";
import { ProgressBlocks } from "../ProgressBlocks";
import { ENTER } from "@/lib/motion";

type TimedView = Extract<StageView, { kind: "timed" }>;
const initial: PlayState = {};

/** mm:ss from a millisecond remainder. */
function clock(ms: number): string {
  const s = Math.ceil(Math.max(0, ms) / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function TimedStage({ stage, total }: { stage: TimedView; total: number }) {
  const [state, action, pending] = useActionState(submitAnswerAction, initial);
  const [showHint, setShowHint] = useState(false);
  const [remaining, setRemaining] = useState(stage.remainingMs);
  const [expired, setExpired] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const numeric = stage.inputMode === "numeric";

  // Cosmetic countdown, anchored to the server's remaining time (skew-proof via a monotonic delta).
  // At zero the server has the final say: refresh so getGameState scrambles the clue + restarts.
  useEffect(() => {
    const base = stage.remainingMs;
    const t0 = performance.now();
    setExpired(false);
    setRemaining(base);
    let refresh: ReturnType<typeof setTimeout> | undefined;
    const id = setInterval(() => {
      const rem = Math.max(0, base - (performance.now() - t0));
      setRemaining(rem);
      if (rem <= 0) {
        clearInterval(id);
        setExpired(true);
        refresh = setTimeout(() => router.refresh(), 900);
      }
    }, 250);
    return () => {
      clearInterval(id);
      if (refresh) clearTimeout(refresh);
    };
  }, [stage.remainingMs, stage.id, stage.timeouts, router]);

  // Wrong answer (submitted in time): pull the alert into view and re-arm the input for a fast retry.
  useEffect(() => {
    if (!state.error) return;
    alertRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [state]);

  const pct = Math.min(100, Math.max(0, (1 - remaining / (stage.seconds * 1000)) * 100));
  const low = remaining <= 15000;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={ENTER} className="space-y-6">
      <div>
        <p className="label text-coral">{stage.eyebrow}</p>
        <h1 className="display mt-3">{stage.title}</h1>
      </div>

      <div className="border-3 border-paper p-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="label text-fog-300">Time remaining</span>
          <span className={`font-mono font-bold text-3xl tabular-nums ${low ? "text-coral" : "text-paper"}`}>{clock(remaining)}</span>
        </div>
        <div>
          <div className="flex justify-between label text-fog-400 mb-1">
            <span>You</span>
            <span className="text-coral">Rival</span>
          </div>
          <div className="h-3 border-3 border-paper bg-ink" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-coral" style={{ width: `${pct}%`, transition: "width 250ms linear" }} />
          </div>
        </div>
      </div>

      {stage.timeouts > 0 && !expired && (
        <p className="font-mono text-sm text-sky">
          <span className="text-fog-400">$ </span>trail scrambled — new route (attempt {stage.timeouts + 1})
        </p>
      )}

      <BracketFrame tone={expired ? "coral" : "paper"}>
        <p className="text-[1.35rem] leading-snug font-semibold">{stage.prompt}</p>
      </BracketFrame>

      {expired ? (
        <div className="border-3 border-coral shadow-hard-coral p-5 text-center space-y-3">
          <p className="font-mono text-coral font-bold text-xl">⏱ TIME&apos;S UP</p>
          <p className="text-sm text-fog-200">The rival pulled ahead and the trail scrambled. Regrouping…</p>
          <button type="button" onClick={() => router.refresh()} className="btn btn-blue w-full">
            Go again <span aria-hidden>›</span>
          </button>
        </div>
      ) : (
        <>
          {state.error && (
            <div ref={alertRef} role="alert" className="border-3 border-coral shadow-hard-coral p-4 font-semibold">
              <span className="font-mono text-coral">ERR</span> {state.error}
            </div>
          )}
          <form action={action} className="space-y-4">
            <input type="hidden" name="stageId" value={stage.id} />
            <label className="block">
              <span className="label text-fog-300">Your answer — fast</span>
              <input
                ref={inputRef}
                name="answer"
                required
                autoFocus
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                inputMode={numeric ? "numeric" : undefined}
                pattern={numeric ? "[0-9]*" : undefined}
                enterKeyHint="send"
                placeholder={numeric ? "Enter the code" : "Type it here"}
                className="field mt-2 font-mono"
              />
            </label>
            {stage.hint && (
              <div className="text-sm font-mono">
                {showHint ? (
                  <p className="text-fog-400">hint: {stage.hint}</p>
                ) : (
                  <button type="button" onClick={() => setShowHint(true)} className="text-fog-300 underline decoration-2 underline-offset-4 hover:text-paper min-h-[44px]">
                    Need a hint?
                  </button>
                )}
              </div>
            )}
            <BracketFrame tone="blue" className="!py-3">
              <button type="submit" disabled={pending} className="btn btn-blue w-full">
                {pending ? "Checking…" : "Submit answer"} <span aria-hidden>›</span>
              </button>
            </BracketFrame>
          </form>
        </>
      )}

      <ProgressBlocks done={stage.index} total={total} />

      <p className="text-sm text-fog-400">
        Knocked offline mid-race?{" "}
        <Link href="/recover" className="underline decoration-2 underline-offset-4 text-paper">
          Resume here
        </Link>
        . The clock keeps running.
      </p>
    </motion.div>
  );
}
