import { CHECKPOINT_CLUES, CHECKPOINT_LABELS, CHECKPOINT_QR_NUMBERS } from "./checkpoint-labels";

const CHECKPOINT_IDS = ["booth-start", "entrance", "daimayo", "ac-3", "stage-left", "stage-right", "speaker-1", "david", "tile-rows", "registration-table", "kelvin", "booth-finish"] as const;

/** Public route metadata. QR scan tokens live in Supabase and stay server-side. */
export const CHECKPOINTS = CHECKPOINT_LABELS.map((label, position) => ({
  id: CHECKPOINT_IDS[position],
  position,
  qrNumber: CHECKPOINT_QR_NUMBERS[position],
  label,
}));

export const START_CHECKPOINT_POSITION = 0;
export const checkpointByPosition = (position: number) => CHECKPOINTS[position] ?? null;

export function clueForCheckpointPosition(position: number) {
  const copy = CHECKPOINT_CLUES[position];
  const checkpoint = checkpointByPosition(position);
  if (!copy || !checkpoint) return null;
  return { qrNumber: checkpoint.qrNumber, clue: copy.clue, hint: copy.hint };
}
