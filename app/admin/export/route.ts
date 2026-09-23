import { isAdmin } from "@/lib/admin-auth";
import { TOTAL_STAGES } from "@/lib/stages";
import { isStorageReady, store } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Neutralise spreadsheet formula injection ("=HYPERLINK(...)" typed into the name field). */
function cell(v: string | number | boolean | null | undefined): string {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  if (!isStorageReady) return new Response("Persistent storage is not configured", { status: 503 });
  const [people, done, progress, raffleEntries] = await Promise.all([
    store.listParticipants(),
    store.listCompletions(),
    store.progressByParticipant(),
    store.listRaffleEntries(),
  ]);
  const finished = new Map(done.map((c) => [c.participantId, c]));

  const extraCounts = new Map<string, number>();
  for (const entry of raffleEntries) extraCounts.set(entry.participantId, (extraCounts.get(entry.participantId) ?? 0) + 1);
  const header = ["name", "handle", "email", "phone", "interests", "role", "age_range", "hunt_consent", "marketing_consent", "wants_programs", "raffle_entries", "progress", "finished", "claim_code", "claimed", "source", "joined_at"];
  const rows = people.map((p) => {
    const c = finished.get(p.id);
    return [
      p.name,
      p.handle ?? "",
      p.email,
      p.phone,
      p.interest.join("; "),
      p.role ?? "",
      p.ageRange ?? "",
      p.consent ? "yes" : "no",
      p.marketingConsent ? "yes" : "no",
      p.wantsPrograms ? "yes" : "no",
      (c ? 1 : 0) + (extraCounts.get(p.id) ?? 0),
      `${progress[p.id] ?? 0}/${TOTAL_STAGES}`,
      c ? "yes" : "no",
      c?.claimCode ?? "",
      c?.claimedAt ? "yes" : "no",
      "treasure-hunt",
      p.createdAt,
    ].map(cell).join(",");
  });

  const csv = "\uFEFF" + [header.join(","), ...rows].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ril-hunt-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
