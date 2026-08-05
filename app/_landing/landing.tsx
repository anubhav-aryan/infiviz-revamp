"use client";

import { useState, type ReactElement } from "react";
import { AppShell, type Callout } from "@/app/_components/app-shell";
import { NAV_CAPTURING, fullNav, type NavEntry } from "@/app/_components/nav";
import type { LandingStateId } from "./_data/landing";
import { OnboardingScreen } from "./onboarding-screen";
import { LiveScreen } from "./live-screen";
import styles from "./landing.module.css";

/**
 * Two phases of the same screen. Each changes the nav and the sidebar callout
 * as well as the main surface, so the whole screen — sidebar included — is
 * driven from here.
 */
const STATES: Record<
  LandingStateId,
  { label: string; nav: NavEntry[]; callout: Callout; render: () => ReactElement }
> = {
  onboarding: {
    label: "Onboarding",
    // NAV_CAPTURING, not a locked-down nav: this screen links to the two
    // operational reports, so their surfaces have to be reachable.
    nav: NAV_CAPTURING,
    callout: {
      title: "Phase 1 · Onboarding",
      body: "Analytics unlocks once sessions are processed.",
    },
    render: () => <OnboardingScreen />,
  },
  live: {
    label: "Live",
    nav: fullNav("activity"),
    callout: {
      title: "Phase 4 · Live",
      body: "Full shelf metrics available.",
    },
    render: () => <LiveScreen />,
  },
};

const STATE_IDS: LandingStateId[] = ["onboarding", "live"];

export function Landing() {
  const [stateId, setStateId] = useState<LandingStateId>("live");
  const state = STATES[stateId];

  return (
    <>
      <AppShell active="activity" nav={state.nav} callout={state.callout}>
        {state.render()}
      </AppShell>

      {/* Not in the design — a demo affordance for stepping between the
          onboarding and live phases. */}
      <div className={styles.statePicker}>
        <span className={styles.statePickerLabel} id="landing-state-picker">
          Demo state
        </span>
        <div
          className={styles.statePickerOptions}
          role="group"
          aria-labelledby="landing-state-picker"
        >
          {STATE_IDS.map((id) => (
            <button
              key={id}
              type="button"
              className={styles.statePickerOption}
              aria-pressed={id === stateId}
              aria-label={`Show the ${STATES[id].label.toLowerCase()} state`}
              onClick={() => setStateId(id)}
            >
              {STATES[id].label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
