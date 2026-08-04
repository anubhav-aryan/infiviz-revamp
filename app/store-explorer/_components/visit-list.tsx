import { Icon } from "@/app/_components/icon";
import type { Visit } from "../_data/store-explorer";
import styles from "./store-explorer.module.css";

type VisitProps = {
  visits: Visit[];
  onOpen: (visit: Visit) => void;
  /** Absent when nothing is filtered, so the empty state offers no dead action. */
  onClearFilters?: () => void;
};

function StatusChip({ status }: { status: Visit["status"] }) {
  return (
    <span className={styles.statusChip} data-status={status}>
      {status}
    </span>
  );
}

/**
 * The list is a sample of the period's visits, not all of them, and the sample
 * only covers Ho Chi Minh City and the South East — so a filter that matches
 * hundreds of visits can still leave no rows to draw. The copy says so rather
 * than implying the filter found nothing at all.
 */
function NoVisits({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyIcon} aria-hidden="true">
        <Icon name="image-off" size={20} />
      </span>
      <div className={styles.emptyTitle}>No visits to show</div>
      <p className={styles.emptyBody}>
        The sampled rows cover Ho Chi Minh City and the South East. Widen the
        filters to bring them back.
      </p>
      {onClearFilters ? (
        <button type="button" className={styles.linkButton} onClick={onClearFilters}>
          Clear filters
        </button>
      ) : null}
    </div>
  );
}

export function VisitList({ visits, onOpen, onClearFilters }: VisitProps) {
  if (visits.length === 0) return <NoVisits onClearFilters={onClearFilters} />;

  return (
    <div>
      {visits.map((visit) => (
        <button
          key={visit.store}
          type="button"
          className={`${styles.reset} ${styles.visitRow}`}
          onClick={() => onOpen(visit)}
          aria-label={`Open App Images for ${visit.store}`}
        >
          <span className={styles.visitRowTop}>
            <span className={styles.visitStore}>{visit.store}</span>
            <StatusChip status={visit.status} />
          </span>

          <span className={styles.visitMeta}>
            <span>{visit.retailer}</span>
            <span className={styles.visitMetaSep}>·</span>
            <span className={styles.visitMetaItem}>
              <Icon name="clock" size={13} />
              {visit.time}
            </span>
            <span className={styles.visitMetaSep}>·</span>
            <span className={styles.visitMono}>{visit.merchandiser}</span>
          </span>

          <span className={styles.visitRowBottom}>
            <span className={styles.visitPhotos}>
              <span className={styles.visitPhotoCount}>
                <Icon name="image" size={13} />
                {visit.photos} photos
              </span>
              <span className={styles.visitCategories}>{visit.categories}</span>
            </span>
            <span className={styles.openLink}>
              Open
              <Icon name="arrow-right" size={14} />
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

export function VisitGallery({ visits, onOpen, onClearFilters }: VisitProps) {
  if (visits.length === 0) return <NoVisits onClearFilters={onClearFilters} />;

  return (
    <div className={styles.gallery}>
      {visits.map((visit) => (
        <button
          key={visit.store}
          type="button"
          className={`${styles.reset} ${styles.galleryCard}`}
          onClick={() => onOpen(visit)}
          // The status chip lives inside the aria-hidden thumbnail here, so it
          // has to be spoken by the label or Gallery loses what List announces.
          aria-label={`Open App Images for ${visit.store} — ${visit.status}`}
        >
          <span
            className={`${styles.galleryThumb} ${styles.photoPlaceholder}`}
            aria-hidden="true"
          >
            <span className={styles.galleryThumbChip}>
              <StatusChip status={visit.status} />
            </span>
          </span>

          <span className={styles.galleryBody}>
            <span className={styles.galleryTitle}>{visit.store}</span>
            <span className={styles.gallerySub}>
              {visit.retailer} · {visit.time} · {visit.merchandiser}
            </span>
            <span className={styles.galleryFoot}>
              <span className={styles.galleryPhotos}>
                {visit.photos} photos
              </span>
              <span className={styles.openLink}>
                Open
                <Icon name="arrow-right" size={14} />
              </span>
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
