"use client";

import { useActionState, useState } from "react";
import { motion } from "framer-motion";
import { registerAction, type GateState } from "@/app/play/actions";
import { BracketFrame } from "./ui";
import { ENTER, STAGGER } from "@/lib/motion";

const initial: GateState = {};
const row = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: ENTER } };

export function Gate({
  interests,
  roles,
  ageRanges,
  consentText,
  marketingText,
  consentRequired,
  programsText,
  startToken,
}: {
  interests: string[];
  roles: string[];
  ageRanges: string[];
  consentText: string;
  marketingText: string;
  consentRequired: boolean;
  programsText: string;
  startToken: string;
}) {
  const [state, action, pending] = useActionState(registerAction, initial);
  const v = state.values;
  const [mode, setMode] = useState<"email" | "phone">((v?.mode as "email" | "phone") ?? "email");
  const [picked, setPicked] = useState<string[]>(v?.interest ?? []);
  const [role, setRole] = useState<string>(v?.role ?? "");
  const [age, setAge] = useState<string>(v?.ageRange ?? "");

  // Start expanded only if the player already filled an optional field (e.g. after an error round-trip).
  const hasOptional = !!(v?.handle || v?.interest?.length || v?.role || v?.ageRange || v?.wantsPrograms || v?.marketingConsent);
  const [expanded, setExpanded] = useState(hasOptional);

  const toggle = (i: string) => setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));

  return (
    <motion.form action={action} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={ENTER} className="space-y-7">
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="startToken" value={startToken} />
      <input type="hidden" name="role" value={role} />
      <input type="hidden" name="ageRange" value={age} />
      {/* honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <p className="label text-sky">Enter the hunt</p>
        <h1 className="display mt-3">
          Register to <span className="text-blue bg-paper px-2 mx-1">begin</span> the chase
        </h1>
        <p className="mt-4 text-fog-200 font-light">
          Name plus email or phone. Then the treasure hunt begins. 😎
        </p>
      </div>

      {state.error && (
        <motion.div role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={ENTER} className="border-3 border-coral shadow-hard-coral p-4 font-semibold">
          <span className="font-mono text-coral">ERR</span> {state.error}
        </motion.div>
      )}

      <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: STAGGER } } }}>
        <motion.label variants={row} className="block">
          <span className="label text-fog-300">Your name</span>
          <input name="name" required minLength={2} maxLength={60} autoFocus autoComplete="name" defaultValue={v?.name} placeholder="Ada Lovelace" className="field mt-2" />
        </motion.label>

        <motion.div variants={row}>
          <span className="label text-fog-300">Reach me by</span>
          <div role="tablist" aria-label="Contact method" className="mt-2 grid grid-cols-2 border-3 border-paper">
            {(["email", "phone"] as const).map((m) => (
              <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={`min-h-[48px] font-bold uppercase tracking-label text-xs ${mode === m ? "bg-paper text-ink" : "bg-ink text-paper"}`}>
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
            autoComplete={mode === "email" ? "email" : "tel"}
            defaultValue={v?.mode === mode ? v.contact : ""}
            placeholder={mode === "email" ? "you@example.com" : "0803 000 0000"}
            className="field mt-3"
          />
        </motion.div>

        <motion.label variants={row} className="flex gap-3 items-start cursor-pointer">
          <input type="checkbox" name="consent" defaultChecked={v?.consent} required={consentRequired} className="mt-1 h-6 w-6 shrink-0 accent-blue" />
          <span className="text-sm text-fog-200 font-light leading-snug">{consentText}</span>
        </motion.label>

        <motion.label variants={row} className="flex gap-3 items-start cursor-pointer">
          <input type="checkbox" name="marketingConsent" defaultChecked={v?.marketingConsent} className="mt-1 h-6 w-6 shrink-0 accent-blue" />
          <span className="text-sm text-fog-200 font-light leading-snug">{marketingText}</span>
        </motion.label>

        <motion.div variants={row}>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className="flex items-center gap-2 label text-fog-300 hover:text-paper min-h-[44px]"
          >
            <span aria-hidden className={`inline-block transition-transform ${expanded ? "rotate-90" : ""}`}>›</span>
            Tell us more (optional)
          </button>

          <div className={expanded ? "mt-4 space-y-6" : "hidden"}>
            <label className="block">
              <span className="label text-fog-300">Hunter handle</span>
              <input name="handle" maxLength={24} autoComplete="off" defaultValue={v?.handle} placeholder="GHOST_07" className="field mt-2 font-mono" />
              <span className="mt-1 block text-xs text-fog-400">Shown on the leaderboard. Leave blank to use your name.</span>
            </label>

            <fieldset>
              <legend className="label text-fog-300">What are you into?</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {interests.map((i) => {
                  const on = picked.includes(i);
                  return (
                    <label key={i} className={`cursor-pointer border-3 px-3 min-h-[44px] grid place-items-center text-sm font-semibold select-none ${on ? "bg-blue border-blue text-paper" : "border-paper"}`}>
                      <input type="checkbox" name="interest" value={i} checked={on} onChange={() => toggle(i)} className="sr-only" />
                      {on ? "+ " : ""}
                      {i}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="label text-fog-300">You're a…</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {roles.map((r) => {
                  const on = role === r;
                  return (
                    <button key={r} type="button" aria-pressed={on} onClick={() => setRole(on ? "" : r)} className={`border-3 px-3 min-h-[44px] text-sm font-semibold select-none ${on ? "bg-blue border-blue text-paper" : "border-paper"}`}>
                      {on ? "+ " : ""}
                      {r}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="label text-fog-300">Age range</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {ageRanges.map((a) => {
                  const on = age === a;
                  return (
                    <button key={a} type="button" aria-pressed={on} onClick={() => setAge(on ? "" : a)} className={`border-3 px-3 min-h-[44px] text-sm font-semibold font-mono select-none ${on ? "bg-blue border-blue text-paper" : "border-paper"}`}>
                      {a}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <label className="flex gap-3 items-start cursor-pointer">
              <input type="checkbox" name="wantsPrograms" defaultChecked={v?.wantsPrograms} className="mt-1 h-6 w-6 shrink-0 accent-blue" />
              <span className="text-sm text-fog-200 font-light leading-snug">{programsText}</span>
            </label>
          </div>
        </motion.div>
      </motion.div>

      <BracketFrame tone="blue" className="!py-3">
        <button type="submit" disabled={pending} className="btn btn-blue w-full">
          {pending ? "Entering…" : "Enter the hunt"} <span aria-hidden>›</span>
        </button>
      </BracketFrame>
    </motion.form>
  );
}
