import { Icon } from "@/app/_components/icon";
import { storeById } from "@/app/_data/stores-geo";
import { photosFor, visitTiming, type Visit } from "../_data/store-explorer";
import styles from "./store-explorer.module.css";

type AppImagesViewProps = {
  visit: Visit;
  onBack: () => void;
  onOpenPhoto: (index: number) => void;
};

export function AppImagesView({ visit, onBack, onOpenPhoto }: AppImagesViewProps) {
  const store = storeById(visit.storeId);
  const photos = photosFor(visit);
  const { steps, totalTimeLabel } = visitTiming(visit);

  return (
    <div className={styles.images}>
      <button
        type="button"
        className={`${styles.reset} ${styles.backLink}`}
        onClick={onBack}
        aria-label="Back to Store Explorer"
      >
        <Icon name="arrow-left" size={16} />
        Store Explorer
      </button>

      {/* header */}
      <div className={styles.imagesHead}>
        <div>
          <h1 className={styles.imagesTitle}>{visit.store}</h1>
          <div className={styles.imagesMeta}>
            <span className={styles.imagesMetaItem}>
              <Icon name="store" size={15} />
              {visit.retailer}
            </span>
            <span className={styles.imagesMetaItem}>
              <Icon name="map-pin" size={15} />
              {store.district}, {store.region}
            </span>
            <span className={styles.imagesMetaItem}>
              <Icon name="list" size={15} />
              {visit.category}
            </span>
            <span className={styles.imagesMetaItem}>
              <Icon name="boxes" size={15} />
              {visit.placement}
            </span>
            <span className={`${styles.imagesMetaItem} ${styles.imagesMetaMono}`}>
              <Icon name="user" size={15} />
              {visit.merchandiser}
            </span>
          </div>
        </div>

        <span className={styles.photoCountBadge}>
          <Icon name="image" />
          {photos.length} photos · raw captures
        </span>
      </div>

      {/* visit timeline */}
      <div className={`${styles.card} ${styles.timelineCard}`}>
        <div className={styles.timelineHead}>
          <span className={styles.panelTitle}>Visit timeline</span>
          <span className={styles.timelineTotal}>
            Total time in store <b>{totalTimeLabel}</b>
          </span>
        </div>

        <div className={styles.timeline}>
          <div className={styles.timelineRail} aria-hidden="true" />
          {steps.map((step) => (
            <div key={step.label} className={styles.timelineStep}>
              <span className={styles.timelineDot} aria-hidden="true">
                <Icon name={step.icon} size={13} />
              </span>
              <div className={styles.timelineLabel}>{step.label}</div>
              <div className={styles.timelineTime}>{step.time}</div>
              {step.gap ? (
                <div className={styles.timelineGap}>+{step.gap}</div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* the one category this session captured */}
      <div className={styles.photoGroup}>
        <div className={styles.photoGroupHead}>
          <span className={styles.photoGroupName}>{visit.category}</span>
          <span className={styles.photoGroupMeta}>{photos.length} photos</span>
        </div>

        <div className={styles.photoGrid}>
          {photos.map((photo, index) => (
            <button
              key={photo.seq}
              type="button"
              className={`${styles.reset} ${styles.photoTile}`}
              onClick={() => onOpenPhoto(index)}
              aria-label={`Open photo ${photo.seq}, ${photo.category}, captured ${photo.time}`}
            >
              <span className={`${styles.photoFrame} ${styles.photoPlaceholder}`}>
                <img
                  className={styles.fillImage}
                  src={photo.src}
                  alt={`${photo.category} shelf capture #${photo.seq}`}
                />
                <span
                  className={styles.photoQuality}
                  data-quality={photo.quality}
                  aria-hidden="true"
                >
                  <Icon
                    name={photo.quality === "flag" ? "alert-triangle" : "check"}
                    size={12}
                  />
                </span>
                <span className={styles.photoSeq}>#{photo.seq}</span>
              </span>
              <span className={styles.photoTime}>{photo.time}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
