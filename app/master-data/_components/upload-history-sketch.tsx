import { Icon } from "@/app/_components/icon";
import { UPLOAD_INTRO, UPLOAD_ROWS } from "../_data/upload-history";
import styles from "./master-data.module.css";

/**
 * Upload history was only sketched, so it keeps the dashed frame and the
 * pill. The first row is drawn open in the design to show the drawer; that is
 * a fixed state rather than a default the reader can collapse.
 */
export function UploadHistorySketch() {
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

        {UPLOAD_ROWS.map((upload) => (
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
                aria-expanded={upload.expanded}
                aria-label={`Rejection reasons for ${upload.file}`}
              >
                <Icon name={upload.expanded ? "chevron-up" : "chevron-down"} />
              </button>
            </div>

            {upload.expanded ? (
              <div className={styles.drawer}>
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
        ))}
      </div>
    </div>
  );
}
