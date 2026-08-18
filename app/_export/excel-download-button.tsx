"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/app/_components/icon";
import actions from "@/app/_components/card-actions.module.css";
import styles from "./excel-download-button.module.css";

type State = "idle" | "preparing" | "done";

const PREPARING_MS = 800;
const DONE_MS = 1200;

/**
 * Every chart's "Ask InfiChat" button gets a sibling for Excel export. No
 * file is ever produced — the brief was to place the affordance, not wire up
 * a real download, and faking it via the existing CSV export machinery would
 * silently hand back a `.csv` for a button labeled "Excel," which is worse
 * than doing nothing. This only ever runs a local timer.
 */
export function ExcelDownloadButton({
  label,
  compact = false,
}: {
  label: string;
  compact?: boolean;
}) {
  const [state, setState] = useState<State>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const start = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (state !== "idle") return;
    setState("preparing");
    timer.current = setTimeout(() => {
      setState("done");
      timer.current = setTimeout(() => setState("idle"), DONE_MS);
    }, PREPARING_MS);
  };

  const text =
    state === "preparing" ? "Preparing…" : state === "done" ? "Ready" : "Excel";
  const icon = state === "preparing" ? "refresh-cw" : state === "done" ? "check" : "file-down";

  return (
    <button
      type="button"
      className={`${styles.excelButton} ${actions.tip}`}
      data-compact={compact}
      data-state={state}
      onClick={start}
      disabled={state !== "idle"}
      aria-label={`Download ${label} as Excel`}
      data-tip="Download as Excel"
    >
      <Icon name={icon} size={12} className={styles.icon} />
      {compact ? null : text}
    </button>
  );
}
