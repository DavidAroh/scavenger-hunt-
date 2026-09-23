export type Contact = { email: string | null; phone: string | null };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(v: string): string | null {
  const e = v.trim().toLowerCase();
  return EMAIL.test(e) ? e : null;
}

/** Keeps a leading + and digits. Accepts 0803..., +234803..., 234803... (7 to 15 digits). */
export function normalizePhone(v: string): string | null {
  const raw = v.trim();
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return null;
  return (raw.startsWith("+") ? "+" : "") + digits;
}

export function parseContact(mode: string, value: string): Contact | null {
  if (mode === "email") {
    const email = normalizeEmail(value);
    return email ? { email, phone: null } : null;
  }
  const phone = normalizePhone(value);
  return phone ? { email: null, phone } : null;
}

export function cleanName(v: string): string | null {
  const n = v.trim().replace(/\s+/g, " ");
  return n.length >= 2 && n.length <= 60 ? n : null;
}

/** "David Aroh" -> "David A."  (used on the public leaderboard) */
export function publicName(full: string): string {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * Normalizes a puzzle answer for forgiving comparison: trims, lowercases, strips accents,
 * removes everything but letters/digits (so "Door 7", "door-7", "DOOR7" all match "door7").
 * Returns "" for empty/blank input.
 */
export function normalizeAnswer(v: string): string {
  // NFKD splits accented letters into base + combining mark; the final filter (keep only
  // a-z0-9) drops the marks along with spaces and punctuation. So "Café-7" -> "cafe7".
  return v.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** True if `raw` matches any accepted answer after normalization. */
export function answerMatches(raw: string, accept: string[]): boolean {
  const a = normalizeAnswer(raw);
  return a.length > 0 && accept.some((x) => normalizeAnswer(x) === a);
}

export function maskContact(p: { email: string | null; phone: string | null }): string {
  if (p.email) {
    const [u, d] = p.email.split("@");
    return `${u.slice(0, 2)}***@${d}`;
  }
  return p.phone ? `***${p.phone.slice(-4)}` : "-";
}
