import { Fragment } from "react";
import type { RankRow, RibbonSegment } from "../_data/analytics";
import { RANK_TARGET_LINE } from "../_data/analytics";
import styles from "./analytics.module.css";

/**
 * Band A. The design's loop emits a separator after every item including the
 * last, so the strip ends on a trailing middot — reproduced as authored.
 */
export function StatStrip({ items }: { items: string[] }) {
  return (
    <div className={styles.statStrip}>
      {items.map((item) => (
        <Fragment key={item}>
          <span>{item}</span>
          <span className={styles.statSep}>·</span>
        </Fragment>
      ))}
    </div>
  );
}

type SegmentedProps<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  label: string;
};

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: SegmentedProps<T>) {
  return (
    <div className={styles.segmented} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={styles.segButton}
          data-active={option === value}
          aria-pressed={option === value}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

type SparklineProps = {
  points: string;
  viewBox: string;
  className: string;
  strokeWidth: number;
  round?: boolean;
};

export function Sparkline({
  points,
  viewBox,
  className,
  strokeWidth,
  round,
}: SparklineProps) {
  return (
    <svg viewBox={viewBox} className={className} aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="var(--neutral-400)"
        strokeWidth={strokeWidth}
        strokeLinecap={round ? "round" : undefined}
        strokeLinejoin={round ? "round" : undefined}
      />
    </svg>
  );
}

type RankedListProps = {
  rows: RankRow[];
  variant: "exec" | "regional" | "field";
};

/**
 * Band C's ranked rows. Only the executive view makes rows clickable, carries
 * the store-count sub-line and overlays the dashed 85% target.
 */
export function RankedList({ rows, variant }: RankedListProps) {
  const isExec = variant === "exec";

  const body = rows.map((row) => {
    const cells = (
      <>
        <span className={styles.rankName}>{row.name}</span>
        <span className={styles.rankTrack}>
          <span className={styles.rankBar} style={{ width: `${row.w}%` }} />
        </span>
        <span className={styles.rankValue}>
          <span className={styles.rankOsa}>{row.osa}</span>
          <span className={styles.smallDelta} data-tone={row.tone}>
            {row.delta}
          </span>
        </span>
      </>
    );

    return (
      <Fragment key={row.name}>
        {isExec ? (
          <button
            type="button"
            className={styles.rankRow}
            data-variant={variant}
            aria-label={`${row.name} — OSA ${row.osa}%`}
          >
            {cells}
          </button>
        ) : (
          <div className={styles.rankRow} data-variant={variant}>
            {cells}
          </div>
        )}
        {isExec ? (
          <div className={styles.rankStores}>{row.stores} stores</div>
        ) : null}
      </Fragment>
    );
  });

  if (!isExec) return <>{body}</>;

  return (
    <div className={styles.rankWrap}>
      <div className={styles.rankTargetLine} style={{ left: RANK_TARGET_LINE }} />
      {body}
    </div>
  );
}

type RibbonProps = {
  segments: RibbonSegment[];
  variant: "summary" | "brands" | "store";
  /** Band B's summary ribbon is the one place the design omits the tooltips. */
  titled?: boolean;
};

export function Ribbon({ segments, variant, titled = true }: RibbonProps) {
  return (
    <div className={styles.ribbonWrap}>
      <div className={styles.ribbon} data-variant={variant}>
        {segments.map((seg) => (
          <span
            key={seg.label}
            title={titled ? seg.label : undefined}
            className={styles.ribbonSeg}
            style={{ width: `${seg.w}%`, background: seg.bg, color: seg.fg }}
          >
            {seg.short}
          </span>
        ))}
      </div>
      <div className={styles.ribbonShelf} />
    </div>
  );
}

type RibbonLegendProps = {
  segments: RibbonSegment[];
  /** The brand ribbon prints each share; the store ribbon prints names only. */
  showShare: boolean;
  variant?: "store";
};

export function RibbonLegend({
  segments,
  showShare,
  variant,
}: RibbonLegendProps) {
  return (
    <div className={styles.ribbonLegend} data-variant={variant}>
      {segments.map((seg) => (
        <span key={seg.label} className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ background: seg.bg }} />
          {showShare ? `${seg.label} ${seg.w}%` : seg.label}
        </span>
      ))}
    </div>
  );
}
