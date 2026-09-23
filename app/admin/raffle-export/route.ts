import { isAdmin } from "@/lib/admin-auth";
import { isStorageReady, store } from "@/lib/store";

export const dynamic = "force-dynamic";

const cell = (value: string | number) => {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

/** One row per raffle ticket, so a physical random draw weights additional verified entries correctly. */
export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  if (!isStorageReady) return new Response("Persistent storage is not configured", { status: 503 });
  const [people, completions, extras] = await Promise.all([
    store.listParticipants(),
    store.listCompletions(),
    store.listRaffleEntries(),
  ]);
  const byId = new Map(people.map((p) => [p.id, p]));
  const rows: string[][] = [];
  let ticket = 0;
  for (const completion of completions) {
    const person = byId.get(completion.participantId);
    if (person) rows.push([String(++ticket), person.handle?.trim() || person.name, "hunt completion", completion.finishedAt]);
  }
  for (const entry of extras) {
    const person = byId.get(entry.participantId);
    if (person) rows.push([String(++ticket), person.handle?.trim() || person.name, entry.reason, entry.createdAt]);
  }
  const csv = "\uFEFF" + [["ticket", "hunter", "reason", "created_at"], ...rows].map((row) => row.map(cell).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ril-raffle-tickets-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
