import styles from "./chat.module.css";

/** Presence indicator — a pulsing dot plus label, the "the agent is here and
    can answer right now" cue every real chat product carries in its header. */
export function ChatStatus() {
  return (
    <span className={styles.status}>
      <span className={styles.statusDot} aria-hidden="true" />
      Online
    </span>
  );
}
