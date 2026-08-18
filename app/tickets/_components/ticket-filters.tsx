"use client";

import { Icon } from "@/app/_components/icon";
import { STATUS_LABEL } from "./bits";
import { nameFor, type Ticket } from "../_data/tickets";
import styles from "./tickets.module.css";

/**
 * Filters over the ticket list.
 *
 * Once tickets are raised from charts across every store and assigned down a
 * hierarchy, the list gets long fast — without these the list view solves the
 * visibility problem on paper only.
 *
 * Options are derived from the tickets actually in scope rather than authored,
 * so a filter can never offer a value that would return nothing. Each control
 * is a plain `<select>`: unlike the global filter bar these are four short,
 * always-visible fields, so a chip-and-popover treatment would be more chrome
 * than the job needs.
 */

export type TicketFilterState = {
  status: string;
  assignee: string;
  subject: string;
  label: string;
};

export const EMPTY_FILTERS: TicketFilterState = {
  status: "",
  assignee: "",
  subject: "",
  label: "",
};

const FIELDS: { key: keyof TicketFilterState; label: string; all: string }[] = [
  { key: "status", label: "State", all: "Any state" },
  { key: "assignee", label: "Assignee", all: "Anyone" },
  { key: "subject", label: "Store / subject", all: "Any subject" },
  { key: "label", label: "Issue type", all: "Any type" },
];

function optionsFor(tickets: Ticket[], key: keyof TicketFilterState): string[] {
  const values = new Set<string>();
  for (const ticket of tickets) {
    if (key === "status") values.add(ticket.status);
    else if (key === "assignee") values.add(nameFor(ticket.assigneeId));
    else if (key === "subject") values.add(ticket.subject);
    else for (const label of ticket.labels) values.add(label);
  }
  return [...values].sort();
}

export function TicketFilters({
  tickets,
  value,
  onChange,
  shown,
}: {
  tickets: Ticket[];
  value: TicketFilterState;
  onChange: (next: TicketFilterState) => void;
  shown: number;
}) {
  const active = FIELDS.filter((field) => value[field.key]).length;

  return (
    <div className={styles.filterBar}>
      {FIELDS.map((field) => (
        <label key={field.key} className={styles.filterField}>
          <span className={styles.filterLabel}>{field.label}</span>
          <select
            className={styles.filterSelect}
            value={value[field.key]}
            data-set={Boolean(value[field.key])}
            onChange={(event) =>
              onChange({ ...value, [field.key]: event.target.value })
            }
          >
            <option value="">{field.all}</option>
            {optionsFor(tickets, field.key).map((option) => (
              <option key={option} value={option}>
                {field.key === "status" ? STATUS_LABEL[option] ?? option : option}
              </option>
            ))}
          </select>
        </label>
      ))}

      <span className={styles.filterCount}>
        {shown} of {tickets.length}
      </span>

      {active > 0 ? (
        <button
          type="button"
          className={styles.filterClear}
          onClick={() => onChange(EMPTY_FILTERS)}
        >
          <Icon name="x" size={13} />
          Clear
        </button>
      ) : null}
    </div>
  );
}
