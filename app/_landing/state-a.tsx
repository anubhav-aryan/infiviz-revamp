import { Icon } from "@/app/_components/icon";
import {
  CONTACT,
  HEADER_A,
  STEPPER_TITLE,
  STEPS,
  TIMELINE,
  WHATS_NEXT,
} from "./_data/landing";
import styles from "./landing.module.css";

/** State A — the account exists but master data has not arrived yet. */
export function StateA() {
  return (
    <div className={styles.stateA}>
      <div className={`${styles.pageHead} ${styles.headA}`}>
        <div>
          <h1 className={`${styles.pageTitle} ${styles.titleA}`}>
            {HEADER_A.title}
          </h1>
          <div className={`${styles.pageSubtitle} ${styles.subtitleA}`}>
            {HEADER_A.subtitle}
          </div>
        </div>
        <div className={styles.setupPill}>
          <span className={styles.setupDot} aria-hidden="true" />
          <span className={styles.setupLabel}>{HEADER_A.status}</span>
        </div>
      </div>

      {/* onboarding stepper */}
      <div className={styles.stepperCard}>
        <div className={styles.stepperTitle}>{STEPPER_TITLE}</div>
        <ol className={styles.stepper}>
          {STEPS.map((step) => (
            <li key={step.num} className={styles.step}>
              <span className={styles.stepLine} aria-hidden="true" />
              <span className={styles.stepCircle} data-state={step.state}>
                {step.state === "active" ? (
                  <span className={styles.stepDot} aria-hidden="true" />
                ) : (
                  <span className={styles.stepNum}>{step.num}</span>
                )}
              </span>
              <div className={styles.stepBody} data-state={step.state}>
                <div className={styles.stepName}>{step.name}</div>
                <div className={styles.stepDesc}>{step.desc}</div>
                <div className={styles.stepStatus}>{step.status}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* what happens next + onboarding contact */}
      <div className={styles.nextGrid}>
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>{WHATS_NEXT.title}</h2>
          <p className={styles.nextBody}>
            {WHATS_NEXT.bodyBefore}
            <b>{WHATS_NEXT.bodyStrong}</b>
            {WHATS_NEXT.bodyAfter}
          </p>
          {TIMELINE.map((row) => (
            <div key={row.text} className={styles.timelineRow}>
              <span className={styles.timelineIcon} aria-hidden="true">
                <Icon name={row.icon} />
              </span>
              <span className={styles.timelineText}>{row.text}</span>
              <span className={styles.timelineWhen}>{row.when}</span>
            </div>
          ))}
        </div>

        <div className={`${styles.panel} ${styles.contactPanel}`}>
          <h2 className={`${styles.panelTitle} ${styles.contactTitle}`}>
            {CONTACT.title}
          </h2>
          <div className={styles.contactRow}>
            <span className={styles.contactAvatar} aria-hidden="true">
              {CONTACT.initials}
            </span>
            <div>
              <div className={styles.contactName}>{CONTACT.name}</div>
              <div className={styles.contactRole}>{CONTACT.role}</div>
            </div>
          </div>
          <div className={styles.contactEmail}>{CONTACT.email}</div>
          <div className={styles.contactActions}>
            <button type="button" className={styles.primaryButton}>
              {CONTACT.primaryAction}
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              aria-label={`Email ${CONTACT.name}`}
            >
              {CONTACT.secondaryAction}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
