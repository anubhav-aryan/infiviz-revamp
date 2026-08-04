import type { Metadata } from "next";
import {
  CLIENT,
  COLUMNS,
  CONDITIONS,
  CONDITIONS_HEADING,
  DAY_ONE,
  DAY_ONE_LATER,
  DAY_ONE_PANEL,
  HEADER,
  LEGEND,
  MATRIX_CORNER_LABEL,
  PHASES,
  PHASES_HEADING,
  PHASES_SUBHEADING,
  PHASE_FIELD_LABELS,
  READINESS_LABEL,
  ROWS,
} from "./_data/readiness-map";
import styles from "./readiness-map.module.css";

export const metadata: Metadata = {
  title: "Platform readiness map",
  description:
    "Which InfiViz surface exists, and in what state, across the four journey phases.",
};

export default function ReadinessMapPage() {
  return (
    <div className={styles.poster}>
      <div className={styles.header}>
        <div>
          <div className={styles.eyebrow}>{HEADER.eyebrow}</div>
          <h1 className={styles.title}>{HEADER.title}</h1>
          <p className={styles.lede}>{HEADER.lede}</p>
        </div>
        <div className={styles.client}>
          <div className={styles.clientName}>{CLIENT.name}</div>
          <div className={styles.clientNote}>{CLIENT.note}</div>
        </div>
      </div>

      <div className={styles.legend}>
        {LEGEND.map((entry) => (
          <div key={entry.kind} className={styles.legendItem}>
            <span className={styles.legendChip} data-kind={entry.kind}>
              {READINESS_LABEL[entry.kind]}
            </span>
            <div>
              <div className={styles.legendName}>
                {READINESS_LABEL[entry.kind]}
              </div>
              <div className={styles.legendDesc}>{entry.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.main}>
        <div className={styles.matrixCard}>
          <div className={styles.matrixHead}>
            <div className={styles.matrixCorner}>{MATRIX_CORNER_LABEL}</div>
            {COLUMNS.map((column) => (
              <div
                key={column.label}
                className={styles.columnHead}
                data-internal={column.internal}
              >
                {column.label}
              </div>
            ))}
          </div>

          {ROWS.map((row) => (
            <div key={row.num} className={styles.matrixRow}>
              <div className={styles.rowHead}>
                <div className={styles.rowTitle}>
                  <span className={styles.rowNum}>{row.num}</span>
                  <span className={styles.rowName}>{row.name}</span>
                </div>
                <div className={styles.rowNote}>{row.note}</div>
              </div>
              {row.cells.map((cell, index) => (
                <div
                  key={COLUMNS[index].label}
                  className={styles.cell}
                  data-kind={cell.kind}
                  title={cell.title}
                >
                  {READINESS_LABEL[cell.kind]}
                </div>
              ))}
            </div>
          ))}

          <div className={styles.conditions}>
            <div className={styles.conditionsHeading}>{CONDITIONS_HEADING}</div>
            {CONDITIONS.map((condition) => (
              <div key={condition.text} className={styles.condition}>
                <span
                  className={styles.conditionMarker}
                  data-kind={condition.kind}
                >
                  {READINESS_LABEL[condition.kind]}
                </span>
                <span>{condition.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.dayOne}>
          <div className={styles.dayOneKicker}>{DAY_ONE_PANEL.kicker}</div>
          <h2 className={styles.dayOneTitle}>{DAY_ONE_PANEL.title}</h2>
          <p className={styles.dayOneLede}>{DAY_ONE_PANEL.lede}</p>

          {DAY_ONE.map((surface) => (
            <div key={surface.name} className={styles.dayOneRow}>
              <span className={styles.dayOneDot} data-tone={surface.kind} />
              <span className={styles.dayOneName}>{surface.name}</span>
              <span className={styles.dayOneTag} data-tone={surface.kind}>
                {READINESS_LABEL[surface.kind]}
              </span>
            </div>
          ))}

          <div className={styles.dayOneLater}>
            <div className={styles.dayOneLaterHeading}>
              {DAY_ONE_PANEL.laterHeading}
            </div>
            {DAY_ONE_LATER.map((surface) => (
              <div key={surface.name} className={styles.dayOneLaterRow}>
                <span className={styles.dayOneLaterName}>{surface.name}</span>
                <span className={styles.dayOneTag} data-tone={surface.kind}>
                  {READINESS_LABEL[surface.kind]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.phases}>
        <div className={styles.phasesHead}>
          <h2 className={styles.phasesTitle}>{PHASES_HEADING}</h2>
          <span className={styles.phasesSub}>{PHASES_SUBHEADING}</span>
        </div>
        <div className={styles.phaseGrid}>
          {PHASES.map((phase) => (
            <div
              key={phase.num}
              className={styles.phaseCard}
              data-theme={phase.theme}
            >
              <div className={styles.phaseHeader}>
                <span className={styles.phaseBadge}>{phase.num}</span>
                <div>
                  <div className={styles.phaseName}>{phase.name}</div>
                  <div className={styles.phaseTag}>{phase.tag}</div>
                </div>
              </div>
              <div className={styles.phaseBody}>
                <div>
                  <div className={styles.phaseFieldLabel}>
                    {PHASE_FIELD_LABELS.given}
                  </div>
                  <div className={styles.phaseFieldValue}>{phase.given}</div>
                </div>
                <div>
                  <div className={styles.phaseFieldLabel}>
                    {PHASE_FIELD_LABELS.system}
                  </div>
                  <div className={styles.phaseFieldValue}>{phase.system}</div>
                </div>
                <div>
                  <div className={styles.phaseFieldLabel}>
                    {PHASE_FIELD_LABELS.sees}
                  </div>
                  <div className={styles.phaseFieldValue}>{phase.sees}</div>
                </div>
                <div className={styles.phaseTrigger}>
                  <div className={styles.phaseTriggerLabel}>
                    {phase.triggerLabel}
                  </div>
                  <div className={styles.phaseTriggerValue}>
                    {phase.trigger}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
