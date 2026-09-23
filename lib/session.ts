import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { store } from "./store";
import type { Participant } from "./types";

export const SESSION_COOKIE = "ril_hunt";
const WEEK = 60 * 60 * 24 * 7;

export const newSessionToken = () => randomBytes(24).toString("base64url");

export async function getParticipant(): Promise<Participant | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? store.findBySession(token) : null;
}

/** Server actions / route handlers only. */
export async function setSession(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: WEEK,
    path: "/",
  });
}
