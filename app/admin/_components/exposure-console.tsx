"use client";

import { useState } from "react";
import { Icon } from "@/app/_components/icon";
import { Segmented } from "@/app/_charts/segmented";
import {
  CHART_KINDS,
  INITIAL_STATE,
  pendingChanges,
  type ChartKind,
  type ExposureState,
} from "../_data/exposure";
import styles from "./admin.module.css";

/**
 * The PDM's console: which metrics this client sees, and how each is drawn.
 *
 * The person who knows the account picks what it exposes, instead of routing
 * every change through one engineer. What they cannot do is change how anything
 * is computed — see the note in `exposure.ts`. Divergent numbers come from
 * divergent computation, so computation stays put and only presentation moves.
 *
 * Nothing reaches the client until Publish. Staging is the working copy, the
 * Preview toggle shows the client's view of it, and the publish button states
 * how many metrics are about to change so it is never an accident.
 */

const VIEWS = [
  { id: "staging", label: "Staging" },
  { id: "published", label: "What the client sees" },
] as const;

export function ExposureConsole() {
  const [state, setState] = useState<ExposureState>(INITIAL_STATE);
  const [view, setView] = useState<"staging" | "published">("staging");
  const [justPublished, setJustPublished] = useState(false);

  const pending = pendingChanges(state);
  const editing = view === "staging";
  const shown = editing ? state.staged : state.published;
  const rows = Object.values(shown);

  const update = (moduleId: string, patch: Partial<{ exposed: boolean; chart: ChartKind }>) => {
    setJustPublished(false);
    setState((current) => ({
      ...current,
      staged: {
        ...current.staged,
        [moduleId]: { ...current.staged[moduleId], ...patch },
      },
    }));
  };

  const publish = () => {
    setState((current) => ({ ...current, published: { ...current.staged } }));
    setJustPublished(true);
    setView("published");
  };

  return (
    <div className={styles.console}>
      <div className={styles.consoleHead}>
        <div>
          <h1 className={styles.title}>Metrics &amp; charts</h1>
          <p className={styles.subtitle}>
            Choose what Colgate-Palmolive Vietnam sees, and how each metric is
            drawn. Presentation only — how a number is calculated is not
            configurable, which is what keeps two clients from getting two
            answers to the same question.
          </p>
        </div>
        <Segmented options={VIEWS} value={view} onChange={setView} label="View" />
      </div>

      <div className={styles.publishBar} data-pending={pending.length > 0}>
        {pending.length > 0 ? (
          <>
            <Icon name="alert-circle" size={15} />
            <span>
              <b>{pending.length}</b>{" "}
              {pending.length === 1 ? "metric differs" : "metrics differ"} from what
              the client is seeing.
            </span>
            <button type="button" className={styles.publishButton} onClick={publish}>
              <Icon name="check" size={14} />
              Publish to client
            </button>
          </>
        ) : (
          <>
            <Icon name={justPublished ? "check-circle-2" : "shield-check"} size={15} />
            <span>
              {justPublished
                ? "Published. The client's dashboard now matches staging."
                : "Staging matches what the client is seeing."}
            </span>
          </>
        )}
      </div>

      <div className={styles.metricTable}>
        <div className={styles.metricHeadRow}>
          <span>Metric</span>
          <span>Shown to client</span>
          <span>Chart type</span>
        </div>

        {rows.map((row) => {
          const changed = pending.includes(row.moduleId);
          return (
            <div
              key={row.moduleId}
              className={styles.metricRow}
              data-changed={editing && changed}
              data-off={!row.exposed}
            >
              <span className={styles.metricName}>
                {row.label}
                {editing && changed ? (
                  <span className={styles.changedChip}>changed</span>
                ) : null}
              </span>

              <span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={row.exposed}
                  aria-label={`Show ${row.label} to the client`}
                  className={styles.switch}
                  data-on={row.exposed}
                  disabled={!editing}
                  onClick={() => update(row.moduleId, { exposed: !row.exposed })}
                >
                  <span className={styles.switchKnob} />
                </button>
              </span>

              <span>
                <select
                  className={styles.chartSelect}
                  value={row.chart}
                  disabled={!editing || !row.exposed}
                  aria-label={`Chart type for ${row.label}`}
                  onChange={(event) =>
                    update(row.moduleId, { chart: event.target.value as ChartKind })
                  }
                >
                  {CHART_KINDS.map((kind) => (
                    <option key={kind.id} value={kind.id}>
                      {kind.label} — {kind.note}
                    </option>
                  ))}
                </select>
              </span>
            </div>
          );
        })}
      </div>

      {!editing ? (
        <p className={styles.readOnlyNote}>
          <Icon name="lock" size={12} />
          This is the client&apos;s view, shown read-only. Switch to Staging to make
          changes.
        </p>
      ) : null}
    </div>
  );
}
