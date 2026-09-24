import Link from "next/link";
import { Shell } from "@/components/Shell";
import { Halftone } from "@/components/ui";
import { ProgressBlocks } from "@/components/ProgressBlocks";
import { Typewriter } from "@/components/Typewriter";
import { Reveal, Stagger, Item } from "@/components/Reveal";
import { EVENT, PRIZE } from "@/lib/config";
import { TOTAL_STAGES } from "@/lib/stages";
import { getParticipant } from "@/lib/session";
import { isStorageReady, store } from "@/lib/store";

export const dynamic = "force-dynamic";

const STEPS = [
  ["01", "Enter the hunt", "Name plus email or phone. The story begins."],
  ["02", "Find the checkpoints", "Follow the route through the RIL booth and approved nearby event spots."],
  ["03", "Scan and solve", "Each fixed QR unlocks the next phone clue. Checkpoints must be found in order."],
  ["04", "Recover the treasure", `Finish at the RIL booth and claim ${PRIZE.description}.`],
];

export default async function Home({ searchParams }: { searchParams: Promise<{ resumed?: string }> }) {
  const { resumed } = await searchParams;
  const me = await getParticipant();
  const done = me ? (await store.getCompletion(me.id)) : null;
  const stage = me ? Math.min(me.stage, TOTAL_STAGES) : 0;

  return (
    <Shell>
      <Stagger className="relative">
        <Halftone className="drift absolute -top-3 right-0 w-36 h-24 text-blue opacity-60" rows={6} cols={10} />
        <p className="label text-sky relative font-mono">
          <span className="text-green">$</span>{" "}
          <Typewriter text={EVENT.name} speed={45} />
        </p>
        <Item as="span">
          <h1 className="display mt-3 relative !text-[clamp(2.5rem,11vw,4rem)]">
            The Director&apos;s
            <br />
            <span className="bg-blue px-2 -mx-2">lost treasure.</span>
          </h1>
        </Item>
        <Item as="p" className="mt-6 text-lg text-fog-200 font-light relative">
          Start at the RIL booth, follow the clues through approved nearby event spots, then return to the booth for the treasure.
        </Item>
      </Stagger>

      {resumed && (
        <div className="mt-6 border-3 border-green shadow-hard-green p-4 font-semibold">
          <span className="font-mono text-green">OK</span> You&apos;re back in. Pick up where you left off.
        </div>
      )}

      {me && !done && stage > 0 && (
        <section className="mt-8 panel p-4 shadow-hard-white">
          <p className="label text-fog-300">Welcome back, {me.name.split(" ")[0]}</p>
          <div className="mt-3">
            <ProgressBlocks done={stage} total={TOTAL_STAGES} />
          </div>
        </section>
      )}

      <Reveal delay={0.28} className="mt-8 grid gap-4">
        {isStorageReady ? (
          <Link href="/play" className="btn btn-blue">
            {me && !done ? "Continue the hunt" : "Enter the hunt"} <span aria-hidden>›</span>
          </Link>
        ) : (
          <div className="border-3 border-coral p-4" role="status">
            <p className="label text-coral">Hunt not open</p>
            <p className="mt-2 text-sm text-fog-200">RIL is preparing the persistent event database. Registration will open when setup is complete.</p>
          </div>
        )}
      </Reveal>

      <section className="mt-10">
        <p className="label text-fog-300">How it works</p>
        <Stagger className="mt-4 space-y-3" as="ol">
          {STEPS.map(([n, t, d]) => (
            <Item as="li" key={n} className="flex gap-4 border-3 border-paper p-4">
              <span className="font-mono font-bold text-blue text-2xl leading-none">{n}</span>
              <span>
                <span className="block font-bold text-lg leading-tight">{t}</span>
                <span className="block text-fog-300 font-light text-sm mt-1">{d}</span>
              </span>
            </Item>
          ))}
        </Stagger>
      </section>

      <div className="mt-10 pattern-chevrons scan-sweep h-5" aria-hidden />

      <section className="mt-8 grid gap-4">
        <Link href="/experience" className="btn btn-blue">
          Explore RIL <span aria-hidden>›</span>
        </Link>
        <Link href="/leaderboard" className="btn btn-paper">
          Leaderboard <span aria-hidden>›</span>
        </Link>
        <Link href="/recover" className="btn btn-ghost">
          Lost your progress? Resume
        </Link>
      </section>
    </Shell>
  );
}
