import { Icon } from "@/app/_components/icon";
import { DELTA_ICON, type Delta } from "./thresholds";
import styles from "./reports.module.css";

/* The design drew every mark by hand in inline styles. These are the four that
   recur across both reports; only the values that actually vary per datum
   (bar widths, meter and rule positions) stay inline. */

type BarProps = {
  /** Fill width as a percentage of the track. */
  pct: number;
  height: 6 | 10 | 11 | 12;
  fill?: "indigo-300" | "indigo-400" | "indigo-500";
  /** `fluid` fills its grid cell; the fixed widths are for in-table bars. */
  track?: "fluid" | "w56" | "w90";
};

export function Bar({
  pct,
  height,
  fill = "indigo-500",
  track = "fluid",
}: BarProps) {
  return (
    <span
      className={styles.barTrack}
      data-h={height}
      data-fill={fill}
      data-track={track}
    >
      <span className={styles.barFill} style={{ width: `${pct}%` }} />
    </span>
  );
}

type DeltaChipProps = Delta & {
  size: "hero" | "inline";
};

export function DeltaChip({ direction, tone, label, size }: DeltaChipProps) {
  return (
    <span className={styles.delta} data-tone={tone} data-size={size}>
      <Icon name={DELTA_ICON[direction]} />
      {label}
    </span>
  );
}

type TargetMeterProps = {
  pct: number;
  /** Position of the tick, as a percentage along the same track. */
  targetPct: number;
};

export function TargetMeter({ pct, targetPct }: TargetMeterProps) {
  return (
    <div className={styles.meter}>
      <div className={styles.meterFill} style={{ width: `${pct}%` }} />
      <div className={styles.meterTick} style={{ left: `${targetPct}%` }} />
    </div>
  );
}

type TargetHeroProps = {
  label: string;
  /** Rendered ahead of a smaller `%`, so it carries no unit itself. */
  value: string;
  delta: Delta;
  caption: string;
  pct: number;
  targetPct: number;
  statusLabel: string;
  targetLabel: string;
  /** `lg` is Photo quality's 48px numeral, `md` is coverage's 44px. */
  size: "lg" | "md";
};

export function TargetHero({
  label,
  value,
  delta,
  caption,
  pct,
  targetPct,
  statusLabel,
  targetLabel,
  size,
}: TargetHeroProps) {
  return (
    <div>
      <div className={styles.heroLabel}>{label}</div>
      <div className={styles.heroValueRow}>
        <span className={styles.heroValue} data-size={size}>
          {value}
          <span className={styles.heroUnit} data-size={size}>
            %
          </span>
        </span>
        <DeltaChip {...delta} size="hero" />
      </div>
      <div className={styles.heroCaption}>{caption}</div>

      <TargetMeter pct={pct} targetPct={targetPct} />

      <div className={styles.meterFoot}>
        <span>{statusLabel}</span>
        <span className={styles.meterFootTarget}>{targetLabel}</span>
      </div>
    </div>
  );
}

type TargetRuleProps = {
  /** Where the target falls along the bar column, 0–1 of the bar domain. */
  fraction: number;
  /** Stops the rule short of the bottom, as the rejection-rate card does. */
  inset?: boolean;
};

export function TargetRule({ fraction, inset = false }: TargetRuleProps) {
  return (
    <div
      className={styles.targetRule}
      data-inset={inset}
      style={{ left: `calc(160px + (100% - 224px) * ${fraction})` }}
      aria-hidden="true"
    />
  );
}
