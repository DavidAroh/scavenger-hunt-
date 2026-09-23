"use client";

import type { GameState } from "@/lib/hunt";
import { NarrativeStage } from "./NarrativeStage";
import { AnswerStage } from "./AnswerStage";
import { TimedStage } from "./TimedStage";
import { FinishView } from "./FinishView";

export function StageRouter({
  state,
  firstName,
  prize,
}: {
  state: GameState;
  firstName: string;
  prize: { description: string; completionReward: string; rafflePrize: string; topN: number };
}) {
  if (state.phase === "finished") {
    return <FinishView result={state.result} firstName={firstName} prize={prize} />;
  }
  if (state.stage.kind === "narrative") {
    return <NarrativeStage stage={state.stage} />;
  }
  if (state.stage.kind === "timed") {
    return <TimedStage stage={state.stage} total={state.total} />;
  }
  return <AnswerStage stage={state.stage} total={state.total} />;
}
