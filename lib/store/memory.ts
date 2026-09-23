import { randomUUID } from "node:crypto";
import type { Completion, NewParticipant, Participant, RaffleEntry, Store } from "../types";

type StageEvent = {
  attempts: number;
  solvedAt: string | null;
  /** Start of the current timed-stage window (null until the player reaches a timed stage). */
  timerStartedAt: string | null;
  /** How many times the clock has run out here — advances the reshuffled prompt. */
  timeouts: number;
};
const blankEvent = (): StageEvent => ({ attempts: 0, solvedAt: null, timerStartedAt: null, timeouts: 0 });
type DB = {
  participants: Map<string, Participant>;
  completions: Map<string, Completion>;
  raffleEntries: RaffleEntry[];
  /** Keyed `${participantId}|${stageId}`. */
  events: Map<string, StageEvent>;
};

// globalThis so dev hot-reloads keep the data. DEMO ONLY: not shared across serverless instances.
const g = globalThis as unknown as { __ril_db?: DB };
const db: DB = (g.__ril_db ??= {
  participants: new Map(),
  completions: new Map(),
  raffleEntries: [],
  events: new Map(),
});

export const memoryStore: Store = {
  async createParticipant(p: NewParticipant) {
    const row: Participant = {
      ...p,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      stage: 0,
      collected: {},
      startedAt: null,
      handle: p.handle ?? null,
      ageRange: p.ageRange ?? null,
      role: p.role ?? null,
      wantsPrograms: p.wantsPrograms ?? false,
      marketingConsent: p.marketingConsent ?? false,
    };
    db.participants.set(row.id, row);
    return row;
  },
  async findBySession(token) {
    for (const p of db.participants.values()) if (p.sessionToken === token) return p;
    return null;
  },
  async findByContact({ email, phone }) {
    for (const p of db.participants.values()) {
      if ((email && p.email === email) || (phone && p.phone === phone)) return p;
    }
    return null;
  },
  async findById(id) {
    return db.participants.get(id) ?? null;
  },
  async createCompletion(c) {
    const existing = db.completions.get(c.participantId);
    if (existing) return existing;
    const row: Completion = { ...c, claimedAt: null };
    db.completions.set(c.participantId, row);
    return row;
  },
  async getCompletion(participantId) {
    return db.completions.get(participantId) ?? null;
  },
  async getCompletionByCode(code) {
    for (const c of db.completions.values()) if (c.claimCode === code) return c;
    return null;
  },
  async markClaimed(code) {
    for (const c of db.completions.values()) {
      if (c.claimCode === code) {
        c.claimedAt = c.claimedAt ?? new Date().toISOString();
        return c;
      }
    }
    return null;
  },
  async addRaffleEntry(participantId, reason) {
    const row: RaffleEntry = { id: randomUUID(), participantId, reason, createdAt: new Date().toISOString() };
    db.raffleEntries.push(row);
    return row;
  },
  async listRaffleEntries() {
    return [...db.raffleEntries].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },
  async completionRank(participantId) {
    const sorted = [...db.completions.values()].sort((a, b) => a.finishedAt.localeCompare(b.finishedAt));
    return sorted.findIndex((c) => c.participantId === participantId) + 1;
  },
  async setProgress(participantId, stage, collected, startedAt) {
    const p = db.participants.get(participantId);
    if (!p) return null;
    p.stage = stage;
    p.collected = collected;
    if (startedAt && !p.startedAt) p.startedAt = startedAt;
    return p;
  },
  async recordAttempt(participantId, stageId, solved) {
    const key = `${participantId}|${stageId}`;
    const e = db.events.get(key) ?? blankEvent();
    e.attempts += 1;
    if (solved && !e.solvedAt) e.solvedAt = new Date().toISOString();
    db.events.set(key, e);
  },
  async startTimer(participantId, stageId) {
    const key = `${participantId}|${stageId}`;
    const e = db.events.get(key) ?? blankEvent();
    if (!e.timerStartedAt) {
      e.timerStartedAt = new Date().toISOString();
      db.events.set(key, e);
    }
    return { startedAt: e.timerStartedAt, timeouts: e.timeouts };
  },
  async resetTimer(participantId, stageId) {
    const key = `${participantId}|${stageId}`;
    const e = db.events.get(key) ?? blankEvent();
    e.timerStartedAt = new Date().toISOString();
    e.timeouts += 1;
    db.events.set(key, e);
    return { startedAt: e.timerStartedAt, timeouts: e.timeouts };
  },
  async stageReachCounts() {
    const out: Record<number, number> = {};
    // A participant on stage N has reached every stage 0..N.
    for (const p of db.participants.values()) {
      for (let i = 0; i <= p.stage; i++) out[i] = (out[i] ?? 0) + 1;
    }
    return out;
  },
  async listParticipants() {
    return [...db.participants.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async listCompletions() {
    return [...db.completions.values()].sort((a, b) => a.finishedAt.localeCompare(b.finishedAt));
  },
  async progressByParticipant() {
    const out: Record<string, number> = {};
    for (const p of db.participants.values()) out[p.id] = p.stage;
    return out;
  },
};
