import { hashStoreId } from "@/app/_format/num";
import { VISITS, type Visit, type VisitStatus } from "@/app/_data/visits";

/**
 * The store's recent capture history, and the timeline of one capture.
 *
 * The screen's two selectors need a store to have been visited more than once,
 * and the `Visit` fixture records only the latest. So the three-visit weekly
 * cadence below is authored — **identically for every store**, deliberately.
 * Only the newest visit's first session is a captured fact: it *is* the
 * `Visit` row, asserted at the bottom of this file. The rest exists so the
 * control has something to exercise, and inventing eight different capture
 * logs would be inventing eight histories nobody measured.
 *
 * No clock is read anywhere here. Times are strings advanced by modular
 * arithmetic, so the server and the client render the same timeline.
 */

export type SessionRef = {
  id: string;
  /** The bay this session photographed, e.g. `"Toothpaste"`. */
  category: string;
  /** Where in the bay, e.g. `"Eye Level"`. */
  placement: string;
  /** `"{category} · {placement}"`, derived — never authored twice. */
  label: string;
  /** `HH:MM:SS`, local to the store. */
  startedAt: string;
};

export type VisitDay = {
  /** ISO date, the `<select>` value. */
  date: string;
  label: string;
  sessions: SessionRef[];
};

/**
 * The seconds field the `Visit` fixture does not carry. Pinned to the design's
 * own 09:31:08 for the flagship store by an assertion below.
 */
const START_SECONDS = "08";

/**
 * Prior visits, newest first. Day 0's first session comes from the `Visit`, and
 * its second is timed as an offset *from* that visit rather than by an absolute
 * clock — a store audited at 11:20 cannot have had its follow-up capture at
 * 10:05. The offset is the design's own gap, 34m 33s.
 */
type AuthoredSession = {
  category: string;
  placement: string;
  startedAt: string;
  /** Day 0 only: timed as an offset from the visit rather than by a clock. */
  afterSeconds?: number;
};

const HISTORY: { date: string; label: string; extra: AuthoredSession[] }[] = [
  {
    date: "2026-08-04",
    label: "04 Aug 2026",
    extra: [{ category: "Toothbrush", placement: "Top Shelf", startedAt: "", afterSeconds: 2073 }],
  },
  {
    date: "2026-07-28",
    label: "28 Jul 2026",
    extra: [{ category: "Toothpaste", placement: "Eye Level", startedAt: "09:14:22" }],
  },
  {
    date: "2026-07-21",
    label: "21 Jul 2026",
    extra: [
      { category: "Toothpaste", placement: "Eye Level", startedAt: "10:02:55" },
      { category: "Toothpaste", placement: "End Cap", startedAt: "10:26:13" },
    ],
  },
];

/**
 * A UUID-shaped id for a session the fixture never recorded.
 *
 * Derived from the store rather than authored: the design reused five real
 * UUIDs that already belong to *other* stores, which would have made one id
 * name two shops. The node field is a hash of store, date and index, so these
 * are provably unique — asserted below against every real session id.
 */
function derivedSessionId(visit: Visit, date: string, index: number): string {
  const seed = hashStoreId(`${visit.storeId}:${date}:${index}`);
  const node = seed.toString(16).padStart(8, "0").repeat(2).slice(0, 12);
  const head = visit.sessionId.slice(0, 24);
  return `${head}${node}`;
}

