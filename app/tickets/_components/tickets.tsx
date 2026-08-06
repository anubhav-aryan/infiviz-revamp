"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/app/_components/icon";
import { Segmented } from "@/app/_charts/segmented";
import { SortableTable } from "@/app/_charts/sortable-table";
import { num, text, type Column, type Row } from "@/app/_charts/table";
import charts from "@/app/_charts/charts.module.css";
import { PRIORITY_LABEL, STATUS_LABEL } from "./bits";
import { ComposePanel } from "./compose-panel";
import { TicketBoard } from "./ticket-board";
import { TicketPanel } from "./ticket-panel";
import {
  SUGGESTIONS,
  nameFor,
  ticketsForPersona,
  type Suggestion,
} from "../_data/tickets";
import { PERSONA_ACTOR } from "../_data/people";
import styles from "./tickets.module.css";

/**
 * The Tickets screen.
 *
 * All state is local and nothing persists — this is a mockup of the workflow,
 * not a ticket store. What it is meant to show is the shape: a higher persona
 * looking at work, the suggestions the platform raised, and the act of turning
 * one into an assignment for someone below them.
 */

const PERSONAS = [
  { id: "exec", label: "Executive" },
  { id: "regional", label: "Regional" },
  { id: "category", label: "Category" },
  { id: "field", label: "Field supervisor" },
] as const;

const VIEWS = [
  { id: "board", label: "Board" },
  { id: "list", label: "List" },
] as const;

const LIST_COLUMNS: Column[] = [
  { key: "key", label: "Key", width: "92px" },
  { key: "title", label: "Summary" },
  { key: "subject", label: "Subject" },
  { key: "assignee", label: "Assignee" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "due", label: "Due", align: "right" },
];

const PRIORITY_ORDER: Record<string, number> = { high: 3, medium: 2, low: 1 };
const STATUS_ORDER: Record<string, number> = { todo: 1, "in-progress": 2, done: 3 };

export function Tickets() {
  /* Opens on the executive — the top of the hierarchy sees every ticket, so
     the board is populated on arrival. Switching down to a field supervisor
     then visibly narrows it, which is the point of the control. */
  const [persona, setPersona] = useState<string>("exec");
  const [view, setView] = useState<"board" | "list">("board");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [composing, setComposing] = useState<
    { open: false } | { open: true; from?: Suggestion }
  >({ open: false });

  const tickets = useMemo(() => ticketsForPersona(persona), [persona]);
  const open = tickets.find((ticket) => ticket.key === openKey) ?? null;
  const actor = PERSONA_ACTOR[persona];

  const rows: Row[] = tickets.map((ticket) => ({
    id: ticket.key,
    cells: [
      { text: ticket.key, mono: true },
      text(ticket.title),
      text(ticket.subject),
      text(nameFor(ticket.assigneeId)),
      {
        text: PRIORITY_LABEL[ticket.priority],
        value: PRIORITY_ORDER[ticket.priority],
        pill: { label: PRIORITY_LABEL[ticket.priority], tone: ticket.priority },
      },
      {
        text: STATUS_LABEL[ticket.status],
        value: STATUS_ORDER[ticket.status],
        pill: { label: STATUS_LABEL[ticket.status], tone: ticket.status },
      },
      num(ticket.due, Number(ticket.due.slice(0, 2))),
    ],
  }));

  return (
    <div className={styles.screen}>
      <header className={styles.head}>
        <div className={styles.headTop}>
          <div>
            <div className={styles.eyebrow}>Work</div>
            <h1 className={styles.title}>Tickets</h1>
            <p className={styles.subtitle}>
              Colgate-Palmolive Vietnam · {tickets.length} open to you ·{" "}
              {SUGGESTIONS.length} suggestions waiting
            </p>
          </div>

          <div className={styles.headActions}>
            <Segmented
              options={VIEWS}
              value={view}
              onChange={setView}
              label="View"
            />
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
        {view === "board" ? (
          <TicketBoard
            tickets={tickets}
            suggestions={SUGGESTIONS}
            onOpen={setOpenKey}
            onCreateFrom={(from) => setComposing({ open: true, from })}
          />
        ) : (
          <div className={`${charts.card} ${charts.tableCard}`}>
            <SortableTable
              columns={LIST_COLUMNS}
              rows={rows}
              emptyLabel="No tickets for this persona."
              defaultSort={{ index: 4, dir: "desc" }}
              maxHeight={620}
            />
          </div>
        )}
      </div>

      {open ? <TicketPanel ticket={open} onClose={() => setOpenKey(null)} /> : null}

      {composing.open ? (
        <ComposePanel
          persona={persona}
          suggestion={composing.from}
          onClose={() => setComposing({ open: false })}
        />
      ) : null}
    </div>
  );
}
