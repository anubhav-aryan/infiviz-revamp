import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// The InfiViz Shots design system specifies these three families. `next/font`
// self-hosts them, so there is no request to fonts.googleapis.com at runtime.
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-fraunces",
  // Variable-font axes are opt-in; without `opsz` Fraunces renders at a single
  // optical size and the display headings lose their intended proportions.
  axes: ["SOFT", "WONK", "opsz"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: {
    default: "InfiViz",
    template: "%s · InfiViz",
  },
  description: "Retail execution intelligence for Colgate-Palmolive Vietnam.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning is scoped to this element's own attributes and
    // does not reach its descendants, so app-level mismatches still surface.
    // It is here because extensions stamp the root before React hydrates —
    // Scribe adds `data-scribe-recorder-ready`, Grammarly and dark-mode
    // extensions do the same — and React cannot tell that from a real mismatch.
    // The server sends only `lang` and `class`; anything else is not ours.
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
