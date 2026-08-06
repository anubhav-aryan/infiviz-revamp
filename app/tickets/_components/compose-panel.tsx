"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/app/_components/icon";
import { Avatar } from "./bits";
import { SOURCES, type Suggestion } from "../_data/tickets";
import { assignableTo, PERSONA_ACTOR } from "../_data/people";
import styles from "./tickets.module.css";

/**
 * New ticket, or a suggestion being turned into one.
 *
 * The assignee list is `assignableTo(persona)` — a persona can only assign
 * downward, so an executive sees leads and supervisors while a field supervisor
 * sees merchandisers. That constraint is the point of the screen, so the form
 * enforces it rather than offering everyone.
 *
 * Submitting does nothing but close: this is a mockup, and the note under the
 * buttons says so rather than pretending the ticket was filed.
 */

export function ComposePanel({
  persona,
  suggestion,
  onClose,
}: {
  persona: string;
  suggestion?: Suggestion;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const options = assignableTo(persona);
  const reporter = PERSONA_ACTOR[persona];

  const [title, setTitle] = useState(suggestion?.title ?? "");
  const [detail, setDetail] = useState(suggestion?.detail ?? "");
  const [assignee, setAssignee] = useState(
    suggestion?.assigneeId && options.some((p) => p.id === suggestion.assigneeId)
      ? suggestion.assigneeId
      : (options[0]?.id ?? ""),
  );
  const [priority, setPriority] = useState(suggestion?.priority ?? "medium");

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <div className={styles.scrim} onClick={onClose} role="presentation">
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={suggestion ? "Create ticket from suggestion" : "New ticket"}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.panelHead}>
          <span className={styles.panelEyebrow}>
            {suggestion ? "Create from suggestion" : "New ticket"}
          </span>
          <button
            ref={closeRef}
            type="button"
            className={styles.panelClose}
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="x" size={16} />
          </button>
        </header>

        <div className={styles.panelBody}>
          {suggestion ? (
            <p className={styles.sourceLink} data-static="true">
              <Icon name="star" size={13} />
              From {SOURCES[suggestion.source].label}
            </p>
          ) : null}

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Summary</span>
            <input
              className={styles.input}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What needs doing?"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Description</span>
            <textarea
              className={styles.textarea}
              rows={4}
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              placeholder="Context, and what done looks like."
            />
          </label>

          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                Assignee
                <span className={styles.fieldHint}>
                  {reporter ? `you are ${reporter.role}` : ""}
                </span>
              </span>
              <select
                className={styles.input}
                value={assignee}
                onChange={(event) => setAssignee(event.target.value)}
              >
                {options.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} — {person.role}
                    {person.region !== "National" ? ` · ${person.region}` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field} data-narrow="true">
              <span className={styles.fieldLabel}>Priority</span>
              <select
                className={styles.input}
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as typeof priority)
                }
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
          </div>

          <div className={styles.reporterLine}>
            <span className={styles.fieldLabel}>Reporter</span>
            <span className={styles.person}>
              <Avatar name={reporter?.name ?? "—"} />
              <span>
                {reporter?.name ?? "—"}
                {reporter ? (
                  <span className={styles.personRole}>{reporter.role}</span>
                ) : null}
              </span>
            </span>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.ghostButton} onClick={onClose}>
              Cancel
            </button>
            <button type="button" className={styles.primaryButton} onClick={onClose}>
              {suggestion ? "Create ticket" : "Create"}
            </button>
          </div>

          <p className={styles.mockNote}>
            Mockup — nothing is saved, and the board resets on reload.
          </p>
        </div>
      </div>
    </div>
  );
}
