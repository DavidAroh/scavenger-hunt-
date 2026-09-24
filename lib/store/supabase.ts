import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Checkpoint, Completion, NewParticipant, Participant, RaffleEntry, Store } from "../types";

let client: SupabaseClient | null = null;
const sb = () =>
  (client ??= createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  }));

/* eslint-disable @typescript-eslint/no-explicit-any */
const toParticipant = (r: any): Participant => ({
  id: r.id,
  name: r.name,
  email: r.email,
  phone: r.phone,
  interest: r.interest ?? [],
  consent: r.consent,
  marketingConsent: r.marketing_consent ?? false,
  track: r.track,
  sessionToken: r.session_token,
  entryLocation: r.entry_location,
  createdAt: r.created_at,
  stage: r.stage ?? 0,
  checkpointProgress: r.checkpoint_progress ?? 0,
  collected: r.collected ?? {},
  startedAt: r.started_at ?? null,
  handle: r.handle ?? null,
  ageRange: r.age_range ?? null,
  role: r.role ?? null,
  wantsPrograms: r.wants_programs ?? false,
});
const toCompletion = (r: any): Completion => ({
  participantId: r.participant_id,
  finishedAt: r.finished_at,
  durationMs: r.duration_ms,
  claimCode: r.claim_code,
  claimedAt: r.claimed_at,
});
const toRaffleEntry = (r: any): RaffleEntry => ({
  id: r.id,
  participantId: r.participant_id,
  reason: r.reason,
  createdAt: r.created_at,
});
const toCheckpoint = (r: any): Checkpoint => ({
  id: r.id,
  token: r.token,
  qrNumber: r.qr_number,
  position: r.position,
  label: r.label,
});
const must = <T>(res: { data: T | null; error: { message: string } | null }): T => {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
};

