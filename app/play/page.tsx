import { Shell } from "@/components/Shell";
import { StageRouter } from "@/components/play/StageRouter";
import { QrScanner } from "@/components/play/QrScanner";
import { RouteClock } from "@/components/play/RouteClock";
import { PRIZE } from "@/lib/config";
import { getGameState } from "@/lib/hunt";
import { getParticipant } from "@/lib/session";
import { isStorageReady, store } from "@/lib/store";
import { CheckpointSuccess } from "@/components/play/CheckpointSuccess";

export const dynamic = "force-dynamic";

/** The booth QR starts registration; the route QR codes unlock later game stages. */
export default async function PlayPage({ searchParams }: { searchParams: Promise<{ scan?: string }> }) {
  if (!isStorageReady) {
    return (
      <Shell>
        <p className="label text-coral">Hunt not open</p>
        <h1 className="display mt-3">Registration is paused.</h1>
        <p className="mt-4 text-fog-200">The hunt needs its persistent event database configured before participants can register. Please check back with the RIL team.</p>
      </Shell>
    );
  }
  const me = await getParticipant();
  if (!me) {
    return (
      <Shell>
        <p className="label text-sky">Begin at the booth</p>
        <h1 className="display mt-3">Scan the start QR to enter.</h1>
        <p className="mt-4 text-fog-200">Registration opens from QR 09 at the RIL booth. Scan the fixed starting code there, then your checkpoint progress stays with you.</p>
        <QrScanner />
      </Shell>
    );
  }

  const state = await getGameState(me);
  const params = await searchParams;
  const scanNumber = Number(params.scan);
  const lastCheckpoint = Number.isInteger(scanNumber) && scanNumber > 0
    ? await store.getCheckpointByPosition(me.checkpointProgress)
    : null;
  const scanSuccess = lastCheckpoint?.qrNumber === scanNumber ? lastCheckpoint : null;
  return (
    <Shell>
      {state.phase !== "finished" && me.startedAt && <RouteClock startedAt={me.startedAt} finishedAt={me.routeFinishedAt} />}
      {scanSuccess && <CheckpointSuccess key={scanSuccess.qrNumber} qrNumber={scanSuccess.qrNumber} label={scanSuccess.label} />}
      <StageRouter
        state={state}
        firstName={me.name.split(" ")[0]}
        prize={{ description: PRIZE.description, completionReward: PRIZE.completionReward, rafflePrize: PRIZE.rafflePrize, topN: PRIZE.topN }}
      />
    </Shell>
  );
}
