"use server";

import { redirect } from "next/navigation";
import { AGE_RANGES, CONSENT_REQUIRED, INTERESTS, ROLES } from "@/lib/config";
import { advanceNarrative, submitAnswer } from "@/lib/hunt";
import { getParticipant, newSessionToken, setSession } from "@/lib/session";
import { store } from "@/lib/store";
import { cleanName, parseContact } from "@/lib/validate";

export type GateState = {
  error?: string;
  values?: {
    name: string;
    mode: string;
    contact: string;
    interest: string[];
    consent: boolean;
    marketingConsent: boolean;
    handle: string;
    ageRange: string;
    role: string;
    wantsPrograms: boolean;
  };
};

/** Register (no token — one QR, one entry). Same email/phone resumes instead of duplicating. */
export async function registerAction(_prev: GateState, fd: FormData): Promise<GateState> {
  const mode = fd.get("mode") === "phone" ? "phone" : "email";
  const values = {
    name: String(fd.get("name") ?? ""),
    mode,
    contact: String(fd.get("contact") ?? ""),
    interest: fd.getAll("interest").map(String).filter((i) => INTERESTS.includes(i)),
    consent: fd.get("consent") === "on",
    marketingConsent: fd.get("marketingConsent") === "on",
    handle: String(fd.get("handle") ?? "").trim().slice(0, 24),
    ageRange: String(fd.get("ageRange") ?? ""),
    role: String(fd.get("role") ?? ""),
    wantsPrograms: fd.get("wantsPrograms") === "on",
  };

  // Honeypot: real people never see or fill this field. Bots get a silent bounce.
  if (String(fd.get("website") ?? "")) redirect("/play");

  const name = cleanName(values.name);
  if (!name) return { error: "We need a name (2 to 60 characters).", values };

  const contact = parseContact(mode, values.contact);
  if (!contact) {
    return {
      error: mode === "email" ? "That email doesn't look right." : "That phone number doesn't look right (7 to 15 digits).",
      values,
    };
  }
  if (CONSENT_REQUIRED && !values.consent) {
    return { error: "Agree to the hunt participation terms to register. Marketing updates are optional.", values };
  }

  const existing = await store.findByContact(contact);
  if (existing) {
    await setSession(existing.sessionToken);
    redirect("/play");
  }

  const sessionToken = newSessionToken();
  await store.createParticipant({
    name,
    email: contact.email,
    phone: contact.phone,
    interest: values.interest,
    consent: values.consent,
    marketingConsent: values.marketingConsent,
    track: "",
    sessionToken,
    entryLocation: "start",
    handle: values.handle || null,
    ageRange: AGE_RANGES.includes(values.ageRange) ? values.ageRange : null,
    role: ROLES.includes(values.role) ? values.role : null,
    wantsPrograms: values.wantsPrograms,
  });
  await setSession(sessionToken);
  redirect("/play");
}

export type PlayState = { error?: string; denied?: boolean; deniedHint?: string };

/** Submit a typed answer for the current stage. Success → re-render /play at the next stage. */
export async function submitAnswerAction(_prev: PlayState, fd: FormData): Promise<PlayState> {
  const me = await getParticipant();
  if (!me) redirect("/play");
  const stageId = String(fd.get("stageId") ?? "");
  const answer = String(fd.get("answer") ?? "");
  const res = await submitAnswer(me, stageId, answer);
  if (res.ok || res.timedOut) redirect("/play"); // timeout → re-render so getGameState scrambles + restarts the clock
  return { error: res.error, denied: res.denied, deniedHint: res.deniedHint };
}

/** Advance a narrative stage ([BEGIN]/[CONTINUE]). */
export async function advanceAction(fd: FormData): Promise<void> {
  const me = await getParticipant();
  if (!me) redirect("/play");
  await advanceNarrative(me, String(fd.get("stageId") ?? ""));
  redirect("/play");
}
