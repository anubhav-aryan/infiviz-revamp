"use client";

import { Hint } from "@/app/_components/hint";
import { Icon } from "@/app/_components/icon";
import { ACCURACY_PAIRS } from "../../_data/session-accuracy";
import styles from "../session-viewer.module.css";

/**
 * What recognition predicted against what a human counted on the same bay.
 *
 * This is where the screen's two availability figures stop contradicting each
 * other: 72% is the model's, 75% is the auditor's, and the three-point gap is
 * the finding rather than a bug in either. It leads the Summary tab for that
 * reason — a reader should meet the caveat with the headline, not two tabs
 * away from it.
 */
export function PredictedVsActual() {
  return (
    <>
      {ACCURACY_PAIRS.map((pair) => (
        <div key={pair.label} className={styles.accPair}>
          <div className={styles.accHead}>
            <span className={styles.metricLabelText}>{pair.label}</span>
            <Hint text={pair.definition} className={styles.infoIcon}>
              <Icon name="info" size={13} />
            </Hint>
          </div>

          <div className={styles.accGrid}>
            <div>
              <div className={styles.metaLabel}>Predicted</div>
              <div className={styles.accBig}>{pair.predicted.toFixed(1)}%</div>
            </div>
            <div>
              <div className={styles.metaLabel}>Actual</div>
              <div className={styles.accBig}>{pair.actual.toFixed(1)}%</div>
            </div>
            <div>
              <div className={styles.metaLabel}>Error</div>
              <div className={styles.accError} data-tone={pair.errorTone}>
                {pair.error}
              </div>
            </div>
          </div>

          <div className={styles.accTrackRow}>
            <span className={styles.accTrack}>
              <span className={styles.accBar} style={{ width: `${pair.accuracy}%` }} />
            </span>
            <span className={styles.accValue}>{pair.accuracy.toFixed(1)}%</span>
          </div>
        </div>
      ))}
    </>
  );
}
