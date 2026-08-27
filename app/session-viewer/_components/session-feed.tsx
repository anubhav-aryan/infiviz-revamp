"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/app/_components/icon";
import { PhotoLightbox } from "@/app/_components/photo-lightbox";
import { photosForCategory, type Photo } from "@/app/_data/visits";
import type { FlatSession } from "../_data/session-history";
import styles from "./compare.module.css";

/** How many sessions a page of the feed shows before "Load more". */
const PAGE = 10;

/**
 * The comparison feed: one row per session, newest first — the capture's
 * photos on the left, its metadata on the right, the way the reviewers'
 * previous tooling laid it out.
 *
 * Photos are the category's mock pool for now; clicking one opens the same
 * `PhotoLightbox` the Session Images screen uses, arrows and all. The metrics
 * come from the session history fixture — the same rows the header's Session
 * picker lists, so the feed and the picker can never disagree about what
 * sessions exist.
 *
 * Ten rows at a time. The history is long enough that rendering all of it at
 * once would bury the recent captures the page is usually opened for.
 */
export function SessionFeed({
  sessions,
  store,
  place,
  storeId,
  merchandiser,
  viewerHref,
}: {
  /** Every session across every visit, newest first. */
  sessions: FlatSession[];
  store: string;
  place: string;
  storeId: string;
  merchandiser: string;
  viewerHref: string;
}) {
  const [visible, setVisible] = useState(PAGE);
  const [lightbox, setLightbox] = useState<{ photos: Photo[]; index: number } | null>(
    null,
  );

  const shown = sessions.slice(0, visible);
  const remaining = sessions.length - shown.length;

  return (
    <section className={styles.feed} aria-label="Session comparison feed">
      {shown.map((session, index) => {
        const photos = photosForCategory(session.category);
        return (
          <article key={session.id} className={styles.feedRow}>
            <header className={styles.feedHead}>
              <span className={styles.feedCategory}>{session.category}</span>
              <span className={styles.feedStore}>
                {store} : {place}
              </span>
              <span className={styles.feedMono}>{storeId}</span>
              <span className={styles.feedMono}>
                {session.dayLabel} · {session.startedAt}
              </span>
              {index === 0 ? (
                <span className={styles.chip} data-tone="success">
                  Selected session
                </span>
              ) : null}
              <Link href={viewerHref} className={styles.feedOpen}>
                Go to Session View
              </Link>
            </header>

            <div className={styles.feedBody}>
              <div className={styles.feedPhotos}>
                {photos.map((photo, photoIndex) => (
                  <button
                    key={photo.src}
                    type="button"
                    className={styles.feedThumb}
                    onClick={() => setLightbox({ photos, index: photoIndex })}
                    aria-label={`Open photo ${photo.seq} of the ${session.dayLabel} ${session.category} capture`}
                  >
                    <img src={photo.src} alt="" />
                  </button>
                ))}
              </div>

              <dl className={styles.feedMetrics}>
                <div>
                  <dt>Photo count</dt>
                  <dd>{session.photos}</dd>
                </div>
                <div>
                  <dt>Username</dt>
                  <dd>{merchandiser}</dd>
                </div>
                <div>
                  <dt>Slant count</dt>
                  <dd>{session.slantCount}</dd>
                </div>
                <div>
                  <dt>Blur count</dt>
                  <dd>{session.blurCount}</dd>
                </div>
                <div>
                  <dt>Duplicate count</dt>
                  <dd>{session.duplicateCount}</dd>
                </div>
                <div>
                  <dt>POG size (ft)</dt>
                  <dd>{session.pogSizeFt}</dd>
                </div>
                <div>
                  <dt>Store standard compliant</dt>
                  <dd
                    className={styles.feedVerdict}
                    data-good={session.standardCompliant}
                  >
                    <Icon name={session.standardCompliant ? "check" : "x"} size={13} />
                    {session.standardCompliant ? "true" : "false"}
                  </dd>
                </div>
              </dl>
            </div>
          </article>
        );
      })}

      {remaining > 0 ? (
        <button
          type="button"
          className={styles.loadMore}
          onClick={() => setVisible((count) => count + PAGE)}
        >
          Load more · {remaining} older {remaining === 1 ? "session" : "sessions"}
        </button>
      ) : null}

      {lightbox ? (
        <PhotoLightbox
          photos={lightbox.photos}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onPrev={() =>
            setLightbox((state) =>
              state ? { ...state, index: Math.max(0, state.index - 1) } : state,
            )
          }
          onNext={() =>
            setLightbox((state) =>
              state
                ? { ...state, index: Math.min(state.photos.length - 1, state.index + 1) }
                : state,
            )
          }
        />
      ) : null}
    </section>
  );
}
