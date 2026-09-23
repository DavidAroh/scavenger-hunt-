/**
 * THE DIRECTOR'S LOST TREASURE — the whole game script lives here.
 *
 * A `Stage` is one screen in the linear hunt. Everyone plays the same order, on their own
 * phone. Progress is enforced server-side (see lib/hunt.ts): the client never receives a
 * stage's answers, only the prompt for the stage it has actually earned.
 *
 * ┌─ STAGE KINDS ────────────────────────────────────────────────────────────────────────┐
 * │ narrative  no input; a story beat. `cta` is the button. `grants` can hand the player  │
 * │            an item (e.g. a map fragment). `effect:"reveal"` plays the dramatic reveal. │
 * │ answer     typed answer, matched against `accept` (case/space/punct-insensitive).      │
 * │            `variant` only changes framing/copy. `uses` lists earlier items to surface  │
 * │            to the player ("you have: …"). `grants` stores this answer as an item.      │
 * │ timed      like `answer` but with a countdown (`seconds`). Server-authoritative — the  │
 * │            on-screen timer is cosmetic.                                                │
 * │ codelock   the red-herring twist: `naive` answers are politely rejected with           │
 * │            `deniedHint`; only `corrected` answers advance.                              │
 * └────────────────────────────────────────────────────────────────────────────────────┘
 *
 * Event setup requirement: place the blue numeral 7 on the booth before opening the hunt.
 * See EVENT_RUNBOOK.md for the staff answer key and setup steps.
 */

/** A key for something the player collects and may need later. */
export type ItemKey = "riddle01" | "symbol" | "fragI" | "fragII" | "mapCode";

/** Human labels for collected items, shown on combined/final screens ("you have: …"). */
export const ITEM_LABELS: Record<ItemKey, string> = {
  riddle01: "Clue 01 answer",
  symbol: "Booth symbol",
  fragI: "Map fragment I",
  fragII: "Map fragment II",
  mapCode: "Map code",
};

type Common = {
  /** Stable id. Used in URLs/state and to record attempts — don't reuse ids. */
  id: string;
  /** Small uppercase label above the title. */
  eyebrow: string;
  /** The screen headline. */
  title: string;
  /** Optional supporting paragraph under the title. */
  body?: string;
};

export type Stage =
  | (Common & {
      kind: "narrative";
      cta: string;
      /** If set, clearing this screen stores `grantValue` under this item key. */
      grants?: ItemKey;
      grantValue?: string;
      /** "reveal" plays the dramatic rival-reveal animation (flash → SIGNAL DETECTED → glimpse). */
      effect?: "reveal";
      /** "rival" tints the beat coral (the adversary's colour). Purely cosmetic framing. */
      tone?: "rival";
    })
  | (Common & {
      kind: "answer";
      prompt: string;
      /** Accepted answers (normalized before compare). Keep at least one. */
      accept: string[];
      hint?: string;
      variant?: "riddle" | "hidden" | "physical" | "combined" | "final";
      /** Earlier items to surface to the player on this screen. */
      uses?: ItemKey[];
      /** If set, the player's correct answer is stored under this item key. */
      grants?: ItemKey;
      /** Canonical value stored when accepted answers include aliases. */
      grantValue?: string;
      /** Which phone keyboard to raise. Set "numeric" when the answer is digits only. */
      inputMode?: "numeric" | "text";
    })
  | (Common & {
      kind: "timed";
      prompt: string;
      accept: string[];
      /** Countdown length. Server decides pass/fail; the on-screen timer is cosmetic. */
      seconds: number;
      /** Alternate prompts shown if the player runs out of time and retries. */
      reshuffle?: string[];
      hint?: string;
      inputMode?: "numeric" | "text";
    })
  | (Common & {
      kind: "codelock";
      prompt: string;
      /** Plausible-but-wrong answers → rejected with `deniedHint`, no advance. */
      naive: string[];
      /** The corrected answers → advance. */
      corrected: string[];
      deniedHint: string;
      uses?: ItemKey[];
      grants?: ItemKey;
      inputMode?: "numeric" | "text";
    });

/**
 * The ordered trail. First entry is the story intro (BEGIN THE HUNT starts the clock);
 * clearing the last entry finishes the hunt and mints a claim code.
 */
