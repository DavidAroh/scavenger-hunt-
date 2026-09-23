import type { ReactNode } from "react";

/** [ ] corner brackets around content, echoing the RIL icon (opening / conclusion). */
export function BracketFrame({ children, tone = "paper", className = "" }: { children: ReactNode; tone?: "paper" | "green" | "coral" | "blue"; className?: string }) {
  const c = { paper: "border-paper", green: "border-green", coral: "border-coral", blue: "border-blue" }[tone];
  const corner = `absolute w-5 h-5 ${c}`;
  return (
    <div className={`relative px-7 py-6 ${className}`}>
      <span className={`${corner} top-0 left-0 border-t-3 border-l-3`} />
      <span className={`${corner} top-0 right-0 border-t-3 border-r-3`} />
      <span className={`${corner} bottom-0 left-0 border-b-3 border-l-3`} />
      <span className={`${corner} bottom-0 right-0 border-b-3 border-r-3`} />
      {children}
    </div>
  );
}

/** Halftone dot field, brand pattern: dots grow row by row. Pure SVG, no JS. */
export function Halftone({ rows = 7, cols = 24, className = "" }: { rows?: number; cols?: number; className?: string }) {
  const gap = 14;
  const dots = [];
  for (let r = 0; r < rows; r++) {
    const radius = 0.8 + (r / (rows - 1)) * 4.6;
    for (let c = 0; c < cols; c++) dots.push(<circle key={`${r}-${c}`} cx={c * gap + gap / 2} cy={r * gap + gap / 2} r={radius} />);
  }
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${cols * gap} ${rows * gap}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      fill="currentColor"
    >
      {dots}
    </svg>
  );
}

/** Brand "excellence" starburst, used as the finish stamp. */
export function Starburst({ className = "", children }: { className?: string; children?: ReactNode }) {
  const points = 16;
  const pts = Array.from({ length: points * 2 }, (_, i) => {
    const a = (Math.PI * i) / points - Math.PI / 2;
    const r = i % 2 === 0 ? 50 : 41;
    return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
  return (
    <div className={`relative grid place-items-center ${className}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden>
        <polygon points={pts} fill="#29CC6E" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="miter" />
      </svg>
      <div className="relative text-ink text-center">{children}</div>
    </div>
  );
}

export function Tile({ label, value, tone = "paper" }: { label: string; value: ReactNode; tone?: "paper" | "blue" | "green" }) {
  const shadow = { paper: "shadow-hard-white", blue: "shadow-hard", green: "shadow-hard-green" }[tone];
  return (
    <div className={`panel p-4 ${shadow}`}>
      <div className="label text-fog-300">{label}</div>
      <div className="mt-2 text-4xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
