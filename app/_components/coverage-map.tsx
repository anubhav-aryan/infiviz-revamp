import {
  COVERAGE_DOTS,
  COVERAGE_HEIGHT,
  COVERAGE_PATH,
  COVERAGE_VIEWBOX,
  type CoverageStatus,
} from "@/app/_data/vietnam-coverage-map";

/** Matches the three-dot legend on the coverage card. */
const DOT_COLOR: Record<CoverageStatus, string> = {
  covered: "#4F46E5",
  overdue: "#F59E0B",
  notyet: "#CBD5E1",
};

export function CoverageMap() {
  return (
    <svg
      viewBox={COVERAGE_VIEWBOX}
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height={COVERAGE_HEIGHT}
      style={{ display: "block" }}
      role="img"
      aria-label="Map of Vietnam showing covered, overdue, and not-yet-visited stores"
    >
      <path d={COVERAGE_PATH} fill="#F1F5F9" stroke="#CBD5E1" strokeWidth={1} />
      {COVERAGE_DOTS.map((dot, i) => (
        <circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r={dot.s === "covered" ? 3.4 : 3.8}
          fill={DOT_COLOR[dot.s]}
          stroke="#fff"
          strokeWidth={0.8}
          opacity={dot.s === "notyet" ? 0.9 : 1}
        />
      ))}
    </svg>
  );
}
