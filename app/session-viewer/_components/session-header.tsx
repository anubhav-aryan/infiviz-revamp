import { Icon } from "@/app/_components/icon";
import type { SessionIdentity } from "../_data/session-viewer";
import styles from "./session-viewer.module.css";

/**
 * The session's identity, in the icon row Store Explorer's detail view uses —
 * the same six facts, so a user who arrives from either screen reads the same
 * header. Every value is a flat field on `SessionIdentity` rather than derived
 * from a `Visit`, because `/session-viewer` with no store has no visit.
 */
export function SessionHeader({ session }: { session: SessionIdentity }) {
  const facts: { icon: Parameters<typeof Icon>[0]["name"]; value: string; mono?: boolean }[] = [
    { icon: "store", value: session.retailer },
    { icon: "map-pin", value: session.place },
    { icon: "list", value: session.category },
    { icon: "boxes", value: session.placement },
    { icon: "calendar-days", value: session.date },
    { icon: "user", value: session.merchandiser, mono: true },
  ];

  return (
    <div className={styles.sessionHead}>
      <h1 className={styles.sessionHeadTitle}>{session.title}</h1>
      <div className={styles.sessionHeadMeta}>
        {facts.map((fact) => (
          <span
            key={fact.icon}
            className={styles.sessionHeadItem}
            data-mono={fact.mono}
          >
            <Icon name={fact.icon} size={15} />
            {fact.value}
          </span>
        ))}
      </div>
    </div>
  );
}
