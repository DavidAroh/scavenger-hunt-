/**
 * STAND-IN for the official RIL logo, redrawn from the press kit.
 * Swap in the official SVG from RIL's brand assets before launch.
 *
 * Kit rules honoured here: horizontal lockup only, white or black only, no effects,
 * no rotation, no containing shape, Open Sans Bold logotype.
 */
type Tone = "white" | "black";

const PATHS = [
  "M0 0H30V11H11V30H0Z", // top-left
  "M92 0H62V11H81V30H92Z", // top-right
  "M0 110V80H11V99H30V110Z", // bottom-left
  "M92 110V80H81V99H62V110Z", // bottom-right
];

function Marks() {
  return (
    <>
      {PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
      <circle cx="5.5" cy="39" r="5.5" />
      <rect x="0" y="54" width="11" height="18" />
      <rect x="81" y="38" width="11" height="18" />
      <circle cx="86.5" cy="71" r="5.5" />
    </>
  );
}

export function BrandIcon({ tone = "white", className = "h-10" }: { tone?: Tone; className?: string }) {
  return (
    <svg
      viewBox="0 0 92 110"
      role="img"
      aria-label="Renaissance Innovation Labs"
      className={className}
      fill={tone === "white" ? "#FFFFFF" : "#212120"}
    >
      <Marks />
    </svg>
  );
}

export function BrandLogo({ tone = "white", className = "h-11" }: { tone?: Tone; className?: string }) {
  const color = tone === "white" ? "#FFFFFF" : "#212120";
  return (
    <svg
      viewBox="0 0 280 110"
      role="img"
      aria-label="Renaissance Innovation Labs"
      className={className}
      fill={color}
    >
      <Marks />
      <g
        style={{ fontFamily: '"Open Sans Variable","Open Sans",sans-serif', fontWeight: 700, letterSpacing: "-0.01em" }}
        fontSize="26"
      >
        <text x="106" y="55">renaissance</text>
        <text x="106" y="79">innovation</text>
        <text x="106" y="103">Labs</text>
      </g>
    </svg>
  );
}
