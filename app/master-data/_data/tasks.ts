import type { GridColumn } from "../_components/grid-columns";
import type { MiniBar } from "./stores";

/**
 * Visit tasks fixtures.
 *
 * "Tasks" here is what the readiness map means by it in Phase 1 — the work
 * pushed to the InfiShots app that a merchandiser performs in store, not the
 * tickets raised afterwards from what the photos showed. The two are easy to
 * confuse and are opposite ends of the loop: this is configured input, a
 * ticket is derived output.
 *
 * Authored rather than derived, because nothing else in the app models a task
 * definition. The vocabulary is borrowed on purpose — store groups from
 * `stores.ts`, frequencies from `journey-plans.ts` — so a reader moving
 * between the two screens meets the same words.
 */

export type TaskType =
  | "Photo capture"
  | "Planogram"
  | "Price & POSM"
  | "Stock count"
  | "Competitor";

export type TaskRow = {
  id: string;
  name: string;
  type: TaskType;
  /** Which store group the task is pushed to. */
  group: string;
  freq: string;
  /** Photos the app requires before the task can be submitted. */
  photos: number;
  mandatory: boolean;
  status: "Active" | "Inactive";
};

export const TASK_ROWS: TaskRow[] = [
  {
    id: "TSK-01",
    name: "Oral care shelf capture",
    type: "Photo capture",
    group: "All stores",
    freq: "Weekly",
    photos: 3,
    mandatory: true,
    status: "Active",
  },
  {
    id: "TSK-02",
    name: "Planogram compliance check",
    type: "Planogram",
    group: "Supermarket",
    freq: "Weekly",
    photos: 2,
    mandatory: true,
    status: "Active",
  },
  {
    id: "TSK-03",
    name: "Shelf price audit",
    type: "Price & POSM",
    group: "Bach Hoa Xanh",
    freq: "Bi-weekly",
    photos: 1,
    mandatory: true,
    status: "Active",
  },
  {
    id: "TSK-04",
    name: "Must-stock availability sweep",
    type: "Stock count",
    group: "All stores",
    freq: "Weekly",
    photos: 2,
    mandatory: true,
    status: "Active",
  },
  {
    id: "TSK-05",
    name: "POSM & secondary display",
    type: "Price & POSM",
    group: "Winmart",
    freq: "Monthly",
    photos: 2,
    mandatory: false,
    status: "Active",
  },
  {
    id: "TSK-06",
    name: "Competitor shelf capture",
    type: "Competitor",
    group: "Supermarket",
    freq: "Monthly",
    photos: 2,
    mandatory: false,
    status: "Active",
  },
  {
    id: "TSK-07",
    name: "Out-of-stock photo proof",
    type: "Photo capture",
    group: "Mini mart",
    freq: "Weekly",
    photos: 1,
    mandatory: true,
    status: "Active",
  },
  {
    id: "TSK-08",
    name: "New launch presence check",
    type: "Stock count",
    group: "Co.opmart",
    freq: "Bi-weekly",
    photos: 1,
    mandatory: false,
    status: "Active",
  },
  {
    id: "TSK-09",
    name: "Back-stock room count",
    type: "Stock count",
    group: "Hypermarket",
    freq: "Monthly",
    photos: 1,
    mandatory: false,
    // Retired when the count moved into the availability sweep above.
    status: "Inactive",
  },
];

const MANDATORY = TASK_ROWS.filter((task) => task.mandatory);

export type TaskTile = { label: string; val: string; note?: string };

export const TASK_TILES: TaskTile[] = [
  {
    label: "Tasks configured",
    val: String(TASK_ROWS.length),
    note: `${TASK_ROWS.filter((t) => t.status === "Active").length} pushed to the app`,
  },
  {
    label: "Mandatory",
    val: String(MANDATORY.length),
    note: `${TASK_ROWS.length - MANDATORY.length} optional`,
  },
  {
    label: "Photos per visit",
    val: String(
      TASK_ROWS.filter((t) => t.status === "Active" && t.freq === "Weekly").reduce(
        (sum, t) => sum + t.photos,
        0,
      ),
    ),
    note: "Across the weekly tasks",
  },
];

function share(of: (task: TaskRow) => string): MiniBar[] {
  const counts = new Map<string, number>();
  for (const task of TASK_ROWS) counts.set(of(task), (counts.get(of(task)) ?? 0) + 1);
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const top = ranked[0]?.[1] ?? 1;
  return ranked.map(([name, n]) => ({ name, w: Math.round((n / top) * 100) }));
}

export const TASK_TYPE_MINI: MiniBar[] = share((task) => task.type);
export const TASK_GROUP_MINI: MiniBar[] = share((task) => task.group);

export const TASK_COLUMNS: GridColumn[] = [
  { key: "id", label: "Task ID", width: 100 },
  { key: "name", label: "Task", width: 250 },
  { key: "type", label: "Type", width: 140 },
  { key: "group", label: "Applies to", width: 140 },
  { key: "freq", label: "Frequency", width: 110 },
  { key: "photos", label: "Photos", width: 90, align: "right" },
  { key: "mandatory", label: "Mandatory", width: 110 },
  { key: "status", label: "Status", width: 100, flex: true },
];

export const TASKS_TABLE = {
  count: `${TASK_ROWS.length} visit tasks`,
  showing: "Last pushed to the app 02 Jun 2026",
};
