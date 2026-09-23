"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <p role="alert" className="border-3 border-coral shadow-hard-coral p-4 font-semibold">
          <span className="font-mono text-coral">ERR</span> {state.error}
        </p>
      )}
      <input name="password" type="password" required autoComplete="current-password" placeholder="password" className="field" />
      <button className="btn btn-blue w-full" disabled={pending}>
        {pending ? "Checking…" : "Enter"} <span aria-hidden>›</span>
      </button>
    </form>
  );
}
