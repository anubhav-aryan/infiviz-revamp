import { Icon } from "@/app/_components/icon";
import { STEPPER_TITLE, STEPS } from "./_data/landing";
import styles from "./landing.module.css";

/**
 * The four-phase onboarding bar. Full width by design: it is a hard
 * `repeat(4, 1fr)` grid with capped description widths and no responsive
 * fallback, so inside a narrower column the descriptions wrap badly.
 */
export function OnboardingStepper() {
  return (
    <div className={styles.stepperCard}>
      <div className={styles.stepperTitle}>{STEPPER_TITLE}</div>
      <ol className={styles.stepper}>
        {STEPS.map((step) => (
          <li key={step.num} className={styles.step} data-state={step.state}>
            <span className={styles.stepLine} aria-hidden="true" />
            <span className={styles.stepCircle} data-state={step.state}>
              {step.state === "done" ? (
                <Icon name="check" size={15} aria-hidden="true" />
              ) : step.state === "active" ? (
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
  );
}
