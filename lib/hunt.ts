import { randomInt } from "node:crypto";
import { clueForCheckpointPosition } from "./checkpoints";
import { PRIZE } from "./config";
import { ITEM_LABELS, STAGES, TOTAL_STAGES, type ItemKey, type Stage, stageById } from "./stages";
import { store } from "./store";
import { answerMatches, normalizeAnswer } from "./validate";
import type { Completion, Participant } from "./types";

/** The finish payload — reused by the finish screen and returned when the last stage clears. */
export type FinishedResult = {
  claimCode: string;
  rank: number;
  durationMs: number;
  winner: boolean;
  raffle: boolean;
  total: number;
};

/** A client-safe projection of the current stage. NEVER carries answers. */
export type StageView =
  | { kind: "narrative"; id: string; index: number; eyebrow: string; title: string; body?: string; cta: string; effect?: "reveal"; tone?: "rival" }
  | {
      kind: "answer";
      id: string;
      index: number;
      eyebrow: string;
      title: string;
      prompt: string;
      variant?: "riddle" | "hidden" | "physical" | "combined" | "final";
      hint?: string;
      items: { label: string; value: string }[];
      inputMode?: "numeric" | "text";
    }
  | {
      kind: "timed";
      id: string;
      index: number;
      eyebrow: string;
      title: string;
      prompt: string;
      /** Total window length, for the rival progress bar. */
      seconds: number;
      /** Server-computed ms left in the current window. Survives refresh; skew-proof on the client. */
      remainingMs: number;
      /** Times the clock has run out here: 0 on the first run, >0 shows the "trail scrambled" note. */
      timeouts: number;
      hint?: string;
      items: { label: string; value: string }[];
      inputMode?: "numeric" | "text";
    }
  | { kind: "codelock"; id: string; index: number; eyebrow: string; title: string; prompt: string; items: { label: string; value: string }[]; inputMode?: "numeric" | "text" };

export type GameState =
  | { phase: "playing"; index: number; total: number; stage: StageView; nextCheckpoint: ReturnType<typeof clueForCheckpointPosition> }
  | { phase: "checkpoint"; index: number; total: number; checkpoint: NonNullable<ReturnType<typeof clueForCheckpointPosition>> }
  | { phase: "finished"; result: FinishedResult };

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L

function makeCode(): string {
  let s = "";
  for (let i = 0; i < 4; i++) s += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return `RIL-${s}`;
}

async function finishedResult(p: Participant, c: Completion): Promise<FinishedResult> {
  const rank = await store.completionRank(p.id);
  const winner = rank <= PRIZE.topN;
  return {
    claimCode: c.claimCode,
    rank,
    durationMs: c.durationMs,
    winner,
    raffle: PRIZE.raffleForAll,
    total: TOTAL_STAGES,
  };
}

/** Mints a completion once the last stage clears. Idempotent (createCompletion ignores repeats). */
async function finalize(p: Participant): Promise<FinishedResult> {
  const existing = await store.getCompletion(p.id);
  if (existing) return finishedResult(p, existing);

  let code = makeCode();
  for (let i = 0; i < 5 && (await store.getCompletionByCode(code)); i++) code = makeCode();
  const now = new Date();
  const startedAt = p.startedAt ?? p.createdAt;
  const c = await store.createCompletion({
    participantId: p.id,
    finishedAt: now.toISOString(),
    durationMs: Math.max(0, now.getTime() - new Date(startedAt).getTime()),
    claimCode: code,
  });
  return finishedResult(p, c);
}

/** Items the player has collected, as label/value pairs, filtered to the ones a stage `uses`. */
function itemsFor(p: Participant, uses?: ItemKey[]): { label: string; value: string }[] {
  if (!uses) return [];
  return uses
    .filter((k) => p.collected[k] != null)
    .map((k) => ({ label: ITEM_LABELS[k], value: p.collected[k] }));
}

