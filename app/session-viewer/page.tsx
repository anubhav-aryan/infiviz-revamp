import type { Metadata } from "next";
import { AppShell } from "@/app/_components/app-shell";
import { SessionBrowse } from "./_browse/session-browse";

export const metadata: Metadata = {
  title: "Session Viewer",
  description:
    "Which stores were visited, on a map and in a list — and the capture behind each one.",
};

/**
 * The index: the estate, then one capture.
 *
 * No filter bar is drawn — the screen has its own chip row — but the provider
 * is mounted, so its filters are the same set the dashboards read.
 */
export default function SessionViewerPage() {
  return (
    <AppShell active="session-viewer" filterScope="session-viewer">
      <SessionBrowse />
    </AppShell>
  );
}
