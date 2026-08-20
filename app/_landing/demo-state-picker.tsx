"use client";

import { FloatingPicker } from "@/app/_components/floating-picker";
import type { LandingStateId } from "./_data/landing";

/**
 * The demo-state pill: flips the landing screen between the onboarding and live
 * phases. Everything about how it looks and drags lives in `FloatingPicker`,
 * which the role switch shares.
 */
export function DemoStatePicker({
  states,
  order,
  active,
  onChange,
}: {
  states: Record<LandingStateId, { label: string }>;
  order: LandingStateId[];
  active: LandingStateId;
  onChange: (id: LandingStateId) => void;
}) {
  return (
    <FloatingPicker
      label="Demo state"
      labelId="landing-state-picker"
      gripAriaLabel="Move the demo state picker — drag, or use the arrow keys"
      options={order.map((id) => ({
        id,
        label: states[id].label,
        ariaLabel: `Show the ${states[id].label.toLowerCase()} state`,
      }))}
      active={active}
      onChange={onChange}
    />
  );
}
