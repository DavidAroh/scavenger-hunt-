import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "ril_admin";

/** In dev a fallback password keeps the demo usable. In production you MUST set ADMIN_PASSWORD. */
export function adminPassword(): string | null {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  return process.env.NODE_ENV === "production" ? null : "ghostdev";
}

function signature(pw: string): string {
  return createHmac("sha256", process.env.SESSION_SECRET ?? "dev-secret-change-me").update(pw).digest("hex");
}

export function checkPassword(input: string): boolean {
  const pw = adminPassword();
  if (!pw) return false;
  const a = Buffer.from(signature(input));
  const b = Buffer.from(signature(pw));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function setAdminCookie() {
  const pw = adminPassword();
  if (!pw) return;
  (await cookies()).set(COOKIE, signature(pw), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
}

export async function clearAdminCookie() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const pw = adminPassword();
  if (!pw) return false;
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const a = Buffer.from(v);
  const b = Buffer.from(signature(pw));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
