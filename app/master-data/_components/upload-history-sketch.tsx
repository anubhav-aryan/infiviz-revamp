"use client";

import { useCallback, useId, useState } from "react";
import { Icon } from "@/app/_components/icon";
import { UPLOAD_INTRO, UPLOAD_ROWS } from "../_data/upload-history";
import styles from "./master-data.module.css";

/**
 * Seeded at module scope from the authored `expanded` flags so the first client
 * render is byte-identical to the server's — a `useState` initialiser reading
 * the same constant would do too, but hoisting it makes the determinism the
 * shape of the code rather than a promise in a comment.
 */
const INITIAL_OPEN: Record<string, boolean> = Object.fromEntries(
  UPLOAD_ROWS.map((upload) => [upload.file, upload.expanded]),
);

/**
 * Upload history was only sketched, so it keeps the dashed frame and the pill.
 * The rows are live, though: the design draws the first one open, and from
 * there the reader collapses it or opens any other row that itemised its
 * rejects.
 */
export function UploadHistorySketch() {
  const [open, setOpen] = useState(INITIAL_OPEN);
  const drawerId = useId();

  const toggle = useCallback((file: string) => {
    setOpen((current) => ({ ...current, [file]: !current[file] }));
  }, []);

  return (
    <div className={styles.board}>
      <div className={styles.sketch}>
        <div className={styles.sketchHead}>
          <div>
            <div className={styles.eyebrow}>Master data · audit</div>
            <h1 className={styles.sketchTitle}>Upload history</h1>
          </div>
          <span className={styles.sketchPill}>Layout sketch</span>
        </div>

        <p className={styles.intro}>{UPLOAD_INTRO}</p>

        {UPLOAD_ROWS.map((upload, index) => {
          // Gated on the reasons themselves, not on the rejected count: a
          // clean upload and an upload that never said why are both rows with
          // nothing behind the chevron, and neither should take focus.
          const canExpand = upload.reasons.length > 0;
          const isOpen = canExpand && open[upload.file];
          const panelId = `${drawerId}-${index}`;

          return (
            <div key={upload.file} className={styles.upload}>
              <div className={styles.uploadRow}>
                <span className={styles.uploadIcon} aria-hidden="true">
                  <Icon name={upload.icon} />
                </span>

                <div className={styles.uploadMain}>
                  <div className={styles.uploadFile}>{upload.file}</div>
                  <div className={styles.uploadMeta}>{upload.meta}</div>
                </div>

                <div className={styles.uploadCounts}>
                  <span className={styles.uploadAccepted}>{upload.accepted}</span>
                  <span className={styles.uploadReceived}> / {upload.received}</span>
                  <div
                    className={styles.uploadRejected}
                    data-has-rejects={upload.rejected !== "0" || undefined}
                  >
                    {upload.rejected} rejected
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.uploadChevron}
                  onClick={() => toggle(upload.file)}
                  disabled={!canExpand}
                  aria-disabled={!canExpand}
                  // Omitted rather than hardcoded false when there is nothing to
                  // open, so the row is not announced as a collapsed disclosure.
                  aria-expanded={canExpand ? isOpen : undefined}
                  aria-controls={canExpand ? panelId : undefined}
                  aria-label={`Rejection reasons for ${upload.file}`}
                >
                  <Icon name={isOpen ? "chevron-up" : "chevron-down"} />
                </button>
              </div>

              {isOpen ? (
                <div id={panelId} className={styles.drawer}>
                  <div className={styles.drawerTitle}>Rejection reasons</div>
                  {upload.reasons.map((reason) => (
                    <div key={reason} className={styles.reason}>
                      <Icon
                        name="alert-circle"
                        className={styles.reasonIcon}
                        aria-hidden="true"
                      />
                      {reason}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
