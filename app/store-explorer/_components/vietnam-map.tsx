import {
  type MapPin,
  type PinStatus,
  VN_HEIGHT,
  VN_PATH,
  VN_VIEWBOX,
} from "../_data/vietnam-map";

/** Matches the three-dot legend above the map. */
const PIN_COLOR: Record<PinStatus, string> = {
  today: "#4F46E5",
  range: "#A5B4FC",
  none: "#CBD5E1",
};

export function VietnamMap({ pins }: { pins: MapPin[] }) {
  return (
    // Vietnam is height-bound under the baked projection, so `meet` at a fixed
    // 520px height reproduces the design at any panel width.
    <svg
      viewBox={VN_VIEWBOX}
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height={VN_HEIGHT}
      style={{ display: "block" }}
      role="img"
      aria-label={`Map of Vietnam showing ${pins.length} stores, coloured by whether they were visited today, visited in range, or not visited`}
    >
      <path d={VN_PATH} fill="#EEF2FF" stroke="#C7D2FE" strokeWidth={1} />
      {pins.map((pin, i) => (
        <circle
          key={i}
          cx={pin.x}
          cy={pin.y}
          r={pin.s === "today" ? 4.6 : 3.8}
          fill={PIN_COLOR[pin.s]}
          stroke="#fff"
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}
