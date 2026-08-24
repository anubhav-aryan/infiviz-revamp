import type { Metadata } from "next";
import { RailShell } from "@/app/_components/app-shell";
import { SessionFilterRail } from "./_components/session-filter-rail";
import { SessionViewer } from "./_components/session-viewer";
import { SECTION } from "./_data/session-viewer";

export const metadata: Metadata = {
  title: "Session Viewer",
  description:
    "The stitched shelf, the recognition boxes and the numbers behind one Analytics figure.",
};

export default function SessionViewerPage() {
  return (
    // Analytics stays highlighted: this surface has no nav entry of its own and
    // is only ever reached by drilling into an Analytics number. `groups` is
    // empty because `railItems` replaces the rendered nav entirely — this rail
    // holds the session's filters, not sub-navigation.
    <RailShell
      active="analytics"
      section={SECTION}
      groups={[]}
      activeSection=""
      railItems={<SessionFilterRail />}
    >
      <SessionViewer />
    </RailShell>
  );
}
