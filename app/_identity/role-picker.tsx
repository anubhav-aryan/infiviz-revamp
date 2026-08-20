"use client";

import { FloatingPicker } from "@/app/_components/floating-picker";
import { ROLES, useRole } from "./use-role";

/**
 * The role pill: switches who the reader is, which decides the dashboard they
 * see and who they can assign tickets to.
 *
 * Like the demo-state picker it is a walkthrough affordance rather than product
 * chrome — a real deployment would take the role from the signed-in user — so
 * it shares the same draggable shell and the same dev-tool styling.
 *
 * `active` needs no readiness gate: until the stored role arrives it is
 * `DEFAULT_ROLE`, which is exactly what the server rendered.
 */
export function RolePicker() {
  const { role, setRole } = useRole();

  return (
    <FloatingPicker
      label="Role"
      labelId="role-picker"
      gripAriaLabel="Move the role picker — drag, or use the arrow keys"
      options={ROLES.map((option) => ({
        ...option,
        ariaLabel: `View as ${option.label}`,
      }))}
      active={role}
      onChange={setRole}
    />
  );
}
