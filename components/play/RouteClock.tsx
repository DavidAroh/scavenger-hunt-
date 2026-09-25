"use client";

import { useEffect, useState } from "react";
import { formatDuration } from "@/lib/validate";

export function RouteClock({ startedAt, finishedAt }: { startedAt: string; finishedAt: string | null }) {
  const [now, setNow] = useState(0);
  const start = new Date(startedAt).getTime();
  const finish = finishedAt ? new Date(finishedAt).getTime() : null;

  useEffect(() => {
    if (finish !== null) return;
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [finish]);

  const elapsed = Math.max(0, (finish ?? now) - start);
  return (
    <div className="mb-5 flex items-center justify-between gap-4 border-3 border-green px-4 py-3">
      <div>
        <p className="label text-green">Checkpoint race</p>
        <p className="mt-1 text-xs text-fog-300">Time stops when you scan QR 12.</p>
      </div>
      <time className="font-mono text-3xl font-bold tabular-nums text-green" aria-label={`Route time ${formatDuration(elapsed)}`}>
        {formatDuration(elapsed)}
      </time>
    </div>
  );
}
