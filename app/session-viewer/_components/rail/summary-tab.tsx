"use client";

import { Hint } from "@/app/_components/hint";
import { Icon } from "@/app/_components/icon";
import { ACCURACY_AUTHOR, ACCURACY_OVERALL } from "../../_data/session-accuracy";
import { formatDelta, PREVIOUS_VISIT } from "../../_data/session-previous";
import {
  EXTRA_COUNTS,
  KPI_FOOTNOTE,
  OWN_VS_COMPETITION,
  SESSION_KPIS,
  type ExtraKind,
} from "../../_data/session-viewer";
import styles from "../session-viewer.module.css";
import { PredictedVsActual } from "./predicted-vs-actual";

/**
 * The session's answer, before its working-out.
 *
 * Six figures, an own-versus-competition split, and the accuracy pair that
 * qualifies the availability number. Everything here is a projection of data
 * the other four tabs render in full — this tab exists so that a reader who
 * only wants "how did this store do" never has to pick a tab to find out.
 *
 * `MSL gaps` is the one figure with somewhere to go, so it is the one that
 * carries an action.
 */
export function SummaryTab({
  shown,
  photos,
  onViewGaps,
}: {
  shown: Set<ExtraKind>;
  photos: number;
  onViewGaps: () => void;
}) {
  /* The facings figure never moves; what the toggles added to the stitch does. */
  const extraShown = EXTRA_COUNTS.filter((entry) => shown.has(entry.kind)).reduce(
    (total, entry) => total + entry.count,
    0,
  );

  const subFor = (label: string, authored: string) => {
    if (label === "Facings counted") return `+${extraShown} POSM / excluded shown`;
    if (label === "Photo quality") return `${photos} of ${photos} photos passed`;
    return authored;
  };

  return (
    <>
      <div className={styles.scopeRow} data-first="true">
        <span className={styles.blockTitle}>Session summary</span>
        <span className={styles.countCaption} style={{ marginBottom: 0 }}>
          {ACCURACY_OVERALL}% accuracy
        </span>
        <span
          className={styles.deltaChip}
          data-size="sm"
          data-good={ACCURACY_OVERALL >= PREVIOUS_VISIT.accuracyOverall}
          title="vs this store's previous visit"
        >
          {formatDelta(ACCURACY_OVERALL - PREVIOUS_VISIT.accuracyOverall, {
            unit: "pts",
            decimals: 1,
          })}
        </span>
      </div>

      <div className={styles.kpiGrid}>
        {SESSION_KPIS.map((kpi) => (
          <div key={kpi.label} className={styles.kpiCard}>
            <div className={styles.kpiLabelRow}>
              <span className={styles.kpiLabel}>{kpi.label}</span>
              <Hint text={kpi.definition} className={styles.infoIcon}>
                <Icon name="info" size={13} />
              </Hint>
            </div>
            <div className={styles.kpiValueRow}>
              <span className={styles.kpiValue} data-tone={kpi.tone}>
                {kpi.value}
              </span>
              {kpi.delta ? (
                <span
                  className={styles.deltaChip}
                  data-good={kpi.good}
                  title="vs this store's previous visit"
                >
                  {kpi.delta}
                </span>
              ) : null}
            </div>
            <div className={styles.kpiSub}>{subFor(kpi.label, kpi.sub)}</div>
            {kpi.action ? (
              <button type="button" className={styles.kpiAction} onClick={onViewGaps}>
                {kpi.action}
                <Icon name="arrow-right" size={12} />
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <div className={styles.kpiFootnote}>{KPI_FOOTNOTE}</div>

      <div className={styles.splitCard}>
        <div className={styles.splitHead}>
          <span>Own vs competition</span>
          <span className={styles.splitValue}>{OWN_VS_COMPETITION.label}</span>
        </div>
        <div className={styles.splitBar}>
          <span data-side="own" style={{ width: `${OWN_VS_COMPETITION.own}%` }} />
          <span
            data-side="competition"
            style={{ width: `${OWN_VS_COMPETITION.competition}%` }}
          />
        </div>
      </div>

      <div className={styles.scopeRow}>
        <span className={styles.blockTitle}>Predicted vs actual</span>
        <span className={styles.countCaption} style={{ marginBottom: 0 }}>
          {ACCURACY_AUTHOR}
        </span>
      </div>

      <PredictedVsActual />
    </>
  );
}
