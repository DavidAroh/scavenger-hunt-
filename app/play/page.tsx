import { Shell } from "@/components/Shell";
import { Gate } from "@/components/Gate";
import { StageRouter } from "@/components/play/StageRouter";
import { AGE_RANGES, CONSENT_REQUIRED, CONSENT_TEXT, INTERESTS, MARKETING_TEXT, PRIZE, PROGRAMS_TEXT, ROLES } from "@/lib/config";
import { getGameState } from "@/lib/hunt";
import { getParticipant } from "@/lib/session";
import { isStorageReady } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * The hunt itself. One entry point (the booth QR → "/" → here). Flow:
 *  1. no session  -> registration gate (every play-through captures a lead)
 *  2. registered  -> getGameState() returns the earned stage; StageRouter renders it
 */
export default async function PlayPage() {
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
        <Gate
          interests={INTERESTS}
          roles={ROLES}
          ageRanges={AGE_RANGES}
          consentText={CONSENT_TEXT}
          marketingText={MARKETING_TEXT}
          consentRequired={CONSENT_REQUIRED}
          programsText={PROGRAMS_TEXT}
        />
      </Shell>
    );
  }

  const state = await getGameState(me);
  return (
    <Shell>
      <StageRouter
        state={state}
        firstName={me.name.split(" ")[0]}
        prize={{ description: PRIZE.description, completionReward: PRIZE.completionReward, rafflePrize: PRIZE.rafflePrize, topN: PRIZE.topN }}
      />
    </Shell>
  );
}
