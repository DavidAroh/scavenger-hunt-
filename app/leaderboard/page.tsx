import { Shell } from "@/components/Shell";
import { LiveRefresh } from "@/components/LiveRefresh";
import { Stagger, Item } from "@/components/Reveal";
import { Tile } from "@/components/ui";
import { PRIZE } from "@/lib/config";
import { isStorageReady, store } from "@/lib/store";
import { formatDuration, publicName } from "@/lib/validate";

export const dynamic = "force-dynamic";

/** Built to be shown on a big screen. Only first name + last initial is ever public. */
export default async function Leaderboard() {
  if (!isStorageReady) return <Shell wide><p className="label text-coral">Hunt not open</p><h1 className="display mt-3">Leaderboard unavailable.</h1><p className="mt-4 text-fog-200">Persistent event storage has not been configured.</p></Shell>;
  const [people, done] = await Promise.all([store.listParticipants(), store.listCompletions()]);
  const byId = new Map(people.map((p) => [p.id, p]));
  const rows = done.slice(0, 15);

  return (
    <Shell wide>
      <LiveRefresh />
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label text-sky">Live</p>
          <h1 className="display !text-[clamp(2.5rem,7vw,5rem)] mt-2">Leaderboard</h1>
        </div>
        <div className="grid grid-cols-3 gap-4 w-full sm:w-auto">
          <Tile label="Registered" value={people.length} />
          <Tile label="Hunting" value={Math.max(0, people.length - done.length)} tone="blue" />
          <Tile label="Finished" value={done.length} tone="green" />
        </div>
      </div>

      <div className="mt-8 pattern-chevrons scan-sweep h-5" aria-hidden />

      <div className="mt-8 border-3 border-paper">
        <div className="grid grid-cols-[4rem_1fr_7rem] sm:grid-cols-[6rem_1fr_10rem] px-4 py-3 border-b-3 border-paper label text-fog-300">
          <span>Rank</span>
          <span>Hunter</span>
          <span className="text-right">Time</span>
        </div>
        {rows.length === 0 && (
          <p className="p-6 text-fog-300 font-mono">
            <span className="text-green">$</span> waiting for the first finisher<span className="cursor-blink">▍</span>
          </p>
        )}
        <Stagger>
          {rows.map((c, i) => {
            const p = byId.get(c.participantId);
            const winner = i + 1 <= PRIZE.topN;
            return (
              <Item
                key={c.participantId}
                className={`grid grid-cols-[4rem_1fr_7rem] sm:grid-cols-[6rem_1fr_10rem] px-4 py-4 items-center border-b-3 border-paper/20 last:border-b-0 ${
                  i === 0 ? "bg-blue" : ""
                }`}
              >
                <span className={`font-mono font-bold text-2xl sm:text-4xl ${winner && i !== 0 ? "text-green" : ""}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-bold text-xl sm:text-3xl truncate">
                  {p ? (p.handle?.trim() || publicName(p.name)) : "-"}
                </span>
                <span className="font-mono text-right text-xl sm:text-3xl tabular-nums">{formatDuration(c.durationMs)}</span>
              </Item>
            );
          })}
        </Stagger>
      </div>
      <p className="mt-4 text-sm text-fog-400">
        First {PRIZE.topN} finishers win {PRIZE.description}.
        {PRIZE.raffleForAll ? " Every finisher receives a raffle entry; staff can add verified activity entries." : ""}
      </p>
    </Shell>
  );
}
