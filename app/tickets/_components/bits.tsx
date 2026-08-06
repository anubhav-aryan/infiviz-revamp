import { initials } from "../_data/people";
import styles from "./tickets.module.css";

/**
 * The small marks the ticket screens share.
 *
 * `Avatar` is new — the app had no initials treatment anywhere. It is derived
 * from `.brandMark` in `app-shell.module.css` (same size, weight and display
 * font) with a full radius, so it reads as part of the system rather than as an
 * import from somewhere else.
 */

export function Avatar({
  name,
  size = "sm",
  title,
}: {
  name: string;
  size?: "sm" | "md";
  title?: string;
}) {
  return (
    <span
      className={styles.avatar}
      data-size={size}
      title={title ?? name}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

/** Status and priority badges. Tone is a name; the stylesheet owns the colour. */
export function Pill({
  label,
  tone,
}: {
  label: string;
  tone: string;
}) {
  return (
    <span className={styles.pill} data-tone={tone}>
      {label}
    </span>
  );
}

export const STATUS_LABEL: Record<string, string> = {
  todo: "To do",
  "in-progress": "In progress",
  done: "Done",
};

export const PRIORITY_LABEL: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};
