/** ASCII counter + block bar. Cleared = green with a plus, current = blinking blue, locked = striped. */
export function ProgressBlocks({ done, total }: { done: number; total: number }) {
  const ascii = `[${"#".repeat(done)}${"-".repeat(total - done)}]`;
  return (
    <div aria-label={`${done} of ${total} checkpoints cleared`}>
      <div className="flex items-center justify-between font-mono text-sm">
        <span className="text-green">{ascii}</span>
        <span className="text-fog-300">
          {done}/{total}
        </span>
      </div>
      <div className="mt-2 flex gap-1.5">
        {Array.from({ length: total }, (_, i) => {
          const cleared = i < done;
          const current = i === done;
          return (
            <div
              key={i}
              className={`h-8 flex-1 border-3 grid place-items-center font-bold leading-none ${
                cleared
                  ? "bg-green border-green text-ink"
                  : current
                    ? "bg-blue border-blue block-blink"
                    : "border-fog-500 pattern-stripes"
              }`}
            >
              {cleared ? "+" : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}
