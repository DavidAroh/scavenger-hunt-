"use client";

import type { GameState } from "@/lib/hunt";
import { NarrativeStage } from "./NarrativeStage";
import { AnswerStage } from "./AnswerStage";
import { TimedStage } from "./TimedStage";
import { FinishView } from "./FinishView";
import { CheckpointStage, NextCheckpointClue } from "./CheckpointStage";

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
  if (state.phase === "checkpoint") {
    return <CheckpointStage checkpoint={state.checkpoint} index={state.index} total={state.total} />;
  }
  if (state.nextCheckpoint) {
    return (
      <>
        <NextCheckpointClue checkpoint={state.nextCheckpoint} />
        {state.stage.kind === "narrative" ? (
          <NarrativeStage stage={state.stage} total={state.total} />
        ) : state.stage.kind === "timed" ? (
          <TimedStage stage={state.stage} total={state.total} />
        ) : (
          <AnswerStage stage={state.stage} total={state.total} />
        )}
      </>
    );
  }
  if (state.stage.kind === "narrative") {
    return <NarrativeStage stage={state.stage} total={state.total} />;
  }
  if (state.stage.kind === "timed") {
    return <TimedStage stage={state.stage} total={state.total} />;
  }
  return <AnswerStage stage={state.stage} total={state.total} />;
}
