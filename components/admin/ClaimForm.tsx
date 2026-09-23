"use client";

import { useState, useTransition } from "react";
import { confirmClaim, lookupClaim, type ClaimLookup } from "@/app/admin/actions";

/** Booth staff: type the code, CHECK the name and contact hint with the person, then confirm. */
export function ClaimForm() {
  const [code, setCode] = useState("");
  const [res, setRes] = useState<ClaimLookup | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="panel p-5 shadow-hard-white">
      <p className="label text-fog-300">Claim a prize</p>
      <form
        className="mt-3 flex gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => setRes(await lookupClaim(code)));
        }}
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="RIL-XXXX"
          className="field font-mono uppercase"
          aria-label="Claim code"
        />
        <button className="btn btn-blue" disabled={pending || !code.trim()}>
          Look up
        </button>
      </form>

      {res && !res.found && <p className="mt-4 font-mono text-coral">✕ No such code.</p>}
      {res?.found && (
        <div className="mt-4 border-3 border-paper p-4 space-y-2">
          <p className="font-bold text-2xl">{res.name}</p>
          <p className="font-mono text-sm text-fog-300">
            contact: {res.contact} · finished {new Date(res.finishedAt).toLocaleTimeString()}
          </p>
          {res.claimedAt ? (
            <p className="font-mono text-coral">✕ Already claimed at {new Date(res.claimedAt).toLocaleTimeString()}</p>
          ) : (
            <button
              className="btn btn-blue mt-2"
              disabled={pending}
              onClick={() => start(async () => setRes(await confirmClaim(res.code)))}
            >
              Ask for ID, then mark claimed
            </button>
          )}
        </div>
      )}
    </div>
  );
}
