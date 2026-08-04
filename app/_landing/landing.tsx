"use client";

import { useState, type ReactElement } from "react";
import { AppShell, type Callout } from "@/app/_components/app-shell";
import {
  NAV_CAPTURING,
  NAV_ONBOARDING,
  fullNav,
  type NavEntry,
} from "@/app/_components/nav";
import type { LandingStateId } from "./_data/landing";
import { StateA } from "./state-a";
import { StateB } from "./state-b";
import { StateC } from "./state-c";
import styles from "./landing.module.css";

/**
 * The design stacks three complete app states. Each one changes the nav and the
 * sidebar callout as well as the main surface, so the whole screen — sidebar
 * included — is driven from here.
 */
const STATES: Record<
  LandingStateId,
  { nav: NavEntry[]; callout: Callout; render: () => ReactElement }
> = {
  A: {
    nav: NAV_ONBOARDING,
    callout: {
      title: "Phase 1 · Onboarding",
      body: "Surfaces appear as your data is configured.",
    },
    render: () => <StateA />,
  },
  B: {
    nav: NAV_CAPTURING,
    callout: {
      title: "Phase 1 · Onboarding",
      body: "Analytics unlocks once sessions are processed.",
    },
    render: () => <StateB />,
  },
  C: {
    nav: fullNav("activity"),
    callout: {
      title: "Phase 4 · Live",
      body: "Full shelf metrics available.",
    },
    render: () => <StateC />,
  },
};

const STATE_IDS: LandingStateId[] = ["A", "B", "C"];

export function Landing() {
  const [stateId, setStateId] = useState<LandingStateId>("C");
  const state = STATES[stateId];

  return (
    <>
      <AppShell active="activity" nav={state.nav} callout={state.callout}>
        {state.render()}
      </AppShell>

      {/* Not in the design — a demo affordance for stepping through the three
          onboarding states the doc specifies. */}
      <div className={styles.statePicker}>
        <span className={styles.statePickerLabel} id="landing-state-picker">
          Onboarding state
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
              aria-label={`Show onboarding state ${id}`}
              onClick={() => setStateId(id)}
            >
              {id}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
