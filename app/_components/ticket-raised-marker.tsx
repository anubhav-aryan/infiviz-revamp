import Link from "next/link";
import { markersFor } from "@/app/tickets/_data/issue-instances";
import { Icon } from "./icon";
import styles from "./ticket-raised-marker.module.css";

/**
 * "A ticket was raised here" — on the metric itself, not only in the ticket list.
 *
 * A ticket buried in a list cannot tell the person reading a chart that someone
 * already noticed this number. Worse, it cannot tell them whether anything
 * happened afterwards. So the marker sits on the card, and once the next visit
 * has been measured it carries the before and after with it.
 *
 * Three states, and the difference between them matters:
 *
 * - **raised, not yet re-measured** — a ticket exists, no next visit yet.
 * - **moved** — the next visit landed and the number changed; the direction is
 *   shown rather than assumed, because a ticket can be followed by a fall.
 * - **resolved** — closed *and* moved the right way. Closure alone is not
 *   success, and the marker does not pretend otherwise.
 */
export function TicketRaisedMarker({
  metric,
  subject,
}: {
  metric: string;
  subject?: string;
}) {
  const markers = markersFor(metric, subject);
  if (markers.length === 0) return null;

  return (
    <div className={styles.markers}>
      {markers.map((marker) => {
        const measured = marker.movement !== null;
        const improved = (marker.movement ?? 0) > 0;

        return (
          <Link
            key={marker.ticketKey}
            // The ticket this names, not the unfiltered list — a marker for
            // TIC-104 that dropped you on the whole board could not answer the
            // question it raised.
            href={`/tickets?ticket=${marker.ticketKey}`}
            className={styles.marker}
            data-state={
              marker.resolved ? "resolved" : measured ? "measured" : "raised"
            }
            title={`${marker.ticketKey} raised ${marker.raisedOn} against ${marker.subject}`}
          >
            <Icon
              name={marker.resolved ? "check-circle-2" : "clipboard-list"}
              size={12}
            />
            <span className={styles.markerKey}>{marker.ticketKey}</span>

            {measured ? (
              <span className={styles.beforeAfter}>
                {marker.before}
                {marker.unit}
                <Icon
                  name={improved ? "arrow-up-right" : "arrow-down-right"}
                  size={11}
                />
                {marker.after}
                {marker.unit}
              </span>
            ) : (
              <span className={styles.pending}>awaiting next visit</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
