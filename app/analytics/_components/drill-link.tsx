"use client";

import Link from "next/link";
import { Icon } from "@/app/_components/icon";
import { isDefaultDate, serializeDate } from "@/app/_filters/date-token";
import { useGlobalFilters } from "@/app/_filters/global-filter-context";
import { serializeFilters } from "@/app/_filters/model";
import type { PersonaId } from "../_data/module-matrix";
import {
  drillHref,
  NO_CARRIED_STATE,
  type CarriedState,
  type DrillId,
} from "../_data/drill";
import styles from "./analytics.module.css";

/**
 * The overview's filters and date, serialised for a link out of it.
 *
 * Reads the provider rather than `useSearchParams()`, for three reasons:
 *
 * - `?d=` is not always in the URL. The provider omits it where the date lives
 *   in the path instead, so a raw `params.get("d")` is correct only by accident
 *   of which screens do that today — while the destination always reads `?d=`.
 * - `api.filters` has already been through `parseFilters`: validated against the
 *   catalogue, de-duplicated, capped. Re-serialising that launders a stale or
 *   hand-edited `?f=`; passing the raw string through propagates the junk.
 * - `rail-controls.tsx` reads the query because it must — it renders inside a
 *   Suspense fallback with no provider above it. Here there is a live provider,
 *   and reaching past it to the URL would add a second reader of state it owns.
 *
 * Returns empty strings outside a provider, so the link degrades to a bare path
 * rather than throwing.
 */
export function useCarriedState(): CarriedState {
  const api = useGlobalFilters();
  if (!api) return NO_CARRIED_STATE;
  return {
    f: serializeFilters(api.filters),
    d: isDefaultDate(api.date) ? "" : serializeDate(api.date),
  };
}

/**
 * One card's way down into the module that substantiates it.
 *
 * The overview answers "how are we doing"; every card on it was assembled from
 * something. This is that something, one click away, with the reader's current
 * filters and period intact.
 */
export function DrillLink({
  persona,
  to,
  what,
}: {
  persona: PersonaId;
  to: DrillId;
  /** Names the card. Nineteen links all reading "View detailed analytics" is
   *  one link nineteen times to anyone listening rather than looking. */
  what: string;
}) {
  const carried = useCarriedState();

  return (
    <Link
      href={drillHref(persona, to, carried)}
      className={styles.drillLink}
      aria-label={`View detailed analytics for ${what}`}
      /* The exec body's cards sit in a `ReorderableGrid` whose cells are
         `draggable`. An anchor is draggable by default, so dragging from this
         link would start a URL drag instead of moving the card. */
      draggable={false}
    >
      View detailed analytics
      <Icon name="arrow-up-right" size={14} />
    </Link>
  );
}
