"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { FinishedResult } from "@/lib/hunt";
import { BracketFrame, Starburst } from "../ui";
import { steps, RISE } from "@/lib/motion";
import { EVENT } from "@/lib/config";

/** Cascade the finish sections in after the stamp lands. */
const CASCADE = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.22 } } };

export function FinishView({
  result: r,
  firstName,
  prize,
}: {
  result: FinishedResult;
  firstName: string;
  prize: { description: string; completionReward: string; rafflePrize: string; topN: number };
}) {
  const mins = Math.floor(r.durationMs / 60000);
  const secs = Math.round((r.durationMs % 60000) / 1000);
  return (
    <motion.div className="space-y-8" variants={CASCADE} initial="hidden" animate="show">
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: -4 }}
          transition={{ duration: 0.3, ease: steps(5) }}
        >
          <Starburst className="h-44 w-44">
            <div className="font-bold text-3xl leading-none">DONE</div>
            <div className="font-mono text-xs mt-1">#{r.rank}</div>
          </Starburst>
        </motion.div>
        <motion.h1 variants={RISE} className="display mt-6">You recovered it, {firstName}.</motion.h1>
        <motion.p variants={RISE} className="mt-3 text-fog-200 font-light">
          The Director's treasure is yours. {mins}m {String(secs).padStart(2, "0")}s. Finisher #{r.rank}.
        </motion.p>
      </div>

      <motion.div variants={RISE}>
        <p className="label text-fog-300 text-center">Your claim code</p>
        <div className="mt-2 border-3 border-green shadow-hard-green py-5 text-center font-mono font-bold text-[2.4rem] tracking-wider select-all">
          {r.claimCode}
        </div>
        <p className="mt-3 text-center text-sm text-fog-300">Report to the RIL booth and show this screen to claim your prize.</p>
      </motion.div>

      <motion.div variants={RISE}>
        <BracketFrame tone={r.winner ? "green" : "blue"}>
          {r.winner ? (
            <p className="font-semibold text-lg leading-snug">
              You finished in the top {prize.topN} and qualify for {prize.description}. You also get {prize.completionReward}{r.raffle ? ` and one entry in the ${prize.rafflePrize} raffle` : ""}.
            </p>
          ) : r.raffle ? (
            <p className="font-semibold text-lg leading-snug">
              You still get {prize.completionReward} and one entry in the raffle for {prize.rafflePrize}. Claim your reward at the booth.
            </p>
          ) : (
            <p className="font-semibold text-lg leading-snug">
              You still get {prize.completionReward}. Come say hi at the booth to claim it.
            </p>
          )}
        </BracketFrame>
      </motion.div>

      <motion.div variants={RISE} className="text-center space-y-3">
        <Link href="/leaderboard" className="btn btn-paper w-full">
          See the leaderboard <span aria-hidden>›</span>
        </Link>
        <Link href="/experience" className="btn btn-blue w-full">
          Explore RIL, bootcamp and offers <span aria-hidden>›</span>
        </Link>
        <p className="text-sm text-fog-400">
          Want more? {EVENT.site} · {EVENT.social}. See you at the next one.
        </p>
      </motion.div>
    </motion.div>
  );
}
