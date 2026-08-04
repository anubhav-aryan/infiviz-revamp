import type { Metadata } from "next";
import { RailShell } from "@/app/_components/app-shell";
import { SECTION, SECTION_GROUPS } from "../_data/section-nav";
import { UploadHistorySketch } from "../_components/upload-history-sketch";

export const metadata: Metadata = {
  title: "Upload history",
  description: "Every Excel upload and API sync, with rows accepted and rejected.",
};

export default function UploadHistoryPage() {
  return (
    <RailShell
      active="master-data"
      section={SECTION}
      groups={SECTION_GROUPS}
      activeSection="upload-history"
    >
      <UploadHistorySketch />
    </RailShell>
  );
}
