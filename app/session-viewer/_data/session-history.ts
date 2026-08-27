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

/** Capture metadata the comparison feed's metrics panel shows per session. */
export type SessionCaptureMeta = {
  photos: number;
  /** Photos flagged by each quality check — mostly zero on a good capture. */
  slantCount: number;
  blurCount: number;
  duplicateCount: number;
  /** The bay's planogram width, in feet. */
  pogSizeFt: number;
  standardCompliant: boolean;
};

export type SessionRef = SessionCaptureMeta & {
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
type AuthoredSession = Partial<SessionCaptureMeta> & {
  category: string;
  placement: string;
  startedAt: string;
  /** Day 0 only: timed as an offset from the visit rather than by a clock. */
  afterSeconds?: number;
};

/**
 * The metadata of an unremarkable capture — a session with nothing flagged.
 * Most of the history is exactly that, so entries only author what deviates:
 * a blurred photo here, a smaller bay there. The current capture's zeros are
 * the same claim the binary quality panel makes.
 */
const CLEAN_CAPTURE: Omit<SessionCaptureMeta, "photos"> = {
  slantCount: 0,
  blurCount: 0,
  duplicateCount: 0,
  pogSizeFt: 8,
  standardCompliant: true,
};

const HISTORY: { date: string; label: string; extra: AuthoredSession[] }[] = [
  {
    date: "2026-08-04",
    label: "04 Aug 2026",
    extra: [
      { category: "Toothbrush", placement: "Top Shelf", startedAt: "", afterSeconds: 2073, photos: 5, pogSizeFt: 4 },
    ],
  },
  {
    date: "2026-07-28",
    label: "28 Jul 2026",
    extra: [{ category: "Toothpaste", placement: "Eye Level", startedAt: "09:14:22", photos: 7 }],
  },
  {
    date: "2026-07-21",
    label: "21 Jul 2026",
    extra: [
      { category: "Toothpaste", placement: "Eye Level", startedAt: "10:02:55", photos: 6, blurCount: 1 },
      { category: "Toothpaste", placement: "End Cap", startedAt: "10:26:13", photos: 4, pogSizeFt: 4 },
    ],
  },
  {
    date: "2026-07-14",
    label: "14 Jul 2026",
    extra: [
      { category: "Toothpaste", placement: "Eye Level", startedAt: "09:48:31", photos: 7 },
      { category: "Toothbrush", placement: "Top Shelf", startedAt: "10:12:06", photos: 5, pogSizeFt: 4 },
    ],
  },
  {
    date: "2026-07-07",
    label: "07 Jul 2026",
    extra: [
      { category: "Toothpaste", placement: "Eye Level", startedAt: "11:05:44", photos: 6, slantCount: 1, standardCompliant: false },
    ],
  },
  {
    date: "2026-06-30",
    label: "30 Jun 2026",
    extra: [{ category: "Toothpaste", placement: "Eye Level", startedAt: "09:22:17", photos: 7 }],
  },
  {
    date: "2026-06-23",
    label: "23 Jun 2026",
    extra: [
      { category: "Toothpaste", placement: "Eye Level", startedAt: "10:31:53", photos: 6 },
      { category: "Toothpaste", placement: "End Cap", startedAt: "10:58:40", photos: 4, duplicateCount: 1, pogSizeFt: 4 },
    ],
  },
  {
    date: "2026-06-16",
    label: "16 Jun 2026",
    extra: [{ category: "Toothpaste", placement: "Eye Level", startedAt: "09:41:02", photos: 7, blurCount: 2, standardCompliant: false }],
  },
  {
    date: "2026-06-09",
    label: "09 Jun 2026",
    extra: [{ category: "Toothpaste", placement: "Eye Level", startedAt: "10:15:29", photos: 6 }],
  },
  {
    date: "2026-06-02",
    label: "02 Jun 2026",
    extra: [
      { category: "Toothpaste", placement: "Eye Level", startedAt: "09:55:11", photos: 7 },
      { category: "Toothbrush", placement: "Top Shelf", startedAt: "10:20:47", photos: 5, slantCount: 1, pogSizeFt: 4 },
    ],
  },
  {
    date: "2026-05-26",
    label: "26 May 2026",
    extra: [{ category: "Toothpaste", placement: "Eye Level", startedAt: "11:12:36", photos: 6 }],
  },
  {
    date: "2026-05-19",
    label: "19 May 2026",
    extra: [{ category: "Toothpaste", placement: "Eye Level", startedAt: "09:29:58", photos: 7, duplicateCount: 1 }],
  },
  {
    date: "2026-05-12",
    label: "12 May 2026",
    extra: [
      { category: "Toothpaste", placement: "Eye Level", startedAt: "10:44:19", photos: 6 },
      { category: "Toothpaste", placement: "End Cap", startedAt: "11:08:02", photos: 4, pogSizeFt: 4 },
    ],
  },
  {
    date: "2026-05-05",
    label: "05 May 2026",
    extra: [{ category: "Toothpaste", placement: "Eye Level", startedAt: "09:37:45", photos: 5, blurCount: 1 }],
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
              ...CLEAN_CAPTURE,
              photos: visit.photos,
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
      ...CLEAN_CAPTURE,
      photos: session.photos ?? 6,
      ...(session.slantCount !== undefined && { slantCount: session.slantCount }),
      ...(session.blurCount !== undefined && { blurCount: session.blurCount }),
      ...(session.duplicateCount !== undefined && { duplicateCount: session.duplicateCount }),
      ...(session.pogSizeFt !== undefined && { pogSizeFt: session.pogSizeFt }),
      ...(session.standardCompliant !== undefined && { standardCompliant: session.standardCompliant }),
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
 * timeline moves with whichever session is selected instead of being six fixed
 * clock times that only make sense for one of them.
 *
 * Field-side steps plus the one platform-side answer that matters: the store
 * visit through the confirmed upload is the merchandiser's, and "Analytics
 * ready" is when the numbers below exist. The pipeline's internal checkpoints
 * — data received, status set — are folded into that final gap rather than
 * shown, so the last step still lands at the true end of processing.
 *
 * The gaps sum to 254s, which is the design's own `4m 14s` span.
 */
export const CAPTURE_STEPS: { name: string; gapSeconds: number }[] = [
  { name: "Store Visit", gapSeconds: 0 },
  { name: "Capture started", gapSeconds: 1 },
  { name: "First photo captured", gapSeconds: 1 },
  { name: "Last photo captured", gapSeconds: 124 },
  { name: "Upload confirmed", gapSeconds: 53 },
  { name: "Analytics ready", gapSeconds: 75 },
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

/**
 * Every authored time on this screen is the store's wall clock. This is the
 * one timezone fact the fixtures carry, and the timeline's timezone control is
 * a *view* of it — shifting the display never touches the stored strings.
 */
export const STORE_TZ = { label: "ICT", offsetMinutes: 7 * 60 };

/**
 * `shiftMinutes` moves the whole timeline into another timezone's clock —
 * 0 is store time, `-STORE_TZ.offsetMinutes` is UTC. Modular, like every time
 * here, so a shift across midnight wraps rather than going negative.
 */
export function timelineFor(
  startedAt: string,
  shiftMinutes = 0,
): { steps: TimelineStep[]; span: string } {
  const shift = ((shiftMinutes * 60) % 86400 + 86400) % 86400;
  const start = addSeconds(startedAt, shift);
  let clock = start;
  const steps = CAPTURE_STEPS.map((step, index) => {
    clock = index === 0 ? start : addSeconds(clock, step.gapSeconds);
    return {
      name: step.name,
      time: clock,
      gap: index === 0 ? null : formatGap(step.gapSeconds),
    };
  });
  const end = steps[steps.length - 1].time;
  return { steps, span: `${start} → ${end} · ${duration(SPAN_SECONDS)}` };
}

/* ---- capture quality ---- */

/**
 * Binary checks, not scores. The pipeline grades a capture pass/fail per
 * factor — there is no percentage behind these and no overall number above
 * them, so the screen must not invent either.
 */
export const QUALITY_FACTORS: [name: string, good: boolean][] = [
  ["Sharpness", true],
  ["Framing", true],
  ["Lighting", true],
  ["Completeness", true],
];

export const QUALITY_GOOD = QUALITY_FACTORS.every(([, good]) => good);

export const QUALITY_LABEL = QUALITY_GOOD ? "Good photo quality" : "Bad photo quality";

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

/* The chip is derived, so this pins the authored checks instead: the session
   is transcribed from the design as a good capture, and a factor quietly
   flipped to false would relabel the whole header. */
if (!QUALITY_GOOD) {
  throw new Error(
    "A quality factor in session-history.ts is false, but the authored session is a good capture. " +
      "Either the fixture drifted or the session is being re-authored — update both together.",
  );
}
