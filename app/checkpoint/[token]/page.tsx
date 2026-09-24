import Link from "next/link";
import { notFound } from "next/navigation";
import { Gate } from "@/components/Gate";
import { Shell } from "@/components/Shell";
import { AGE_RANGES, CONSENT_REQUIRED, CONSENT_TEXT, INTERESTS, MARKETING_TEXT, PROGRAMS_TEXT, ROLES } from "@/lib/config";
import { START_CHECKPOINT_POSITION } from "@/lib/checkpoints";
import { getParticipant } from "@/lib/session";
import { isStorageReady, store } from "@/lib/store";
import { scanCheckpointAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function CheckpointPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ wrong?: string; setup?: string }>;
}) {
  const [{ token }, query] = await Promise.all([params, searchParams]);
  if (!isStorageReady) {
    return (
      <Shell>
        <p className="label text-coral">Hunt not open</p>
        <h1 className="display mt-3">Checkpoint unavailable.</h1>
        <p className="mt-4 text-fog-200">The event database is not ready. Please check with the RIL team.</p>
      </Shell>
    );
  }

  let checkpoint;
  try {
    checkpoint = await store.getCheckpointByToken(token);
  } catch {
    return (
      <Shell>
        <p className="label text-coral">Checkpoint setup needed</p>
        <h1 className="display mt-3">The route is not ready yet.</h1>
        <p className="mt-4 text-fog-200">Please ask an RIL host to finish the Supabase checkpoint migration before scanning.</p>
      </Shell>
    );
  }
  if (!checkpoint) notFound();

  const participant = await getParticipant();
  if (!participant && checkpoint.position === START_CHECKPOINT_POSITION) {
    return (
      <Shell>
        <Gate
          interests={INTERESTS}
          roles={ROLES}
          ageRanges={AGE_RANGES}
          consentText={CONSENT_TEXT}
          marketingText={MARKETING_TEXT}
          consentRequired={CONSENT_REQUIRED}
          programsText={PROGRAMS_TEXT}
          startToken={checkpoint.token}
        />
      </Shell>
    );
  }

  if (!participant) {
    return (
      <Shell>
        <p className="label text-sky">Not registered yet</p>
        <h1 className="display mt-3">Start at the RIL booth.</h1>
        <p className="mt-4 text-fog-200">Scan the starting QR at the booth and register before checking in at other spots.</p>
        <p className="mt-6 border-2 border-paper/40 p-4 text-sm text-fog-200">Return to the RIL booth and scan QR 09 to register. The starting code is fixed there.</p>
      </Shell>
    );
  }

  if (checkpoint.position === 0 || checkpoint.position <= participant.checkpointProgress) {
    return (
      <Shell>
        <p className="label text-green">Checkpoint found</p>
        <h1 className="display mt-3">You already checked in.</h1>
        <p className="mt-4 text-fog-200">Your progress is saved. Pick up the trail where you left off.</p>
        <Link href="/play" className="btn btn-blue mt-6 w-full">Continue the hunt <span aria-hidden>›</span></Link>
      </Shell>
    );
  }

  const expectedPosition = participant.checkpointProgress + 1;
  const isNext = checkpoint.position === expectedPosition && checkpoint.position === participant.stage;
  if (query.setup) {
    return (
      <Shell>
        <p className="label text-coral">Checkpoint setup needed</p>
        <h1 className="display mt-3">This scan could not be saved.</h1>
        <p className="mt-4 text-fog-200">Please ask an RIL host to confirm the hunt database migration is applied, then try again.</p>
        <Link href="/play" className="btn btn-blue mt-6 w-full">Back to my route <span aria-hidden>›</span></Link>
      </Shell>
    );
  }
  if (!isNext || query.wrong) {
    return (
      <Shell>
        <p className="label text-coral">Wrong turn</p>
        <h1 className="display mt-3">This isn&apos;t your next stop.</h1>
        <p className="mt-4 text-fog-200">Your route is checked in order. Return to the game screen for the clue to your next checkpoint.</p>
        <Link href="/play" className="btn btn-blue mt-6 w-full">Back to my clue <span aria-hidden>›</span></Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="label text-green">Checkpoint {String(checkpoint.position + 1).padStart(2, "0")} · QR {checkpoint.qrNumber}</p>
      <h1 className="display mt-3">You found {checkpoint.label}.</h1>
      <p className="mt-4 text-fog-200">Check in here to unlock the next part of the hunt. Your progress is saved automatically.</p>
      <form action={scanCheckpointAction.bind(null, checkpoint.token)} className="mt-8">
        <button type="submit" className="btn btn-blue w-full">Check in &amp; reveal clue <span aria-hidden>›</span></button>
      </form>
    </Shell>
  );
}
