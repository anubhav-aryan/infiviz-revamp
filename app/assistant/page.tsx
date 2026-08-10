import type { Metadata } from "next";
import { AppShell } from "@/app/_components/app-shell";
import { Assistant } from "./_components/assistant";

export const metadata: Metadata = {
  title: "Assistant",
  description: "A preview of an assistant that can answer questions about any screen's data.",
};

export default function AssistantPage() {
  return (
    <AppShell active="assistant">
      <Assistant />
    </AppShell>
  );
}
