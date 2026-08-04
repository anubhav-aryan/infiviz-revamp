import type { Metadata } from "next";
import { AppShell } from "@/app/_components/app-shell";
import { SessionViewer } from "./_components/session-viewer";

export const metadata: Metadata = {
  title: "Session Viewer",
  description:
    "The stitched shelf, the recognition boxes and the numbers behind one Analytics figure.",
};

export default function SessionViewerPage() {
  return (
    // Analytics stays highlighted: this surface has no nav entry of its own and
    // is only ever reached by drilling into an Analytics number.
    <AppShell
      active="analytics"
      callout={{
        title: "Session Viewer",
        body: "The evidence behind one Analytics number.",
      }}
    >
      <SessionViewer />
    </AppShell>
  );
}