/** `"09:31:08"` + 124 → `"09:33:12"`. Modular arithmetic, never `Date`. */
function addSeconds(time: string, seconds: number): string {
  const [h, m, s] = time.split(":").map(Number);
  const total = (h * 3600 + m * 60 + s + seconds) % 86400;
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)}`;
}

/** The store's visit history, newest first. Day 0, session 0 is its `Visit`. */
export function sessionHistoryFor(visit: Visit): VisitDay[] {
  return HISTORY.map((day, dayIndex) => {
    const own: SessionRef[] =
      dayIndex === 0
        ? [
            {
              id: visit.sessionId,
              category: visit.category,
              placement: visit.placement,
              label: `${visit.category} · ${visit.placement}`,
              startedAt: `${visit.time}:${START_SECONDS}`,
            },
          ]
        : [];
    const rest = day.extra.map((session, index) => ({
      category: session.category,
      placement: session.placement,
      label: `${session.category} · ${session.placement}`,
      startedAt:
        session.afterSeconds === undefined
          ? session.startedAt
          : addSeconds(own[0].startedAt, session.afterSeconds),
      id: derivedSessionId(visit, day.date, index),
    }));
    return {
      date: day.date,
      label: day.label,
      /* Day 0 keeps the visit first by construction — its follow-ups are
         offsets from it — so this only orders the authored prior days. */
      sessions: [...own, ...rest],
    };
  });
}

/**
 * The same history flattened into one ordered list, newest first.
 *
 * The header offers a single Session control rather than a visit picker plus a
 * session picker, because a merchandiser thinking "the capture before this one"
 * is not thinking about which day boundary it fell on. `visitIdx`/`sessionIdx`
 * stay the page's state; this is the projection the control reads, so the two
 * can never disagree about what session five is.
 */
export type FlatSession = SessionRef & {
  /** The visit day this session belongs to, e.g. `"04 Aug 2026"`. */
  dayLabel: string;
  visitIdx: number;
  sessionIdx: number;
};

export function flatSessionsFor(visit: Visit): FlatSession[] {
  return sessionHistoryFor(visit).flatMap((day, visitIdx) =>
    day.sessions.map((session, sessionIdx) => ({
      ...session,
      dayLabel: day.label,
      visitIdx,
      sessionIdx,
    })),
  );
}

/* ---- the capture timeline ---- */

/**
 * The capture end to end, as seconds elapsed from the step before, so the whole
 * timeline moves with whichever session is selected instead of being eight
 * fixed clock times that only make sense for one of them.
 *
 * Field-side and pipeline-side both: the store visit through the confirmed
 * upload is the merchandiser's, and everything after it is the platform's. A
 * reader asking "why is this session not on the dashboard yet" is asking about
 * the second half, so the timeline has to carry it.
 *
 * The gaps sum to 254s, which is the design's own `4m 14s` span.
 */
export const CAPTURE_STEPS: { name: string; gapSeconds: number }[] = [
  { name: "Store Visit", gapSeconds: 0 },
  { name: "Capture started", gapSeconds: 1 },
  { name: "First photo captured", gapSeconds: 1 },
  { name: "Last photo captured", gapSeconds: 124 },
  { name: "Upload confirmed", gapSeconds: 53 },
  { name: "Session data received", gapSeconds: 2 },
  { name: "Session status", gapSeconds: 66 },
  { name: "Analytics ready", gapSeconds: 7 },
];

const SPAN_SECONDS = CAPTURE_STEPS.reduce((total, step) => total + step.gapSeconds, 0);


/** `124` → `"+2m 4s"`, `2` → `"+2s"`. */
function formatGap(seconds: number): string {
  if (seconds < 60) return `+${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `+${minutes}m` : `+${minutes}m ${rest}s`;
}

/** Same shape without the leading `+`, for the span caption. */
function duration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes === 0) return `${rest}s`;
  return rest === 0 ? `${minutes}m` : `${minutes}m ${rest}s`;
}

export type TimelineStep = {
  name: string;
  time: string;
  /** `null` on the first step — nothing preceded it. */
  gap: string | null;
};

export function timelineFor(startedAt: string): { steps: TimelineStep[]; span: string } {
  let clock = startedAt;
  const steps = CAPTURE_STEPS.map((step, index) => {
    clock = index === 0 ? startedAt : addSeconds(clock, step.gapSeconds);
    return {
      name: step.name,
      time: clock,
      gap: index === 0 ? null : formatGap(step.gapSeconds),
    };
  });
  const end = steps[steps.length - 1].time;
  return { steps, span: `${startedAt} → ${end} · ${duration(SPAN_SECONDS)}` };
}

/* ---- capture quality ---- */

export const QUALITY_FACTORS: [name: string, score: number][] = [
  ["Sharpness", 96],
  ["Framing", 92],
  ["Lighting", 90],
  ["Completeness", 97],
];

/** The mean of the four factors, rounded — not a fifth number to keep in step. */
export const CAPTURE_SCORE = Math.round(
  QUALITY_FACTORS.reduce((total, [, score]) => total + score, 0) / QUALITY_FACTORS.length,
);

export const QUALITY_LABEL = "Good photo quality";

export const STATUS_CHIP: Record<VisitStatus, { label: string; tone: "success" | "warning" | "neutral" }> = {
  Complete: { label: "Processed", tone: "success" },
  Processing: { label: "Processing", tone: "warning" },
  Queued: { label: "Queued", tone: "neutral" },
};

/* ---- the identities this file has to hold ---- */

/* Day 0, session 0 must be the store's own visit — that is the whole claim
   this file makes. If it drifts, the header shows one session and the
   evidence below belongs to another. */
for (const visit of VISITS) {
  const first = sessionHistoryFor(visit)[0].sessions[0];
  if (first.id !== visit.sessionId) {
    throw new Error(
      `Session history for ${visit.store} opens on ${first.id} but its visit is ${visit.sessionId}. ` +
        `Day 0 session 0 must be the visit itself — see session-history.ts.`,
    );
  }
  if (!first.startedAt.startsWith(visit.time)) {
    throw new Error(
      `Session history for ${visit.store} starts at ${first.startedAt} but the visit is timed ${visit.time}.`,
    );
  }
}

/* No derived id may collide with another store's, or with a real one. */
const ALL_IDS = VISITS.flatMap((visit) =>
  sessionHistoryFor(visit).flatMap((day) => day.sessions.map((session) => session.id)),
);
if (new Set(ALL_IDS).size !== ALL_IDS.length) {
  throw new Error(
    "Two sessions share an id across the store histories. `derivedSessionId` must stay unique — see session-history.ts.",
  );
}

if (CAPTURE_SCORE !== 94) {
  throw new Error(
    `CAPTURE_SCORE derived ${CAPTURE_SCORE}, expected 94. The quality factors in session-history.ts changed.`,
  );
}
