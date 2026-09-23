"use server";

import { redirect } from "next/navigation";
import { checkPassword, clearAdminCookie, isAdmin, setAdminCookie } from "@/lib/admin-auth";
import { store } from "@/lib/store";
import { maskContact, parseContact } from "@/lib/validate";

export type LoginState = { error?: string };

export async function loginAction(_p: LoginState, fd: FormData): Promise<LoginState> {
  if (!checkPassword(String(fd.get("password") ?? ""))) return { error: "Wrong password." };
  await setAdminCookie();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminCookie();
  redirect("/admin/login");
}

export type ClaimLookup =
  | { found: false }
  | { found: true; code: string; name: string; contact: string; finishedAt: string; claimedAt: string | null };

const normCode = (s: string) => s.trim().toUpperCase().replace(/\s+/g, "");

export async function lookupClaim(raw: string): Promise<ClaimLookup> {
  if (!(await isAdmin())) return { found: false };
  const c = await store.getCompletionByCode(normCode(raw));
  if (!c) return { found: false };
  const p = await store.findById(c.participantId);
  return {
    found: true,
    code: c.claimCode,
    name: p?.name ?? "Unknown",
    contact: p ? maskContact(p) : "-",
    finishedAt: c.finishedAt,
    claimedAt: c.claimedAt,
  };
}

export async function confirmClaim(code: string): Promise<ClaimLookup> {
  if (!(await isAdmin())) return { found: false };
  await store.markClaimed(normCode(code));
  return lookupClaim(code);
}

export type RaffleEntryState = { message?: string; error?: string };

export async function addRaffleEntryAction(_prev: RaffleEntryState, fd: FormData): Promise<RaffleEntryState> {
  if (!(await isAdmin())) return { error: "Staff sign-in required." };
  const mode = fd.get("mode") === "phone" ? "phone" : "email";
  const contact = parseContact(mode, String(fd.get("contact") ?? ""));
  const reason = String(fd.get("reason") ?? "");
  if (!contact) return { error: "Enter the participant's registered email or phone." };
  if (reason !== "versus" && reason !== "merch" && reason !== "demo") return { error: "Choose a valid activity." };
  const participant = await store.findByContact(contact);
  if (!participant) return { error: "No participant found. They must register for the hunt first." };
  await store.addRaffleEntry(participant.id, reason);
  return { message: `Added one ${reason} raffle entry for ${participant.name}.` };
}