export const supabaseStore: Store = {
  async createParticipant(p: NewParticipant) {
    const res = await sb()
      .from("participants")
      .insert({
        name: p.name,
        email: p.email,
        phone: p.phone,
        interest: p.interest,
        consent: p.consent,
        marketing_consent: p.marketingConsent ?? false,
        track: p.track,
        checkpoint_progress: 0,
        session_token: p.sessionToken,
        entry_location: p.entryLocation,
        handle: p.handle ?? null,
        age_range: p.ageRange ?? null,
        role: p.role ?? null,
        wants_programs: p.wantsPrograms ?? false,
      })
      .select()
      .single();
    return toParticipant(must(res));
  },
  async findBySession(token) {
    const res = await sb().from("participants").select().eq("session_token", token).maybeSingle();
    const row = must(res);
    return row ? toParticipant(row) : null;
  },
  async findByContact({ email, phone }) {
    if (email) {
      const row = must(await sb().from("participants").select().eq("email", email).maybeSingle());
      if (row) return toParticipant(row);
    }
    if (phone) {
      const row = must(await sb().from("participants").select().eq("phone", phone).maybeSingle());
      if (row) return toParticipant(row);
    }
    return null;
  },
  async findById(id) {
    const row = must(await sb().from("participants").select().eq("id", id).maybeSingle());
    return row ? toParticipant(row) : null;
  },
  async listCheckpoints() {
    const rows = must(await sb().from("hunt_checkpoints").select().order("position")) as any[];
    return (rows ?? []).map(toCheckpoint);
  },
  async getCheckpointByToken(token) {
    const row = must(await sb().from("hunt_checkpoints").select().eq("token", token).maybeSingle());
    return row ? toCheckpoint(row) : null;
  },
  async getCheckpointByPosition(position) {
    const row = must(await sb().from("hunt_checkpoints").select().eq("position", position).maybeSingle());
    return row ? toCheckpoint(row) : null;
  },
  async createCompletion(c) {
    const { error } = await sb()
      .from("completions")
      .upsert(
        {
          participant_id: c.participantId,
          finished_at: c.finishedAt,
          duration_ms: c.durationMs,
          claim_code: c.claimCode,
        },
        { onConflict: "participant_id", ignoreDuplicates: true },
      );
    if (error) throw new Error(error.message);
    const row = must(await sb().from("completions").select().eq("participant_id", c.participantId).single());
    return toCompletion(row);
  },
  async getCompletion(participantId) {
    const row = must(await sb().from("completions").select().eq("participant_id", participantId).maybeSingle());
    return row ? toCompletion(row) : null;
  },
  async getCompletionByCode(code) {
    const row = must(await sb().from("completions").select().eq("claim_code", code).maybeSingle());
    return row ? toCompletion(row) : null;
  },
  async markClaimed(code) {
    const existing = await this.getCompletionByCode(code);
    if (!existing) return null;
    if (existing.claimedAt) return existing;
    const row = must(
      await sb()
        .from("completions")
        .update({ claimed_at: new Date().toISOString() })
        .eq("claim_code", code)
        .select()
        .single(),
    );
    return toCompletion(row);
  },
  async addRaffleEntry(participantId, reason) {
    const row = must(await sb().from("raffle_entries").insert({ participant_id: participantId, reason }).select().single());
    return toRaffleEntry(row);
  },
  async listRaffleEntries() {
    const rows = must(await sb().from("raffle_entries").select().order("created_at")) as any[];
    return (rows ?? []).map(toRaffleEntry);
  },
  async completionRank(participantId) {
    const mine = await this.getCompletion(participantId);
    if (!mine) return 0;
    const { count, error } = await sb()
      .from("completions")
      .select("participant_id", { count: "exact", head: true })
      .lte("finished_at", mine.finishedAt);
    if (error) throw new Error(error.message);
    return count ?? 0;
  },
  async setProgress(participantId, stage, collected, startedAt) {
    // Only set started_at if not already set: fetch current, then update.
    const current = await this.findById(participantId);
    if (!current) return null;
    const patch: Record<string, unknown> = { stage, collected };
    if (startedAt && !current.startedAt) patch.started_at = startedAt;
    const row = must(
      await sb().from("participants").update(patch).eq("id", participantId).select().single(),
    );
    return toParticipant(row);
  },
  async advanceCheckpoint(participantId, checkpointPosition) {
    const { error } = await sb().rpc("advance_hunt_checkpoint", {
      p_participant_id: participantId,
      p_checkpoint_position: checkpointPosition,
    });
    if (error) throw new Error(error.message);
    return this.findById(participantId);
  },
  async recordAttempt(participantId, stageId, solved) {
    // Read-modify-write: bump attempts, stamp solved_at on first solve.
    const existing = must(
      await sb()
        .from("stage_events")
        .select()
        .eq("participant_id", participantId)
        .eq("stage_id", stageId)
        .maybeSingle(),
    ) as { attempts: number; solved_at: string | null } | null;
    const attempts = (existing?.attempts ?? 0) + 1;
    const solvedAt = existing?.solved_at ?? (solved ? new Date().toISOString() : null);
    const { error } = await sb()
      .from("stage_events")
      .upsert(
        { participant_id: participantId, stage_id: stageId, attempts, solved_at: solvedAt },
        { onConflict: "participant_id,stage_id" },
      );
    if (error) throw new Error(error.message);
  },
  async startTimer(participantId, stageId) {
    const existing = must(
      await sb()
        .from("stage_events")
        .select("timer_started_at, timeouts")
        .eq("participant_id", participantId)
        .eq("stage_id", stageId)
        .maybeSingle(),
    ) as { timer_started_at: string | null; timeouts: number | null } | null;
    if (existing?.timer_started_at) {
      return { startedAt: existing.timer_started_at, timeouts: existing.timeouts ?? 0 };
    }
    const startedAt = new Date().toISOString();
    const timeouts = existing?.timeouts ?? 0;
    const { error } = await sb()
      .from("stage_events")
      .upsert(
        { participant_id: participantId, stage_id: stageId, timer_started_at: startedAt, timeouts },
        { onConflict: "participant_id,stage_id" },
      );
    if (error) throw new Error(error.message);
    return { startedAt, timeouts };
  },
  async resetTimer(participantId, stageId) {
    const existing = must(
      await sb()
        .from("stage_events")
        .select("timeouts")
        .eq("participant_id", participantId)
        .eq("stage_id", stageId)
        .maybeSingle(),
    ) as { timeouts: number | null } | null;
    const startedAt = new Date().toISOString();
    const timeouts = (existing?.timeouts ?? 0) + 1;
    const { error } = await sb()
      .from("stage_events")
      .upsert(
        { participant_id: participantId, stage_id: stageId, timer_started_at: startedAt, timeouts },
        { onConflict: "participant_id,stage_id" },
      );
    if (error) throw new Error(error.message);
    return { startedAt, timeouts };
  },
  async stageReachCounts() {
    const rows = must(await sb().from("participants").select("stage")) as { stage: number }[];
    const out: Record<number, number> = {};
    // A participant on stage N has reached every stage 0..N.
    for (const r of rows ?? []) {
      for (let i = 0; i <= (r.stage ?? 0); i++) out[i] = (out[i] ?? 0) + 1;
    }
    return out;
  },
  async listParticipants() {
    const rows = must(await sb().from("participants").select().order("created_at", { ascending: false })) as any[];
    return (rows ?? []).map(toParticipant);
  },
  async listCompletions() {
    const rows = must(await sb().from("completions").select().order("finished_at")) as any[];
    return (rows ?? []).map(toCompletion);
  },
  async progressByParticipant() {
    const rows = must(await sb().from("participants").select("id, stage")) as { id: string; stage: number }[];
    const out: Record<string, number> = {};
    for (const r of rows ?? []) out[r.id] = r.stage ?? 0;
    return out;
  },
};
