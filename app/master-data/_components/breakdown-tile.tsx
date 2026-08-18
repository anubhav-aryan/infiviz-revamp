import type { MiniBar } from "../_data/stores";
import styles from "./master-data.module.css";

/**
 * A summary tile whose body is a bar list rather than a number. Shared by every
 * Master data board — the tiles differ only in their label, data and bar tint.
 */
export function BreakdownTile({
  label,
  bars,
  tone,
}: {
  label: string;
  bars: MiniBar[];
  tone?: "light";
}) {
  return (
    <div className={styles.tile}>
      <div className={`${styles.tileLabel} ${styles.tileLabelBars}`}>{label}</div>
      {bars.map((bar) => (
        <div key={bar.name} className={styles.miniRow}>
          <span className={styles.miniName}>{bar.name}</span>
          <span className={styles.miniTrack}>
            <span
              className={styles.miniFill}
              data-tone={tone}
              style={{ width: `${bar.w}%` }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}
