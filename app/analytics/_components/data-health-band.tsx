import { AskInfiChatButton } from "@/app/_components/chat/ask-infichat-button";
import chatStyles from "@/app/_components/chat/chat.module.css";
import { Hint } from "@/app/_components/hint";
import { Icon } from "@/app/_components/icon";
import { linePoints } from "@/app/_charts/geom";
import type { MonthKey } from "@/app/_time/periods";
import { DATA_HEALTH, dataHealthTiles } from "../_data/data-health";
import styles from "./analytics.module.css";

/**
 * Top-of-funnel data health, directly under the filter bar and above every
 * other figure — because it qualifies all of them. A dashboard that opens with
 * shelf metrics invites you to read them before knowing how much of the month's
 * capture is behind them.
 *
 * The first tile is a *pair*: captured on the left, processed on the right,
 * with the shortfall spelled out. Splitting them into two tiles would hide the
 * one thing worth seeing, which is the distance between them.
 */
export function DataHealthBand({ month }: { month: MonthKey }) {
  const health = DATA_HEALTH[month];
  const tiles = dataHealthTiles(health);

  return (
    <div className={styles.healthBand}>
      {/* captured → processed */}
      <div className={styles.healthTile}>
        <div className={styles.healthLabel}>
          {tiles.captured.label}
          <Hint
            text="Photos that reached the platform, and the subset that finished stitching and recognition."
            className={styles.healthInfo}
          >
            <Icon name="info" size={12} />
          </Hint>
        </div>
        <div className={styles.healthPair}>
          <span className={styles.healthValue}>{tiles.captured.value}</span>
          <Icon name="arrow-right" size={15} />
          <span className={styles.healthValue} data-muted="true">
            {tiles.captured.secondary}
          </span>
        </div>
        <div className={styles.healthCaption} data-warn={health.stalledPhotos > 0}>
          {tiles.captured.caption}
        </div>
      </div>

      {/* auditable */}
      <div className={styles.healthTile}>
        <div className={styles.healthLabel}>
          {tiles.auditable.label}
          <Hint
            text="Sessions that finished the pipeline and cleared quality gating — the ones an analysis can rest on."
            className={styles.healthInfo}
          >
            <Icon name="info" size={12} />
          </Hint>
        </div>
        <div className={styles.healthPair}>
          <span className={styles.healthValue}>{tiles.auditable.value}</span>
        </div>
        <div className={styles.healthCaption}>{tiles.auditable.caption}</div>
      </div>

      {/* auditable share, trended */}
      <div className={styles.healthTile}>
        <div className={styles.healthLabel}>
          {tiles.trend.label}
          <span className={chatStyles.askGroup}>
            <AskInfiChatButton label="Auditable share" compact />
          </span>
        </div>
        <div className={styles.healthPair}>
          <span className={styles.healthValue}>{tiles.trend.value}</span>
          <span
            className={styles.healthDelta}
            data-tone={health.shareDelta >= 0 ? "positive" : "negative"}
          >
            <Icon
              name={health.shareDelta >= 0 ? "arrow-up-right" : "arrow-down-right"}
              size={13}
            />
            {Math.abs(health.shareDelta)} pts
          </span>
          <ShareSpark series={health.shareSeries} />
        </div>
        <div className={styles.healthCaption}>{tiles.trend.caption}</div>
      </div>
    </div>
  );
}

/**
 * A share, not a count. Auditable sessions climb with rollout regardless of
 * quality, so plotting the count would show progress in a month where gating
 * got worse — see the note in `data-health.ts`.
 */
function ShareSpark({ series }: { series: number[] }) {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const points = linePoints(
    series.map((value, i) => ({
      x: (i / (series.length - 1)) * 100,
      // Padded to 4–26 of a 30-high box so the flattest series still reads.
      y: 26 - ((value - min) / span) * 22,
    })),
  );

  return (
    <svg viewBox="0 0 100 30" className={styles.healthSpark} aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="var(--indigo-500)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
