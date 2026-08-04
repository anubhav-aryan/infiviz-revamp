import { Icon } from "@/app/_components/icon";
import {
  CALENDAR,
  MONTH_LABEL,
  PLAN_ROWS,
  WEEKDAYS,
  adherenceTier,
  type CalendarCell,
} from "../_data/journey-plans";
import styles from "./master-data.module.css";

/** Today wins over the weekend treatment, as in the design's cascade. */
function cellVariant(cell: CalendarCell) {
  if (cell.day === null) return "blank";
  if (cell.isToday) return "today";
  if (cell.rest) return "rest";
  return "plan";
}

export function JourneyPlansBoard() {
  return (
    <div className={styles.board}>
      <div className={styles.pageHead}>
        <div>
          <div className={styles.eyebrow}>Master data</div>
          <h1 className={styles.pageTitle}>Journey plans</h1>
        </div>

        <div className={styles.headActions}>
          <div className={styles.monthStepper}>
            <button
              type="button"
              className={styles.stepperArrow}
              aria-label="Previous month"
            >
              <Icon name="chevron-left" />
            </button>
            <span className={styles.monthLabel}>{MONTH_LABEL}</span>
            <button
              type="button"
              className={styles.stepperArrow}
              aria-label="Next month"
            >
              <Icon name="chevron-right" />
            </button>
          </div>
          <button type="button" className={styles.primaryButton}>
            <Icon name="download" />
            Export CSV
          </button>
        </div>
      </div>

      <div className={styles.calendarCard}>
        <div className={styles.calendarHead}>
          <span className={styles.tableTitle}>Planned vs completed visits</span>
          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <span className={styles.legendSwatch} data-tone="completed" />
              Completed
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendSwatch} data-tone="planned" />
              Planned
            </span>
          </div>
        </div>

        <div className={styles.weekRow}>
          {WEEKDAYS.map((weekday) => (
            <div key={weekday} className={styles.weekday}>
              {weekday}
            </div>
          ))}
        </div>

        <div className={styles.calendarGrid}>
          {CALENDAR.map((cell, index) => (
            <div
              key={cell.day ?? `blank-${index}`}
              className={styles.day}
              data-variant={cellVariant(cell)}
            >
              {cell.day === null ? null : (
                <>
                  <div className={styles.dayHead}>
                    <span
                      className={styles.dayNumber}
                      data-future={cell.isFuture || undefined}
                    >
                      {cell.day}
                    </span>
                    {cell.isToday ? (
                      <span className={styles.todayTag}>Today</span>
                    ) : null}
                  </div>

                  {cell.rest ? (
                    <div className={styles.dayRest}>—</div>
                  ) : (
                    <div className={styles.dayPlan}>
                      <div className={styles.dayCount}>
                        {cell.completed}
                        <span className={styles.dayPlanned}>/{cell.planned}</span>
                      </div>
                      <div className={styles.dayTrack}>
                        <span
                          className={styles.dayFill}
                          style={{ width: `${cell.fill}%` }}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.plansTitle}>Plans by merchandiser</div>

        <div className={`${styles.plansGrid} ${styles.columnHead}`}>
          <span>Merchandiser</span>
          <span>Region</span>
          <span>Stores</span>
          <span>Frequency</span>
          <span className={styles.right}>Planned</span>
          <span className={styles.right}>Done</span>
          <span className={styles.right}>Adherence</span>
        </div>

        {PLAN_ROWS.map((plan) => (
          <div key={plan.mrch} className={`${styles.plansGrid} ${styles.row}`}>
            <span className={styles.cellMrch}>{plan.mrch}</span>
            <span className={styles.cell}>{plan.region}</span>
            <span className={styles.cellNum}>{plan.stores}</span>
            <span className={styles.cell}>{plan.freq}</span>
            <span className={`${styles.cellNum} ${styles.right}`}>
              {plan.planned}
            </span>
            <span className={`${styles.cellNum} ${styles.right}`}>{plan.done}</span>
            <span className={styles.adherence}>
              <span className={styles.adhTrack}>
                <span
                  className={styles.adhFill}
                  style={{ width: `${plan.adh}%` }}
                />
              </span>
              <span
                className={styles.adhValue}
                data-tier={adherenceTier(plan.adh)}
              >
                {plan.adh}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
