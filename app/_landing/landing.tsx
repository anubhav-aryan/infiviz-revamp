"use client";

import { useState, type ReactElement } from "react";
import { AppShell } from "@/app/_components/app-shell";
import { NAV_CAPTURING, fullNav, type NavEntry } from "@/app/_components/nav";
import type { LandingStateId } from "./_data/landing";
import { DemoStatePicker } from "./demo-state-picker";
import { OnboardingScreen } from "./onboarding-screen";
import { LiveScreen } from "./live-screen";

/**
 * Two phases of the same screen. Each changes the nav as well as the main
 * surface, so the whole screen — sidebar included — is driven from here.
 */
const STATES: Record<
  LandingStateId,
  { label: string; nav: NavEntry[]; render: () => ReactElement }
> = {
  onboarding: {
    label: "Onboarding",
    // NAV_CAPTURING, not a locked-down nav: this screen links to the two
    // operational reports, so their surfaces have to be reachable.
    nav: NAV_CAPTURING,
    render: () => <OnboardingScreen />,
  },
  live: {
    label: "Live",
    nav: fullNav("activity"),
    render: () => <LiveScreen />,
  },
};

const STATE_IDS: LandingStateId[] = ["onboarding", "live"];

export function Landing() {
  const [stateId, setStateId] = useState<LandingStateId>("live");
  const state = STATES[stateId];

  return (
    <>
      <AppShell active="activity" nav={state.nav} filterScope="activity">
        {state.render()}
      </AppShell>

      {/* Not in the design — a demo affordance for stepping between the
          onboarding and live phases. Draggable, because it sits over the
          bottom-right of the page and that is somewhere a reader wants to
          look during a walkthrough. */}
      <DemoStatePicker
        states={STATES}
        order={STATE_IDS}
        active={stateId}
        onChange={setStateId}
      />
    </>
  );
}
