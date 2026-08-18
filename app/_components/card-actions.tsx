import type { ReactNode } from "react";
import styles from "./card-actions.module.css";

/**
 * The trailing group in a card header — Ask InfiChat, Excel, Create ticket, and
 * whatever else that header already carried (a legend, a caption, a segmented
 * control).
 *
 * `margin-left: auto` is the whole point. Every card header in this app is
 * `justify-content: space-between`, which pins a trailing group to the right
 * edge only when it is the *second of two* children — so a header that handed
 * the row three or four bare items got its buttons spread across the middle
 * instead. Grouping them and pushing the group right makes the placement a
 * property of the group rather than an accident of how many siblings it has.
 */
export function CardActions({ children }: { children: ReactNode }) {
  return <span className={styles.actions}>{children}</span>;
}
