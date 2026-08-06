import { supervisorFor } from "@/app/photo-quality/_data/photo-quality";

/**
 * Who works for whom.
 *
 * The platform models a chain but has never drawn it:
 *
 *   Executive → Regional / Category lead → Field supervisor → Merchandiser
 *
 * Two things had to be reconciled to build it.
 *
 * **The naming split.** The field-ops fixtures name merchandisers by handle
 * (`huy_le`), the analytics chart fixtures by full name (`Nguyễn Văn An`), and
 * they are not the same people spelled two ways — the given names do not line
 * up. The handles win here because they are the ones carrying a region, and
 * therefore a supervisor, and therefore stores and visit dates. `DISPLAY_NAME`
 * un-abbreviates them using the rule `master-data/_data/users.ts` already sets
 * (`minh_tran` → Minh Trần), because a ticket assigned to `huy_le` reads badly.
 * Nothing else changes: every existing screen still shows handles.
 *
 * **Supervisors own regions**, per `supervisorFor` in the photo-quality data,
 * so a merchandiser's manager is derived rather than authored a second time.
 */

export type Rank = "exec" | "lead" | "supervisor" | "merchandiser";

export type Person = {
  id: string;
  name: string;
  rank: Rank;
  /** "National" for people above a region. */
  region: string;
  role: string;
};

/** Handle → display name, following `users.ts`: given name, then surname. */
const DISPLAY_NAME: Record<string, string> = {
  khang_nguyen: "Khang Nguyễn",
  linh_pham: "Linh Phạm",
  minh_tran: "Minh Trần",
  quan_do: "Quân Đỗ",
  mai_bui: "Mai Bùi",
  huy_le: "Huy Lê",
  thao_vo: "Thảo Võ",
  nam_hoang: "Nam Hoàng",
  duc_ngo: "Đức Ngô",
  bao_vu: "Bảo Vũ",
  ha_pham: "Hà Phạm",
};

/** Region for each merchandiser, consistent across every field-ops fixture. */
const MERCHANDISER_REGION: Record<string, string> = {
  khang_nguyen: "Ho Chi Minh City",
  linh_pham: "South East",
  minh_tran: "Ho Chi Minh City",
  quan_do: "Red River Delta",
  mai_bui: "South East",
  huy_le: "Central",
  thao_vo: "Mekong Delta",
  nam_hoang: "North Highlands",
  duc_ngo: "Red River Delta",
  bao_vu: "Central",
  ha_pham: "North Highlands",
};

export const MERCHANDISERS: Person[] = Object.entries(MERCHANDISER_REGION).map(
  ([id, region]) => ({
    id,
    name: DISPLAY_NAME[id] ?? id,
    rank: "merchandiser" as const,
    region,
    role: "Merchandiser",
  }),
);

/** The six regional supervisors, from the map photo-quality already publishes. */
export const SUPERVISORS: Person[] = [
  "Ho Chi Minh City",
  "South East",
  "Mekong Delta",
  "Red River Delta",
  "Central",
  "North Highlands",
].map((region) => ({
  id: `sup_${region.toLowerCase().replace(/[^a-z]+/g, "_")}`,
  name: supervisorFor(region),
  rank: "supervisor" as const,
  region,
  role: "Field supervisor",
}));

/** Above the regions. Authored here — the app models no one at this level. */
export const LEADS: Person[] = [
  {
    id: "lead_avail",
    name: "Ngô Thanh Hải",
    rank: "lead",
    region: "National",
    role: "Availability lead",
  },
  {
    id: "lead_category",
    name: "Vũ Khánh Linh",
    rank: "lead",
    region: "National",
    role: "Category lead",
  },
  {
    id: "lead_revenue",
    name: "Phan Đăng Khoa",
    rank: "lead",
    region: "National",
    role: "Revenue lead",
  },
];

export const EXEC: Person = {
  id: "exec_head",
  name: "Trần Quốc Bảo",
  rank: "exec",
  region: "National",
  role: "Country head",
};

export const PEOPLE: Person[] = [EXEC, ...LEADS, ...SUPERVISORS, ...MERCHANDISERS];

const BY_ID = new Map(PEOPLE.map((person) => [person.id, person]));
const BY_NAME = new Map(PEOPLE.map((person) => [person.name, person]));

export const personById = (id: string) => BY_ID.get(id);
export const personByName = (name: string) => BY_NAME.get(name);

/** The merchandiser behind a handle, or undefined for `"—"` (unassigned). */
export const merchandiserByHandle = (handle: string) => BY_ID.get(handle);

/** The supervisor who owns a merchandiser's region. */
export function supervisorOf(person: Person): Person | undefined {
  return SUPERVISORS.find((sup) => sup.region === person.region);
}

/** Initials for the avatar — last word first, matching how the names read. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ---------------------------------------------------------------- */
/* who can assign to whom                                            */
/* ---------------------------------------------------------------- */

/**
 * A persona assigns downward only. Merchandisers are never a persona — they are
 * only ever an assignee, which is exactly what "a higher persona assigns to a
 * lower one" means on this platform.
 */
const ASSIGNABLE_RANKS: Record<string, Rank[]> = {
  exec: ["lead", "supervisor"],
  regional: ["supervisor", "merchandiser"],
  category: ["supervisor", "merchandiser"],
  field: ["merchandiser"],
};

/** Who the logged-in persona is acting as, for the Reporter field. */
export const PERSONA_ACTOR: Record<string, Person> = {
  exec: EXEC,
  regional: LEADS[0],
  category: LEADS[1],
  field: SUPERVISORS[0],
};

export function assignableTo(persona: string): Person[] {
  const ranks = ASSIGNABLE_RANKS[persona] ?? ["merchandiser"];
  return PEOPLE.filter((person) => ranks.includes(person.rank));
}
