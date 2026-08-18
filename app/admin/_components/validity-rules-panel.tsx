"use client";

import { useState } from "react";
import { Icon } from "@/app/_components/icon";
import { VALIDITY_RULES } from "../_data/validity-rules";
import styles from "./admin.module.css";

/**
 * Per-account thresholds for the three session-validity mechanisms.
 *
 * The badge on each rule is the important part of this screen: one of these can
 * remove a session on its own, and two of them can only ever ask a human. A
 * console that rendered all three identically would invite someone to set a
 * percentile cutoff expecting it to behave like the quality gate.
 *
 * Each rule shows what it would have caught in the authored month, because the
 * failure mode here is a queue nobody opens — and that is decided by these
 * numbers, not discovered later.
 */
export function ValidityRulesPanel() {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      VALIDITY_RULES.flatMap((rule) =>
        rule.fields.map((field) => [`${rule.id}.${field.key}`, field.value]),
      ),
    ),
  );

  const total = VALIDITY_RULES.reduce((sum, rule) => sum + rule.wouldCatch, 0);

  return (
    <div className={styles.console}>
      <div className={styles.consoleHead}>
        <div>
          <h1 className={styles.title}>Session validity</h1>
          <p className={styles.subtitle}>
            What makes a session stop counting, per account. Keep these tight —
            everything routed to review lands in one queue, and a queue that is
            too noisy is one nobody opens.
          </p>
        </div>
      </div>

      <div className={styles.publishBar} data-pending={total > 120}>
        <Icon name={total > 120 ? "alert-circle" : "shield-check"} size={15} />
        <span>
          These thresholds would have touched <b>{total}</b> sessions in July —{" "}
          {VALIDITY_RULES.filter((r) => r.outcome === "review").reduce(
            (s, r) => s + r.wouldCatch,
            0,
          )}{" "}
          of them sent to review rather than disabled.
        </span>
      </div>

      <div className={styles.ruleStack}>
        {VALIDITY_RULES.map((rule) => (
          <div key={rule.id} className={styles.ruleCard}>
            <div className={styles.ruleHead}>
              <div>
                <div className={styles.ruleName}>{rule.name}</div>
                <p className={styles.ruleNote}>{rule.note}</p>
              </div>
              <span className={styles.outcomeBadge} data-outcome={rule.outcome}>
                {rule.outcomeLabel}
              </span>
            </div>

            <div className={styles.ruleControls}>
              {rule.fields.map((field) => (
                <label key={field.key} className={styles.ruleField}>
                  <span className={styles.ruleLabel}>{field.label}</span>
                  <input
                    className={styles.ruleInput}
                    type="number"
                    value={values[`${rule.id}.${field.key}`]}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [`${rule.id}.${field.key}`]: Number(event.target.value),
                      }))
                    }
                  />
                  <span className={styles.ruleLabel}>{field.unit}</span>
                </label>
              ))}
              <span className={styles.ruleEffect}>
                Would have caught <b>{rule.wouldCatch}</b> sessions in July
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
