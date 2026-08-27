"use client";

import type { ReactElement } from "react";
import { AppShell } from "@/app/_components/app-shell";
import { NAV_CAPTURING, fullNav, type NavEntry } from "@/app/_components/nav";
import type { LandingStateId } from "./_data/landing";
import { OnboardingScreen } from "./onboarding-screen";
import { LiveScreen } from "./live-screen";
import { useDemoState } from "./use-demo-state";

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

export function Landing() {
  /* The switch lives in the sidebar footer now, beside the role picker —
     this screen only reads the phase. */
  const { demoState } = useDemoState();
  const state = STATES[demoState];

  return (
    <AppShell active="activity" nav={state.nav} filterScope="activity">
      {state.render()}
    </AppShell>
  );
}
