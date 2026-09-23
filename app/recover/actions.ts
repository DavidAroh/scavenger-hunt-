"use server";

import { redirect } from "next/navigation";
import { setSession } from "@/lib/session";
import { store } from "@/lib/store";
import { parseContact } from "@/lib/validate";

export type RecoverState = { error?: string };

export async function recoverAction(_prev: RecoverState, fd: FormData): Promise<RecoverState> {
  const mode = fd.get("mode") === "phone" ? "phone" : "email";
  const contact = parseContact(mode, String(fd.get("contact") ?? ""));
  if (!contact) return { error: "That doesn't look right. Check it and try again." };
  const p = await store.findByContact(contact);
  if (!p) return { error: "No hunter found with that. Enter the hunt and register first." };
  await setSession(p.sessionToken);
  redirect("/play");
}
