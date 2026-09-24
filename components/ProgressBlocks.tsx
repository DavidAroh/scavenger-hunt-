import { CHECKPOINT_LABELS } from "@/lib/checkpoint-labels";

const POINTS = [
  [30, 50], [88, 50], [146, 50], [204, 50], [262, 50], [320, 50],
  [320, 132], [262, 132], [204, 132], [146, 132], [88, 132], [30, 132],
] as const;

/** A map-like, accessible trail that reflects the real server stage index. */
export function ProgressBlocks({ done, total }: { done: number; total: number }) {
  const cleared = Math.min(Math.max(done, 0), total);
  const current = Math.min(cleared, Math.max(total - 1, 0));
  const allFound = total > 0 && cleared === total;
  const currentName = allFound ? "Treasure recovered" : CHECKPOINT_LABELS[current] ?? `Waypoint ${current + 1}`;
  const places = Array.from({ length: total }, (_, i) => CHECKPOINT_LABELS[i] ?? `Waypoint ${i + 1}`);

  return (
    <section className="treasure-map" aria-label="Treasure hunt progress">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label text-fog-300">Your treasure map</p>
          <p className="mt-1 text-sm text-fog-200" aria-live="polite">
            {allFound ? "You found the treasure!" : <>You are here: <span className="font-semibold text-paper">{currentName}</span></>}
          </p>
        </div>
        <span className="shrink-0 border-2 border-paper/50 px-2 py-1 font-mono text-xs text-paper" aria-label={`${cleared} of ${total} steps complete`}>
          {cleared}/{total} found
        </span>
      </div>

      <div className="treasure-map__land mt-4" role="img" aria-label={`${cleared} of ${total} map locations found. ${allFound ? "Treasure recovered." : `Current location: ${currentName}.`}`}>
        <svg viewBox="0 0 350 182" className="treasure-map__svg" aria-hidden="true" focusable="false">
          {/* A hand-drawn trail linking the real event checkpoints. */}
          <path d="M10 38Q18 18 48 23L96 18Q120 12 149 22L199 15Q226 13 246 23L303 19Q336 23 340 48L335 82Q345 106 333 140Q327 164 297 163L249 169Q224 176 195 165L147 171Q119 176 99 164L48 169Q17 164 13 140L17 111Q7 88 14 65Z" fill="#e8d7ad" stroke="#b99c68" strokeWidth="2" />
          <path d="M24 41Q51 31 77 37M124 32Q144 26 166 35M239 35Q268 28 293 37M29 149Q55 157 79 148M221 151Q246 161 273 151" fill="none" stroke="#c7b17e" strokeWidth="2" strokeLinecap="round" />
          <path d="M24 52L88 52L146 52L204 52L262 52L320 52L320 132L262 132L204 132L146 132L88 132L30 132" fill="none" stroke="#8d7852" strokeWidth="4" strokeDasharray="3 7" strokeLinecap="round" strokeLinejoin="round" />
          {POINTS.slice(0, Math.min(total, POINTS.length) - 1).map(([x1, y1], i) => {
            const [x2, y2] = POINTS[i + 1];
            const isCleared = i < cleared;
            return (
              <line key={`trail-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={isCleared ? "#177ae5" : "transparent"} strokeWidth="4" strokeLinecap="round" />
            );
          })}

          {/* Small landmarks make the route feel like a place, without hiding the checkpoints. */}
          <g fill="none" stroke="#6c644f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M53 91l7-14 7 14m-11-5h8m-8 5v7m8-7v7" />
            <path d="M163 91q8-8 16 0v10h-16zM167 91v-5h8v5" />
            <path d="M282 91l8-14 8 14m-13-5h10m-10 5v7m10-7v7" />
            <path d="M107 112q9-10 18 0m-9-10v14" />
            <path d="M226 111l7-9 7 9-7 8z" />
          </g>

          {places.map((name, i) => {
            const [x, y] = POINTS[i] ?? POINTS[POINTS.length - 1];
            const isFound = i < cleared;
            const isCurrent = !allFound && i === current;
            return (
              <g key={`${name}-${i}`} className={isCurrent ? "treasure-map__current" : undefined}>
                {isCurrent && <circle cx={x} cy={y} r="16" fill="#29cc6e" opacity=".28" />}
                <circle cx={x} cy={y} r="11" fill={isFound ? "#177ae5" : isCurrent ? "#29cc6e" : "#f5edda"} stroke="#212120" strokeWidth="2.5" />
                <text x={x} y={y + 3.5} textAnchor="middle" fontSize="9" fontWeight="700" fontFamily="monospace" fill={isFound || isCurrent ? "#fff" : "#62573f"}>
                  {isFound ? "✓" : i + 1}
                </text>
              </g>
            );
          })}
          <path d="M30 50l-5-6v12z" fill="#212120" />
          <path d="M320 50l5-6v12z" fill="#212120" />
          <text x="24" y="29" fontSize="8" fontFamily="monospace" fontWeight="700" fill="#62573f">START</text>
          <text x="291" y="29" fontSize="8" fontFamily="monospace" fontWeight="700" fill="#62573f">NORTH</text>
          <text x="34" y="157" fontSize="8" fontFamily="monospace" fontWeight="700" fill="#62573f">VAULT</text>
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-fog-300" aria-hidden="true">
        <span className="inline-flex items-center gap-2"><span className="treasure-map__key treasure-map__key--found">✓</span>Found</span>
        <span className="inline-flex items-center gap-2"><span className="treasure-map__key treasure-map__key--current">•</span>You are here</span>
        <span className="inline-flex items-center gap-2"><span className="treasure-map__key treasure-map__key--ahead">·</span>Up ahead</span>
      </div>

      <ol className="sr-only" aria-label="Treasure trail checkpoints">
        {places.map((name, i) => (
          <li key={`${name}-status-${i}`} aria-current={!allFound && i === current ? "step" : undefined}>
            {i < cleared ? `${name}: found` : `Route stop ${String(i + 1).padStart(2, "0")}: ${!allFound && i === current ? "you are here" : "up ahead"}`}
          </li>
        ))}
      </ol>
    </section>
  );
}
