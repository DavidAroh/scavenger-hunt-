import Link from "next/link";
import { ProgressBlocks } from "../ProgressBlocks";
import { QrScanner } from "./QrScanner";

type RouteClue = { qrNumber: number; clue: string; hint: string };

export function CheckpointStage({
  checkpoint,
  index,
  total,
}: {
  checkpoint: RouteClue;
  index: number;
  total: number;
}) {
  return (
    <section className="space-y-7" aria-labelledby="next-checkpoint-title">
      <div>
        <p className="label text-sky">Trail clue · QR {checkpoint.qrNumber}</p>
        <h1 id="next-checkpoint-title" className="display mt-3">Where does the trail lead?</h1>
        <p className="mt-4 text-lg text-fog-200 font-light">
          Solve this riddle to find your next physical checkpoint. Scan its fixed QR code to check in.
        </p>
      </div>

      <div className="border-3 border-blue bg-blue/10 p-5" aria-label={`Clue for QR ${checkpoint.qrNumber}`}>
        <p className="label text-green">Your riddle</p>
        <p className="mt-3 text-xl leading-relaxed text-paper">{checkpoint.clue}</p>
        <details className="mt-5 border-t border-paper/20 pt-4 text-fog-200">
          <summary className="cursor-pointer font-semibold text-paper underline underline-offset-4">Need a hint?</summary>
          <p className="mt-3 text-sm">{checkpoint.hint}</p>
        </details>
      </div>

      <div className="border-2 border-paper/30 p-4 text-sm text-fog-200">
        <p className="font-semibold text-paper">Route {String(index + 1).padStart(2, "0")} of {total}</p>
        <p className="mt-2">Stay inside the marked hunt area. If you need help, ask an RIL host.</p>
      </div>

      <QrScanner />

      <ProgressBlocks done={index} total={total} />

      <p className="text-sm text-fog-400">
        Changed phones or lost your session? <Link href="/recover" className="text-paper underline underline-offset-4">Resume your hunt</Link>.
      </p>
    </section>
  );
}

export function NextCheckpointClue({ checkpoint }: { checkpoint: RouteClue }) {
  return (
    <aside className="mb-7 border-3 border-blue bg-blue/10 p-5" aria-labelledby="next-trail-clue-title">
      <p className="label text-sky">Your next trail clue · QR {checkpoint.qrNumber}</p>
      <h2 id="next-trail-clue-title" className="mt-2 text-xl font-bold">Read this after your scan</h2>
      <p className="mt-3 text-lg leading-relaxed text-paper">{checkpoint.clue}</p>
      <details className="mt-4 border-t border-paper/20 pt-3 text-fog-200">
        <summary className="cursor-pointer font-semibold text-paper underline underline-offset-4">Need a hint?</summary>
        <p className="mt-2 text-sm">{checkpoint.hint}</p>
      </details>
      <p className="mt-4 text-xs text-fog-300">Solve the game challenge below, then follow this clue and scan the next QR.</p>
    </aside>
  );
}
