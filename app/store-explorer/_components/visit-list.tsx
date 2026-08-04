import { Icon } from "@/app/_components/icon";
import type { Visit } from "../_data/store-explorer";
import styles from "./store-explorer.module.css";

type VisitProps = {
  visits: Visit[];
  onOpen: (visit: Visit) => void;
};

function StatusChip({ status }: { status: Visit["status"] }) {
  return (
    <span className={styles.statusChip} data-status={status}>
      {status}
    </span>
  );
}

export function VisitList({ visits, onOpen }: VisitProps) {
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

export function VisitGallery({ visits, onOpen }: VisitProps) {
  return (
    <div className={styles.gallery}>
      {visits.map((visit) => (
        <button
          key={visit.store}
          type="button"
          className={`${styles.reset} ${styles.galleryCard}`}
          onClick={() => onOpen(visit)}
          aria-label={`Open App Images for ${visit.store}`}
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
