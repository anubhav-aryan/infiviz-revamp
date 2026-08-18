"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Icon } from "@/app/_components/icon";
import { Segmented } from "@/app/_charts/segmented";
import charts from "@/app/_charts/charts.module.css";
import { ComposePanel } from "./compose-panel";
import { TicketBoard } from "./ticket-board";
import { TicketFilters, type TicketFilterState, EMPTY_FILTERS } from "./ticket-filters";
import { TicketList } from "./ticket-list";
import { TicketPanel } from "./ticket-panel";
import {
  TODAY_LABEL,
  nameFor,
  ticketsForPersona,
  type Suggestion,
  type Ticket,
  type TicketStatus,
} from "../_data/tickets";
import { ticketContextFromParams, type TicketContext } from "../_data/ticket-context";
import { PERSONA_ACTOR } from "../_data/people";
import styles from "./tickets.module.css";

/**
 * The Tickets screen.
 *
 * The list is the default and the visibility layer: raising a ticket without
 * being able to see the ones already raised is assignment into a void. The
 * board is the second view, for reading the raised/closed split at a glance and
 * for dragging a card across to close it.
 *
 * Closure has two routes now. It still follows from the next visit's IR output
 * showing the problem resolved — that is the one that matters at scale — but a
 * person can also close by hand, which is what a ticket resolved out of band,
 * or raised in error, needs.
 *
 * All state is local and nothing persists — this is a mockup of the workflow,
 * not a ticket store.
 */

const VIEWS = [
  { id: "list", label: "List" },
  { id: "board", label: "Board" },
] as const;

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
  const [view, setView] = useState<"list" | "board">("list");
  const [openKey, setOpenKey] = useState<string | null>(null);
  /** Status changed by hand this session, over the authored fixture. */
  const [moved, setMoved] = useState<
    Record<string, { status: TicketStatus; closedOn?: string }>
  >({});
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
    () =>
      forPersona
        .filter((ticket) => !deleted.has(ticket.key))
        .map((ticket) => {
          const change = moved[ticket.key];
          return change ? { ...ticket, ...change } : ticket;
        }),
    [forPersona, deleted, moved],
  );

  const filtered = useMemo(
    () => applyTicketFilters(visible, filters),
    [visible, filters],
  );

  /* Looked up from `visible`, not `filtered`: closing a ticket from the panel
     while the list is filtered to Raised would otherwise drop it out of scope
     and yank the panel shut on the action the user just took. */
  const open = visible.find((ticket) => ticket.key === openKey) ?? null;
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

  /**
   * Closing stamps the date; reopening clears it, so a ticket never carries a
   * closed date it is not closed on. `TODAY_LABEL` rather than a clock — see
   * the note beside it in `_data/tickets.ts`.
   */
  const setStatus = useCallback((key: string, status: TicketStatus) => {
    setMoved((current) => ({
      ...current,
      [key]: {
        status,
        closedOn: status === "closed" ? TODAY_LABEL : undefined,
      },
    }));
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
            <Segmented options={VIEWS} value={view} onChange={setView} label="View" />
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

        {view === "list" ? (
          <div className={`${charts.card} ${charts.tableCard}`}>
            <TicketList tickets={filtered} onOpen={setOpenKey} />
          </div>
        ) : (
          <TicketBoard
            tickets={filtered}
            onOpen={setOpenKey}
            onMove={setStatus}
          />
        )}
      </div>

      {open ? (
        <TicketPanel
          ticket={open}
          onClose={() => setOpenKey(null)}
          onDelete={remove}
          onSetStatus={setStatus}
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
