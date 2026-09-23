"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { StageView } from "@/lib/hunt";
import { submitAnswerAction, type PlayState } from "@/app/play/actions";
import { BracketFrame } from "../ui";
import { ProgressBlocks } from "../ProgressBlocks";
import { Typewriter } from "../Typewriter";
import { ENTER } from "@/lib/motion";

type AnswerLike = Extract<StageView, { kind: "answer" | "timed" | "codelock" }>;

const initial: PlayState = {};

const EYEBROW_TONE: Record<string, string> = {
  physical: "text-teal",
  final: "text-green",
  combined: "text-sky",
};

export function AnswerStage({ stage, total }: { stage: AnswerLike; total: number }) {
  const [state, action, pending] = useActionState(submitAnswerAction, initial);
  const [typed, setTyped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const variant = stage.kind === "answer" ? stage.variant : stage.kind === "codelock" ? "final" : undefined;
  const command =
    stage.kind === "codelock"
      ? "./unlock --map-code"
      : variant === "physical"
        ? "./scan --booth"
        : variant === "final"
          ? "./unlock --final"
          : `./solve --clue ${String(stage.index).padStart(2, "0")}`;

  const hint = "hint" in stage ? stage.hint : undefined;
  const numeric = stage.inputMode === "numeric";

  // On a wrong answer / denial: pull the alert into view and re-arm the input for a fast retry.
  useEffect(() => {
    if (!state.error && !state.deniedHint) return;
    alertRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    const el = inputRef.current;
    if (el) {
      el.focus();
      el.select();
    }
  }, [state]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={ENTER} className="space-y-7">
      <div>
        <p className={`label ${EYEBROW_TONE[variant ?? ""] ?? "text-sky"}`}>{stage.eyebrow}</p>
        <h1 className="display mt-3">{stage.title}</h1>
      </div>

      <div>
        <p className="font-mono text-sm text-green min-h-[1.5rem]">
          <span className="text-fog-400">$ </span>
          <Typewriter text={command} onDone={() => setTyped(true)} cursor={!typed} />
        </p>
        <div className="mt-3">
          <BracketFrame tone={state.denied ? "coral" : "paper"}>
            <p className="text-[1.35rem] leading-snug font-semibold">{stage.prompt}</p>
          </BracketFrame>
        </div>
      </div>

      {stage.items.length > 0 && (
        <div className="border-3 border-paper/40 p-4">
          <p className="label text-fog-300">In your pack</p>
          <ul className="mt-2 space-y-1 font-mono text-sm">
            {stage.items.map((it) => (
              <li key={it.label} className="flex justify-between gap-3">
                <span className="text-fog-300">{it.label}</span>
                <span className="text-paper">{it.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(state.error || state.deniedHint) && (
        <div ref={alertRef} role="alert" className="border-3 border-coral shadow-hard-coral p-4 font-semibold">
          <span className="font-mono text-coral">{state.denied ? "DENIED" : "ERR"}</span>{" "}
          {state.deniedHint ?? state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        <input type="hidden" name="stageId" value={stage.id} />
        <label className="block">
          <span className="label text-fog-300">Your answer</span>
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
        {hint && (
          <div className="text-sm font-mono">
            {showHint ? (
              <p className="text-fog-400">hint: {hint}</p>
            ) : (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="text-fog-300 underline decoration-2 underline-offset-4 hover:text-paper min-h-[44px]"
              >
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

      <ProgressBlocks done={stage.index} total={total} />

      <p className="text-sm text-fog-400">
        Stuck on the same screen after switching phones?{" "}
        <Link href="/recover" className="underline decoration-2 underline-offset-4 text-paper">
          Resume here
        </Link>
        .
      </p>
    </motion.div>
  );
}
