"use client";

import { useActionState, useState } from "react";
import { recoverAction, type RecoverState } from "@/app/recover/actions";

export function RecoverForm() {
  const [state, action, pending] = useActionState<RecoverState, FormData>(recoverAction, {});
  const [mode, setMode] = useState<"email" | "phone">("email");
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="mode" value={mode} />
      {state.error && (
        <div role="alert" className="border-3 border-coral shadow-hard-coral p-4 font-semibold">
          <span className="font-mono text-coral">ERR</span> {state.error}
        </div>
      )}
      <div className="grid grid-cols-2 border-3 border-paper">
        {(["email", "phone"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`min-h-[48px] font-bold uppercase tracking-label text-xs ${mode === m ? "bg-paper text-ink" : ""}`}
          >
            {m}
          </button>
        ))}
      </div>
      <input
        key={mode}
        name="contact"
        required
        type={mode === "email" ? "email" : "tel"}
        inputMode={mode === "email" ? "email" : "tel"}
        placeholder={mode === "email" ? "the email you registered with" : "the phone you registered with"}
        className="field"
      />
      <button type="submit" disabled={pending} className="btn btn-blue w-full">
        {pending ? "Looking…" : "Resume hunt"} <span aria-hidden>›</span>
      </button>
    </form>
  );
}
