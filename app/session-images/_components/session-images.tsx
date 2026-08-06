"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/app/_components/icon";
import { PhotoLightbox } from "@/app/store-explorer/_components/photo-lightbox";
import {
  PHOTOS,
  PHOTO_GROUPS,
  VISIT_DETAIL,
} from "@/app/store-explorer/_data/store-explorer";
import styles from "./session-images.module.css";

/**
 * A visit's captures, stacked by category.
 *
 * `PhotoLightbox` is imported rather than reimplemented — it carries the focus
 * trap, keyboard paging and metadata panel, which is the part worth sharing.
 * The grid itself is written here against this screen's own stylesheet; lifting
 * it out of Store Explorer would have meant moving half of that screen's CSS
 * module, which is a bigger change than the markup is worth.
 *
 * The photo set is the platform's one authored capture set, so every store
 * shows the same stack. Only the header identifies the store.
 */

export function SessionImages({ store }: { store: string }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className={styles.screen}>
      <Link href="/photo-quality" className={styles.back}>
        <Icon name="arrow-left" size={15} />
        Back to Photo quality
      </Link>

      <header className={styles.head}>
        <div>
          <div className={styles.eyebrow}>Session images</div>
          <h1 className={styles.title}>{store}</h1>
          <p className={styles.subtitle}>
            {PHOTOS.length} captures in this session · {VISIT_DETAIL.date} ·{" "}
            {VISIT_DETAIL.merchandiser}
          </p>
        </div>

        <Link href="/session-viewer" className={styles.secondary}>
          Open in Session Viewer
          <Icon name="arrow-up-right" size={14} />
        </Link>
      </header>

      {PHOTO_GROUPS.map((group) => {
        const photos = PHOTOS.slice(group.from, group.to);
        return (
          <section key={group.name} className={styles.group}>
            <div className={styles.groupHead}>
              <span className={styles.groupName}>{group.name}</span>
              <span className={styles.groupMeta}>
                {photos.length} photos · {group.timeRange}
              </span>
            </div>

            <div className={styles.grid}>
              {photos.map((photo, i) => {
                const index = group.from + i;
                return (
                  <button
                    key={photo.seq}
                    type="button"
                    className={styles.tile}
                    onClick={() => setOpen(index)}
                    aria-label={`Open photo ${photo.seq}, ${photo.category}, captured ${photo.time}`}
                  >
                    <span className={styles.frame}>
                      <span
                        className={styles.quality}
                        data-quality={photo.quality}
                        aria-hidden="true"
                      >
                        <Icon
                          name={photo.quality === "flag" ? "alert-triangle" : "check"}
                          size={12}
                        />
                      </span>
                      <span className={styles.seq}>#{photo.seq}</span>
                    </span>
                    <span className={styles.time}>{photo.time}</span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {open !== null ? (
        <PhotoLightbox
          index={open}
          onClose={() => setOpen(null)}
          onPrev={() => setOpen((i) => (i === null ? null : Math.max(0, i - 1)))}
          onNext={() =>
            setOpen((i) => (i === null ? null : Math.min(PHOTOS.length - 1, i + 1)))
          }
        />
      ) : null}
    </div>
  );
}
