"use client";

import { useActionState } from "react";
import { addRaffleEntryAction, type RaffleEntryState } from "@/app/admin/actions";

const initial: RaffleEntryState = {};

export function RaffleEntryForm() {
  const [state, action, pending] = useActionState(addRaffleEntryAction, initial);
  return (
    <form action={action} className="panel p-5 space-y-4">
      <div>
        <p className="label text-fog-300">Raffle desk</p>
        <h2 className="mt-1 text-xl font-bold">Award an activity entry</h2>
        <p className="mt-1 text-xs text-fog-400">Confirm the activity or purchase before adding the entry. Completing the hunt already gives one raffle entry.</p>
      </div>
      <label className="block"><span className="label text-fog-300">Registered email or phone</span><input className="field mt-2" name="contact" required autoComplete="off" placeholder="hunter@example.com" /></label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block"><span className="label text-fog-300">Contact type</span><select name="mode" className="field mt-2"><option value="email">Email</option><option value="phone">Phone</option></select></label>
        <label className="block"><span className="label text-fog-300">Verified activity</span><select name="reason" className="field mt-2" required><option value="">Select</option><option value="versus">RIL Versus</option><option value="merch">Merch purchase</option><option value="demo">RIL demo</option></select></label>
      </div>
      {state.error && <p role="alert" className="border-3 border-coral p-3 text-sm"><span className="font-mono text-coral">ERR</span> {state.error}</p>}
      {state.message && <p role="status" className="border-3 border-green p-3 text-sm">{state.message}</p>}
      <button disabled={pending} className="btn btn-blue w-full" type="submit">{pending ? "Saving…" : "Add raffle entry"}</button>
    </form>
  );
}
