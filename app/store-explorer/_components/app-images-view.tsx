import { Icon } from "@/app/_components/icon";
import {
  PHOTO_GROUPS,
  PHOTOS,
  TIMELINE,
  VISIT_DETAIL,
} from "../_data/store-explorer";
import styles from "./store-explorer.module.css";

type AppImagesViewProps = {
  onBack: () => void;
  onOpenPhoto: (index: number) => void;
};

export function AppImagesView({ onBack, onOpenPhoto }: AppImagesViewProps) {
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
          <h1 className={styles.imagesTitle}>{VISIT_DETAIL.title}</h1>
          <div className={styles.imagesMeta}>
            <span className={styles.imagesMetaItem}>
              <Icon name="store" size={15} />
              {VISIT_DETAIL.retailer}
            </span>
            <span className={styles.imagesMetaItem}>
              <Icon name="map-pin" size={15} />
              {VISIT_DETAIL.address}
            </span>
            <span className={styles.imagesMetaItem}>
              <Icon name="calendar" size={15} />
              {VISIT_DETAIL.date}
            </span>
            <span className={`${styles.imagesMetaItem} ${styles.imagesMetaMono}`}>
              <Icon name="user" size={15} />
              {VISIT_DETAIL.merchandiser}
            </span>
          </div>
        </div>

        <span className={styles.photoCountBadge}>
          <Icon name="image" />
          {VISIT_DETAIL.photoCountLabel}
        </span>
      </div>

      {/* visit timeline */}
      <div className={`${styles.card} ${styles.timelineCard}`}>
        <div className={styles.timelineHead}>
          <span className={styles.panelTitle}>Visit timeline</span>
          <span className={styles.timelineTotal}>
            Total time in store <b>{VISIT_DETAIL.totalTime}</b>
          </span>
        </div>

        <div className={styles.timeline}>
          <div className={styles.timelineRail} aria-hidden="true" />
          {TIMELINE.map((step) => (
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

      {/* photos by category */}
      {PHOTO_GROUPS.map((group) => {
        const photos = PHOTOS.slice(group.from, group.to);
        return (
          <div key={group.name} className={styles.photoGroup}>
            <div className={styles.photoGroupHead}>
              <span className={styles.photoGroupName}>{group.name}</span>
              <span className={styles.photoGroupMeta}>
                {photos.length} photos · {group.timeRange}
              </span>
            </div>

            <div className={styles.photoGrid}>
              {photos.map((photo, i) => {
                const index = group.from + i;
                return (
                  <button
                    key={photo.seq}
                    type="button"
                    className={`${styles.reset} ${styles.photoTile}`}
                    onClick={() => onOpenPhoto(index)}
                    aria-label={`Open photo ${photo.seq}, ${photo.category}, captured ${photo.time}`}
                  >
                    <span
                      className={`${styles.photoFrame} ${styles.photoPlaceholder}`}
                    >
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
                          name={
                            photo.quality === "flag" ? "alert-triangle" : "check"
                          }
                          size={12}
                        />
                      </span>
                      <span className={styles.photoSeq}>#{photo.seq}</span>
                    </span>
                    <span className={styles.photoTime}>{photo.time}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