/** Picks a timed stage's prompt: the base prompt first, then rotates through `reshuffle` per timeout. */
function pickTimedPrompt(stage: Extract<Stage, { kind: "timed" }>, timeouts: number): string {
  if (timeouts <= 0 || !stage.reshuffle || stage.reshuffle.length === 0) return stage.prompt;
  return stage.reshuffle[(timeouts - 1) % stage.reshuffle.length];
}

/** Projects a stage into its client-safe view (drops all answer fields). */
function toView(
  stage: Stage,
  index: number,
  p: Participant,
  timer?: { remainingMs: number; timeouts: number },
): StageView {
  switch (stage.kind) {
    case "narrative":
      return { kind: "narrative", id: stage.id, index, eyebrow: stage.eyebrow, title: stage.title, body: stage.body, cta: stage.cta, effect: stage.effect, tone: stage.tone };
    case "answer":
      return { kind: "answer", id: stage.id, index, eyebrow: stage.eyebrow, title: stage.title, prompt: stage.prompt, variant: stage.variant, hint: stage.hint, items: itemsFor(p, stage.uses), inputMode: stage.inputMode };
    case "timed": {
      const timeouts = timer?.timeouts ?? 0;
      return {
        kind: "timed",
        id: stage.id,
        index,
        eyebrow: stage.eyebrow,
        title: stage.title,
        prompt: pickTimedPrompt(stage, timeouts),
        seconds: stage.seconds,
        remainingMs: timer?.remainingMs ?? stage.seconds * 1000,
        timeouts,
        hint: stage.hint,
        items: [],
        inputMode: stage.inputMode,
      };
    }
    case "codelock":
      return { kind: "codelock", id: stage.id, index, eyebrow: stage.eyebrow, title: stage.title, prompt: stage.prompt, items: itemsFor(p, stage.uses), inputMode: stage.inputMode };
  }
}

/**
 * The player's current state. Server-authoritative: only ever returns the stage the player
 * has actually reached. Idempotent to read — safe on every page load / resume.
 */
export async function getGameState(p: Participant): Promise<GameState> {
  const existing = await store.getCompletion(p.id);
  if (existing) return { phase: "finished", result: await finishedResult(p, existing) };

  const index = Math.min(p.stage, TOTAL_STAGES - 1);
  if (p.checkpointProgress < index) {
    const checkpoint = clueForCheckpointPosition(index);
    if (checkpoint) {
      return {
        phase: "checkpoint",
        index,
        total: TOTAL_STAGES,
        checkpoint,
      };
    }
  }
  const stage = STAGES[index];

  // Timed stages own a server-side countdown. Reaching one starts the clock; a clock that has
  // already run out is scrambled and restarted here — so the timer is authoritative and survives
  // refreshes / new phones (you can't buy time by reloading).
  if (stage.kind === "timed") {
    let t = await store.startTimer(p.id, stage.id);
    let deadline = new Date(t.startedAt).getTime() + stage.seconds * 1000;
    if (Date.now() > deadline) {
      t = await store.resetTimer(p.id, stage.id);
      deadline = new Date(t.startedAt).getTime() + stage.seconds * 1000;
    }
    const remainingMs = Math.max(0, deadline - Date.now());
    return {
      phase: "playing",
      index,
      total: TOTAL_STAGES,
      stage: toView(stage, index, p, { remainingMs, timeouts: t.timeouts }),
      nextCheckpoint: index === 0 ? null : clueForCheckpointPosition(index + 1),
    };
  }

  return {
    phase: "playing",
    index,
    total: TOTAL_STAGES,
    stage: toView(stage, index, p),
    nextCheckpoint: index === 0 ? null : clueForCheckpointPosition(index + 1),
  };
}

