import type { Metadata } from "next";
import { RailShell } from "@/app/_components/app-shell";
import { ExposureConsole } from "./_components/exposure-console";
import { SECTION, SECTION_GROUPS } from "./_data/section-nav";

export const metadata: Metadata = {
  title: "Admin · Metrics & charts",
  description: "Choose which metrics a client sees and how each one is drawn.",
};

/**
 * Internal tooling. `admin` is a `NavId` so the shells accept it, but it is
 * marked `internal` in `nav.ts` and so never appears in the client's sidebar or
 * icon rail — a PDM's staging console is not part of the product.
 */
export default function AdminPage() {
  return (
    <RailShell
      active="admin"
      section={SECTION}
      groups={SECTION_GROUPS}
      activeSection="metrics"
    >
      <ExposureConsole />
    </RailShell>
  );
}
