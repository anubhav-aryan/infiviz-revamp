"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Icon } from "@/app/_components/icon";
import { CONTEXT } from "../_data/session-viewer";
import { EvidencePanel } from "./evidence-panel";
import { MetricsPanel } from "./metrics-panel";
import styles from "./session-viewer.module.css";

/**
 * Mirrors the design doc's component state, which is a single flag: whether the
 * recognition overlay is drawn on the stitched shelf.
 */
export function SessionViewer() {
  const [boxes, setBoxes] = useState(true);
  const toggleBoxes = useCallback(() => setBoxes((on) => !on), []);

  return (
    <div className={styles.page}>
      {/* context banner — the Analytics number that sent the user here */}
      <div className={styles.banner}>
        <span className={styles.bannerIcon} aria-hidden="true">
          <Icon name="target" />
        </span>
        <div className={styles.bannerText}>
          <div className={styles.bannerEyebrow}>{CONTEXT.eyebrow}</div>
          <div className={styles.bannerHeadline}>{CONTEXT.headline}</div>
        </div>
        {/* The design had no handler here; in the app it is the real way back. */}
        <Link href="/analytics" className={styles.backLink}>
          <Icon name="arrow-left" size={15} />
          Back to Analytics
        </Link>
      </div>

      <div className={styles.grid}>
        <EvidencePanel boxes={boxes} onToggleBoxes={toggleBoxes} />
        <MetricsPanel />
      </div>
    </div>
  );
}
