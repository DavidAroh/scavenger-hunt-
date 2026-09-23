import Link from "next/link";
import { Shell } from "@/components/Shell";
import { Tile } from "@/components/ui";
import { ClaimForm } from "@/components/admin/ClaimForm";
import { RaffleEntryForm } from "@/components/admin/RaffleEntryForm";
import { logoutAction } from "./actions";
import { requireAdmin } from "@/lib/admin-auth";
import { STAGES, TOTAL_STAGES } from "@/lib/stages";
import { isDemoMode, isStorageReady, store } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Admin() {
  await requireAdmin();
  if (!isStorageReady) return <Shell><p className="label text-coral">Storage not configured</p><h1 className="display mt-3">Control room is closed.</h1><p className="mt-4 text-fog-200">Add the Supabase URL and service-role key to the server environment before opening event operations.</p></Shell>;
  const [people, done, byStage, progress, raffleEntries] = await Promise.all([
    store.listParticipants(),
    store.listCompletions(),
    store.stageReachCounts(),
    store.progressByParticipant(),
    store.listRaffleEntries(),
  ]);
  const extraEntriesById = new Map<string, number>();
  for (const entry of raffleEntries) extraEntriesById.set(entry.participantId, (extraEntriesById.get(entry.participantId) ?? 0) + 1);
  const claimed = done.filter((c) => c.claimedAt).length;
  const finishedIds = new Set(done.map((c) => c.participantId));
  const consented = people.filter((p) => p.consent).length;
  const marketingConsented = people.filter((p) => p.marketingConsent).length;
  const wantsPrograms = people.filter((p) => p.wantsPrograms).length;

  return (
    <Shell wide>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="label text-sky">Staff</p>
          <h1 className="display mt-2 !text-[clamp(2rem,6vw,3.5rem)]">Control room</h1>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link href="/admin/qr" className="btn btn-paper">QR sheet</Link>
          <a href="/admin/raffle-export" className="btn btn-paper">Export raffle tickets</a>
          <a href="/admin/export" className="btn btn-blue">Export leads CSV</a>
          <form action={logoutAction}>
            <button className="btn btn-ghost">Log out</button>
          </form>
        </div>
      </div>

      {isDemoMode && (
        <p className="mt-6 border-3 border-coral p-3 font-mono text-sm">
          DEMO MODE: no Supabase env vars set. Data lives in memory and disappears on restart.
        </p>
      )}

      <section className="mt-8 grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Tile label="Leads" value={people.length} />
        <Tile label="Hunt consent" value={consented} tone="blue" />
        <Tile label="Marketing opt-in" value={marketingConsented} tone="blue" />
        <Tile label="Finished" value={done.length} tone="green" />
        <Tile label="Claimed" value={claimed} tone="green" />
        <Tile label="Want programs" value={wantsPrograms} tone="blue" />
      </section>

      <section className="mt-8 grid lg:grid-cols-2 gap-8">
        <ClaimForm />
        <RaffleEntryForm />
      </section>

      <section className="mt-8 grid lg:grid-cols-2 gap-8">
        <div className="panel p-5">
          <p className="label text-fog-300">Hunters reaching each stage</p>
          <ul className="mt-3 space-y-2 font-mono text-sm">
            {STAGES.map((s, i) => {
              const n = byStage[i] ?? 0;
              return (
                <li key={s.id} className="flex items-center gap-3">
                  <span className="w-40 truncate">
                    {String(i).padStart(2, "0")} · {s.id}
                  </span>
                  <span className="flex-1 h-3 bg-fog-500/30">
                    <span className="block h-3 bg-blue" style={{ width: `${people.length ? Math.min(100, (n / people.length) * 100) : 0}%` }} />
                  </span>
                  <span className="w-8 text-right tabular-nums">{n}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="panel p-5">
          <p className="label text-fog-300">Raffle entries</p>
          <p className="mt-2 text-sm text-fog-200">Hunt finishers get one entry automatically. Verified RIL Versus, merch and demo activity adds are listed here.</p>
          <p className="mt-4 font-mono text-2xl text-green">{done.length + raffleEntries.length} total entries</p>
          <ul className="mt-3 space-y-2 text-sm">
            {raffleEntries.slice(-8).reverse().map((entry) => {
              const person = people.find((p) => p.id === entry.participantId);
              return <li key={entry.id} className="flex justify-between border-t border-paper/20 pt-2"><span>{person?.name ?? "Participant"}</span><span className="font-mono text-fog-300">{entry.reason}</span></li>;
            })}
            {raffleEntries.length === 0 && <li className="text-fog-400">No activity entries yet.</li>}
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <p className="label text-fog-300">Leads ({people.length})</p>
        <div className="mt-3 overflow-x-auto border-3 border-paper">
          <table className="w-full text-left text-sm min-w-[920px]">
            <thead className="border-b-3 border-paper label text-fog-300">
              <tr>
                {["Name", "Handle", "Email", "Phone", "Interests", "Hunt consent", "Marketing", "Raffle entries", "Progress", "Joined"].map((h) => (
                  <th key={h} className="px-3 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {people.slice(0, 300).map((p) => (
                <tr key={p.id} className="border-b border-paper/15 align-top">
                  <td className="px-3 py-2 font-semibold">{p.name}</td>
                  <td className="px-3 py-2 font-mono text-xs">{p.handle ?? "-"}</td>
                  <td className="px-3 py-2 font-mono text-xs break-all">{p.email ?? "-"}</td>
                  <td className="px-3 py-2 font-mono text-xs">{p.phone ?? "-"}</td>
                  <td className="px-3 py-2 text-fog-300">{p.interest.join(", ") || "-"}</td>
                  <td className="px-3 py-2">{p.consent ? "yes" : "no"}</td>
                  <td className="px-3 py-2">{p.marketingConsent ? "yes" : "no"}</td>
                  <td className="px-3 py-2 font-mono">{(finishedIds.has(p.id) ? 1 : 0) + (extraEntriesById.get(p.id) ?? 0)}</td>
                  <td className={`px-3 py-2 font-mono ${finishedIds.has(p.id) ? "text-green" : ""}`}>
                    {finishedIds.has(p.id) ? "DONE" : `${progress[p.id] ?? 0}/${TOTAL_STAGES}`}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-fog-300">{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {people.length > 300 && <p className="mt-2 text-sm text-fog-400">Showing 300 of {people.length}. Export CSV for all.</p>}
      </section>
    </Shell>
  );
}
