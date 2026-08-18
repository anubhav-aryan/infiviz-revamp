"use client";

import { useSyncExternalStore } from "react";
import { MOCK_ACCOUNT_KEY } from "@/app/_identity/mock-identity";
import { PERSONA_ACTOR } from "./people";
import {
  TICKETS,
  TODAY_LABEL,
  dueLabel,
  type Priority,
  type Ticket,
} from "./tickets";
import type { TicketContext } from "./ticket-context";

/**
 * Tickets raised through the UI, kept in localStorage.
 *
 * The same `useSyncExternalStore` idiom as `use-saved-views.ts` and
 * `use-column-widths.ts`: the server snapshot is empty, so SSR and first paint
 * render the authored fixtures alone and the stored tickets swap in right
 * after hydration. `TICKETS` stays a frozen fixture; this is the seam that was
 * missing for anything raised on top of it.
 *
 * It lives outside React because a ticket is raised on one screen (a chart) and
 * read on another (Tickets) — component state on either would not survive the
 * navigation between them.
 */

const KEY = `infiviz:tickets:${MOCK_ACCOUNT_KEY}`;

/** Stable identity for the pre-hydration and empty cases — a fresh `[]` each
 *  call would make `useSyncExternalStore` loop. */
const NONE: Ticket[] = [];

let cache: Ticket[] | null = null;
const listeners = new Set<() => void>();

function read(): Ticket[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return NONE;
    const parsed = JSON.parse(raw);
    // Shape-check rather than trust: a stale or hand-edited value must not be
    // able to crash the board it renders into.
    if (!Array.isArray(parsed)) return NONE;
    const rows = parsed.filter(
      (row): row is Ticket =>
        !!row && typeof row.key === "string" && typeof row.title === "string",
    );
    return rows.length ? rows : NONE;
  } catch {
    return NONE;
  }
}

function snapshot(): Ticket[] {
  if (cache === null) cache = read();
  return cache;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // Another tab raising a ticket should show up here too.
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) {
      cache = null;
      listeners.forEach((notify) => notify());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCreatedTickets(): Ticket[] {
  return useSyncExternalStore(subscribe, snapshot, () => NONE);
}

/** `"TIC-104"` → `104`, so new keys continue the fixture's series. */
function keyNumber(key: string): number {
  const n = Number(key.replace(/^\D+/, ""));
  return Number.isFinite(n) ? n : 0;
}

function nextKey(existing: Ticket[]): string {
  const highest = [...TICKETS, ...existing].reduce(
    (max, ticket) => Math.max(max, keyNumber(ticket.key)),
    0,
  );
  return `TIC-${highest + 1}`;
}

export type TicketDraft = {
  title: string;
  detail: string;
  assigneeId: string;
  priority: Priority;
  persona: string;
  /** Where it was raised — labels for the reader, origin for the machine. */
  context?: TicketContext;
};

/**
 * Files a ticket and returns it, so the caller can name it in the toast.
 *
 * Dates come from `TODAY_LABEL`/`dueLabel` rather than a clock, for the reason
 * `tickets.ts` sets out: a real `new Date()` would print a date months outside
 * the authored Feb–Jul 2026 window and read as a bug beside "04 Jul".
 */
export function createTicket(draft: TicketDraft): Ticket {
  const existing = snapshot();
  const context = draft.context ?? {};
  const reporter = PERSONA_ACTOR[draft.persona];

  const ticket: Ticket = {
    key: nextKey(existing),
    title: draft.title.trim() || "Untitled ticket",
    detail: draft.detail.trim(),
    status: "raised",
    priority: draft.priority,
    reporterId: reporter?.id ?? draft.persona,
    assigneeId: draft.assigneeId,
    subject: context.region ?? context.metric ?? "—",
    region: context.region,
    metric: context.metric,
    period: context.period,
    // The pair that makes the ticket returnable to the view it came from.
    origin: context.from ? { from: context.from, f: context.f, d: context.d } : undefined,
    created: TODAY_LABEL,
    due: dueLabel(7),
    labels: [],
  };

  const next = [ticket, ...existing];
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Quota or private mode — the in-memory value still works this session.
  }
  listeners.forEach((notify) => notify());
  return ticket;
}
