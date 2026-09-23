"use client";

import { useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import type { StageView } from "@/lib/hunt";
import { advanceAction } from "@/app/play/actions";
import { BracketFrame } from "../ui";
import { ENTER } from "@/lib/motion";
import { RevealSequence } from "./RevealSequence";

type NarrativeView = Extract<StageView, { kind: "narrative" }>;

function ContinueButton({ cta }: { cta: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-blue w-full">
      {pending ? "…" : cta} <span aria-hidden>›</span>
    </button>
  );
}

export function NarrativeStage({ stage }: { stage: NarrativeView }) {
  // Rival beats (and the reveal) wear the adversary's colour.
  const rival = stage.tone === "rival" || stage.effect === "reveal";

  const content = (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={ENTER} className="space-y-8">
      <div>
        <p className={`label ${rival ? "text-coral" : "text-sky"}`}>
          {rival && (
            <span aria-hidden className="mr-2">
              ◣
            </span>
          )}
          {stage.eyebrow}
        </p>
        <h1 className="display mt-3">{stage.title}</h1>
      </div>

      {stage.body && (
        <BracketFrame tone={rival ? "coral" : "paper"}>
          <p className="text-[1.15rem] leading-relaxed font-light">{stage.body}</p>
        </BracketFrame>
      )}

      <form action={advanceAction}>
        <input type="hidden" name="stageId" value={stage.id} />
        <BracketFrame tone="blue" className="!py-3">
          <ContinueButton cta={stage.cta} />
        </BracketFrame>
      </form>
    </motion.div>
  );

  if (stage.effect === "reveal") return <RevealSequence>{content}</RevealSequence>;
  return content;
}