/** Persists a stage advance: bumps to `nextIndex`, merges a granted item, finalizes past the end. */
async function advanceTo(
  p: Participant,
  nextIndex: number,
  grantKey?: ItemKey,
  grantValue?: string,
): Promise<GameState> {
  const collected = { ...p.collected };
  if (grantKey && grantValue != null) collected[grantKey] = grantValue;

  const startedAt = p.stage === 0 ? new Date().toISOString() : undefined;
  const updated = (await store.setProgress(p.id, nextIndex, collected, startedAt)) ?? {
    ...p,
    stage: nextIndex,
    collected,
    startedAt: p.startedAt ?? startedAt ?? null,
  };

  if (nextIndex >= TOTAL_STAGES) return { phase: "finished", result: await finalize(updated) };
  return getGameState(updated);
}

export type SubmitResult =
  | { ok: true }
  | { ok: false; error: string; denied?: boolean; deniedHint?: string; timedOut?: boolean };

/**
 * Advances a `narrative` stage (the [BEGIN]/[CONTINUE] buttons). Sets the start clock on the
 * very first stage. No-op-safe: a stale stageId just leaves the player where they are.
 */
export async function advanceNarrative(p: Participant, stageId: string): Promise<SubmitResult> {
  const idx = Math.min(p.stage, TOTAL_STAGES - 1);
  const stage = STAGES[idx];
  if (stage.id !== stageId || stage.kind !== "narrative") return { ok: true }; // stale tab; caller re-renders
  await advanceTo(p, idx + 1, stage.grants, stage.grantValue);
  return { ok: true };
}

/** Accepted-answer set for a stage. codelock accepts only its corrected answers here in Phase 1. */
function acceptedFor(stage: Stage): string[] {
  if (stage.kind === "answer" || stage.kind === "timed") return stage.accept;
  if (stage.kind === "codelock") return stage.corrected;
  return [];
}

/**
 * Checks a typed answer against the player's CURRENT stage, server-side. On success advances
 * and (if the last stage) finalizes. Wrong answers are recorded and returned as errors.
 */
export async function submitAnswer(p: Participant, stageId: string, raw: string): Promise<SubmitResult> {
  const idx = Math.min(p.stage, TOTAL_STAGES - 1);
  const stage = STAGES[idx];

  // Stale / tampered stageId, or a stage that takes no typed answer: bounce to re-render.
  if (stage.id !== stageId || stage.kind === "narrative") return { ok: true };

  // Timed race: the server owns the clock. A submission past the deadline never counts, however
  // correct — it's logged as a miss and the caller re-renders (getGameState scrambles + restarts).
  if (stage.kind === "timed") {
    const t = await store.startTimer(p.id, stage.id);
    const deadline = new Date(t.startedAt).getTime() + stage.seconds * 1000;
    if (Date.now() > deadline) {
      await store.recordAttempt(p.id, stage.id, false);
      return { ok: false, timedOut: true, error: "Time's up." };
    }
  }

  if (normalizeAnswer(raw).length === 0) return { ok: false, error: "Type your answer first." };

  // Red-herring twist (Phase 2 wires the UI): the naive code is rejected with a nudge.
  if (stage.kind === "codelock" && answerMatches(raw, stage.naive)) {
    await store.recordAttempt(p.id, stage.id, false);
    return { ok: false, denied: true, deniedHint: stage.deniedHint, error: "Access denied." };
  }

  if (!answerMatches(raw, acceptedFor(stage))) {
    await store.recordAttempt(p.id, stage.id, false);
    return { ok: false, error: "Not quite. Try again." };
  }

  await store.recordAttempt(p.id, stage.id, true);
  // answer/codelock stages that `grant` store the player's (normalized) correct answer.
  const grantKey = "grants" in stage ? stage.grants : undefined;
  const grantValue = grantKey ? ("grantValue" in stage ? stage.grantValue : undefined) ?? normalizeAnswer(raw) : undefined;
  await advanceTo(p, idx + 1, grantKey, grantValue);
  return { ok: true };
}
