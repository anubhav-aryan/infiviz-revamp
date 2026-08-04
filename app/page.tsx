import type { Metadata } from "next";
import { Landing } from "./_landing/landing";

export const metadata: Metadata = {
  title: "Activity",
  description:
    "What's happening in the field — onboarding progress, shelf metrics and today's activity.",
};

export default function Home() {
  return <Landing />;
}
