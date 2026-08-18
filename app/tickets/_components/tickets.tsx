"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Icon } from "@/app/_components/icon";
import { Segmented } from "@/app/_charts/segmented";
import charts from "@/app/_charts/charts.module.css";
import { ComposePanel } from "./compose-panel";
import { TicketFilters, type TicketFilterState, EMPTY_FILTERS } from "./ticket-filters";
import { TicketList } from "./ticket-list";
import { TicketPanel } from "./ticket-panel";
import {
  nameFor,
  ticketsForPersona,
  type Suggestion,
  type Ticket,
} from "../_data/tickets";
import { ticketContextFromParams, type TicketContext } from "../_data/ticket-context";
import { PERSONA_ACTOR } from "../_data/people";
import styles from "./tickets.module.css";

/**
 * The Tickets screen.
 *
 * A flat list of every raised ticket, and nothing else. The Kanban board that
 * used to lead this screen is gone: a board implies people drag work between
 * stages, and in this model nobody does — a ticket closes when the next visit's
 * IR output shows the problem resolved. Keeping the board would have advertised
 * an interaction that does not exist.
 *
 * The list is the visibility layer. Raising a ticket without being able to see
 * the ones already raised is assignment into a void, which is what this answers.
 *
 * All state is local and nothing persists — this is a mockup of the workflow,
 * not a ticket store.
 */

const PERSONAS = [
  { id: "exec", label: "Executive" },
  { id: "regional", label: "Regional" },
  { id: "category", label: "Category" },
  { id: "field", label: "Field supervisor" },
] as const;

export function Tickets() {
  const params = useSearchParams();
  /* Opens on the executive — the top of the hierarchy sees every ticket, so the
     list is populated on arrival. Switching down to a field supervisor then
     visibly narrows it, which is the point of the control. */
  const [persona, setPersona] = useState<string>("exec");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [filters, setFilters] = useState<TicketFilterState>(EMPTY_FILTERS);
  /** Deleted keys. Deletion is the only manual action on a ticket — see below. */
  const [deleted, setDeleted] = useState<ReadonlySet<string>>(() => new Set());
  /* A "Create ticket" button on another screen lands here via
     `?compose=1&metric=…&from=…&f=…` — read once, on mount, so the compose
     panel opens pre-filled instead of requiring a second click. */
  const [composing, setComposing] = useState<
    { open: false } | { open: true; from?: Suggestion; context?: TicketContext }
  >(() => {
    const context = ticketContextFromParams(params);
    return context ? { open: true, context } : { open: false };
  });

  const forPersona = useMemo(() => ticketsForPersona(persona), [persona]);

  const visible = useMemo(
    () => forPersona.filter((ticket) => !deleted.has(ticket.key)),
    [forPersona, deleted],
  );

  const filtered = useMemo(
    () => applyTicketFilters(visible, filters),
    [visible, filters],
  );

  const open = filtered.find((ticket) => ticket.key === openKey) ?? null;
  const actor = PERSONA_ACTOR[persona];

  /**
   * Closure comes from the next visit's IR output, so deleting is the only
   * thing a person can do to a ticket by hand — which makes it the sole escape
   * hatch for one raised in error, and worth a confirm.
   */
  const remove = useCallback((key: string) => {
    setDeleted((current) => new Set(current).add(key));
    setOpenKey((current) => (current === key ? null : current));
  }, []);

  const raised = visible.filter((ticket) => ticket.status === "raised").length;

  return (
    <div className={styles.screen}>
      <header className={styles.head}>
        <div className={styles.headTop}>
          <div>
            <div className={styles.eyebrow}>Work</div>
            <h1 className={styles.title}>Tickets</h1>
            <p className={styles.subtitle}>
              Colgate-Palmolive Vietnam · {raised} raised · {visible.length} total
            </p>
          </div>

          <div className={styles.headActions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => setComposing({ open: true })}
            >
              <Icon name="plus" size={14} />
              New ticket
            </button>
          </div>
        </div>

        <div className={styles.personaRow}>
          <span className={styles.personaLabel}>Viewing as</span>
          <Segmented
            options={PERSONAS}
            value={persona}
            onChange={setPersona}
            label="Persona"
          />
          {actor ? (
            <span className={styles.actor}>
              {actor.name} · {actor.role}
              {actor.region !== "National" ? ` · ${actor.region}` : ""}
            </span>
          ) : null}
        </div>
      </header>

      <div className={styles.body}>
        <TicketFilters
          tickets={visible}
          value={filters}
          onChange={setFilters}
          shown={filtered.length}
        />

        {/* The "Suggested" lane is parked, not cancelled — `SUGGESTIONS` is
            still derived in `_data/tickets.ts`, and this is where the lane
            returns once the recommendation logic behind it exists. */}

        <div className={`${charts.card} ${charts.tableCard}`}>
          <TicketList tickets={filtered} onOpen={setOpenKey} />
        </div>
      </div>

      {open ? (
        <TicketPanel
          ticket={open}
          onClose={() => setOpenKey(null)}
          onDelete={remove}
        />
      ) : null}

      {composing.open ? (
        <ComposePanel
          persona={persona}
          suggestion={composing.from}
          context={composing.context}
          onClose={() => setComposing({ open: false })}
        />
      ) : null}
    </div>
  );
}

/** AND across fields, matching how the global filter bar reads. */
function applyTicketFilters(
  tickets: Ticket[],
  filters: TicketFilterState,
): Ticket[] {
  return tickets.filter((ticket) => {
    if (filters.status && ticket.status !== filters.status) return false;
    if (filters.assignee && nameFor(ticket.assigneeId) !== filters.assignee) {
      return false;
    }
    if (filters.subject && ticket.subject !== filters.subject) return false;
    if (filters.label && !ticket.labels.includes(filters.label)) return false;
    return true;
  });
}
