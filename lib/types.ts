export type Participant = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  interest: string[];
  consent: boolean;
  marketingConsent: boolean;
  track: string;
  sessionToken: string;
  entryLocation: string;
  createdAt: string;
  // ---- treasure-hunt progress (added for the Director's Lost Treasure game) ----
  /** Index into STAGES of the stage the player is currently on. 0 = not started. */
  stage: number;
  /** Highest checkpoint position scanned in order (0 is the booth start QR). */
  checkpointProgress: number;
  /** Items the player has collected, keyed by ItemKey (e.g. riddle01 answer, booth symbol). */
  collected: Record<string, string>;
  /** Set when the player taps BEGIN THE HUNT; the duration clock starts here. */
  startedAt: string | null;
  /** Time the final route QR was scanned; this stops the leaderboard race clock. */
  routeFinishedAt: string | null;
  // ---- optional lead-capture fields (added to registration) ----
  handle: string | null;
  ageRange: string | null;
  role: string | null;
  wantsPrograms: boolean;
};

export type Completion = {
  participantId: string;
  finishedAt: string;
  /** Timestamp of the QR 12 scan used to rank the physical checkpoint route. */
  routeFinishedAt: string;
  durationMs: number;
  claimCode: string;
  claimedAt: string | null;
};

export type RaffleEntry = {
  id: string;
  participantId: string;
  reason: "versus" | "merch" | "demo";
  createdAt: string;
};

export type Checkpoint = {
  id: string;
  token: string;
  qrNumber: number;
  position: number;
  label: string;
};

/**
 * What a caller supplies to create a participant. Progress fields (stage/collected/startedAt)
 * are store-managed and default on insert. The optional lead fields default to null/false.
 */
export type NewParticipant = Omit<
  Participant,
  "id" | "createdAt" | "stage" | "checkpointProgress" | "collected" | "startedAt" | "routeFinishedAt" | "handle" | "ageRange" | "role" | "wantsPrograms" | "marketingConsent"
> &
  Partial<Pick<Participant, "handle" | "ageRange" | "role" | "wantsPrograms" | "marketingConsent">>;

/** Everything the app needs from persistence. Two implementations: memory (demo) and Supabase. */
export interface Store {
  createParticipant(p: NewParticipant): Promise<Participant>;
  findBySession(token: string): Promise<Participant | null>;
  findByContact(c: { email?: string | null; phone?: string | null }): Promise<Participant | null>;
  findById(id: string): Promise<Participant | null>;
  listCheckpoints(): Promise<Checkpoint[]>;
  getCheckpointByToken(token: string): Promise<Checkpoint | null>;
  getCheckpointByPosition(position: number): Promise<Checkpoint | null>;
  createCompletion(c: Omit<Completion, "claimedAt">): Promise<Completion>;
  getCompletion(participantId: string): Promise<Completion | null>;
  getCompletionByCode(code: string): Promise<Completion | null>;
  markClaimed(code: string): Promise<Completion | null>;
  addRaffleEntry(participantId: string, reason: RaffleEntry["reason"]): Promise<RaffleEntry>;
  listRaffleEntries(): Promise<RaffleEntry[]>;
  completionRank(participantId: string): Promise<number>;
  // ---- treasure-hunt progress ----
  /** Overwrite a participant's stage index, collected items, and (optionally) start time. */
  setProgress(
    participantId: string,
    stage: number,
    collected: Record<string, string>,
    startedAt?: string,
  ): Promise<Participant | null>;
  /** Atomically accepts only the next physical checkpoint for the participant's current stage. */
  advanceCheckpoint(participantId: string, checkpointPosition: number): Promise<Participant | null>;
  /** Idempotent per (participant, stage): bumps the attempt count, stamps solvedAt on first solve. */
  recordAttempt(participantId: string, stageId: string, solved: boolean): Promise<void>;
  /**
   * Server-authoritative countdown for `timed` stages. Idempotent: returns the running window if
   * one exists, else stamps `startedAt = now`. `timeouts` drives which reshuffled prompt shows.
   */
  startTimer(participantId: string, stageId: string): Promise<{ startedAt: string; timeouts: number }>;
  /** The clock ran out: stamp a fresh window and bump the timeout counter (advances the reshuffle). */
  resetTimer(participantId: string, stageId: string): Promise<{ startedAt: string; timeouts: number }>;
  /** How many participants have reached (are on or past) each stage index. For the admin funnel. */
  stageReachCounts(): Promise<Record<number, number>>;
  // reads for leaderboard + admin
  listParticipants(): Promise<Participant[]>;
  listCompletions(): Promise<Completion[]>;
  /** Current stage index per participant id. For the admin leads table + CSV. */
  progressByParticipant(): Promise<Record<string, number>>;
}