export const STAGES: Stage[] = [
  {
    id: "story",
    kind: "narrative",
    eyebrow: "Checkpoint 00 · The brief",
    title: "The Director's lost treasure.",
    body: "The Director's treasured collection has disappeared. The trail is contained inside the RIL booth. Follow the clues, explore the displays, and recover the treasure before your rival does.",
    cta: "Begin the hunt",
  },
  {
    id: "riddle01",
    kind: "answer",
    variant: "riddle",
    eyebrow: "Clue 01 · The first clue",
    title: "A quiet guardian.",
    prompt: "I have keys but open no locks. I have a space but no room. What am I?",
    accept: ["keyboard", "a keyboard", "the keyboard"],
    hint: "You are probably holding one right now.",
    grants: "riddle01",
    grantValue: "keyboard",
  },
  {
    id: "rival",
    kind: "narrative",
    tone: "rival",
    eyebrow: "Signal",
    title: "Someone else just solved this too.",
    body: "You're not the only one hunting. Move fast.",
    cta: "Keep moving",
  },
  {
    id: "hidden",
    kind: "answer",
    variant: "hidden",
    eyebrow: "Clue 02 · The hidden message",
    title: "Read between the lines.",
    prompt: "Read the first letter of each line:\nRed foxes hide clues.\nIn plain sight.\nLook closely.",
    accept: ["ril"],
    hint: "Three letters.",
  },
  {
    id: "fragI",
    kind: "narrative",
    eyebrow: "Map fragment I",
    title: "A piece of the map.",
    body: "The paper shows 1990 beside a tiny arrow. It looks like a year. Keep it safe; the map is not finished yet.",
    cta: "Continue hunting",
    grants: "fragI",
    grantValue: "1990",
  },
  {
    id: "symbol",
    kind: "answer",
    variant: "physical",
    eyebrow: "Clue 03 · Off the phone",
    title: "Your next clue isn't on your phone.",
    prompt: "Stay inside the RIL booth area. Find the blue numeral 7 on the booth display and type it here.",
    accept: ["7", "seven"],
    hint: "Ask a RIL team member if you're stuck.",
    grants: "symbol",
    grantValue: "7",
  },
  {
    id: "combined",
    kind: "answer",
    variant: "combined",
    eyebrow: "Clue 04 · The combined answer",
    title: "Nothing you collect is useless.",
    prompt: "Put your first answer together with the booth numeral. Type them as one, with no spaces.",
    accept: ["keyboard7"],
    uses: ["riddle01", "symbol"],
  },
  {
    id: "race",
    kind: "timed",
    eyebrow: "Clue 05 · The race",
    title: "You're running out of time.",
    prompt: "I have hands but cannot clap. I race forward, and never run out of road. What am I?",
    accept: ["clock", "a clock", "the clock", "time"],
    seconds: 90,
    reshuffle: [
      "The trail scrambled! You can spend me, save me or waste me, but never hold me. What am I?",
    ],
  },
  {
    id: "reveal",
    kind: "narrative",
    effect: "reveal",
    tone: "rival",
    eyebrow: "Signal detected",
    title: "They're closer than you thought.",
    body: "A glimpse of the rival flickers across your screen. No time to waste.",
    cta: "Continue",
  },
  {
    id: "fragII",
    kind: "narrative",
    eyebrow: "Map fragment II",
    title: "The map is complete.",
    body: "The second fragment reveals the arrow's instruction: read the first fragment backwards. The map gives you a corrected four-digit code. Remember its final digit.",
    cta: "Combine the map",
    grants: "fragII",
    grantValue: "reverse",
  },
  {
    id: "codelock",
    kind: "codelock",
    eyebrow: "The lock",
    title: "Enter the map code.",
    prompt: "Enter the four digits from Fragment I in reverse order.",
    naive: ["1990"],
    corrected: ["0991"],
    deniedHint:
      "Something is wrong. One of the pieces you collected has been misread. Go back to Map Fragment I and look again.",
    uses: ["fragI", "fragII"],
    grants: "mapCode",
    inputMode: "numeric",
  },
  {
    id: "final",
    kind: "answer",
    variant: "final",
    eyebrow: "Final lock",
    title: "Everything you've got.",
    prompt: "The final lock needs three things: your first answer, the booth numeral, and the last digit of the corrected map code. Join them with no spaces.",
    accept: ["keyboard71"],
    uses: ["mapCode", "riddle01", "symbol", "fragII"],
  },
];

export const stageById = (id: string): Stage | null => STAGES.find((s) => s.id === id) ?? null;
export const stageIndexById = (id: string): number => STAGES.findIndex((s) => s.id === id);
export const TOTAL_STAGES = STAGES.length;
