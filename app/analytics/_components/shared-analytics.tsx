"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@/app/_components/icon";
import { useToast } from "@/app/_components/toast/toast-context";
import { personById } from "@/app/tickets/_data/people";
import { WIDGET_BY_ID } from "../_data/board-widgets";
import { useBoards } from "../_data/use-boards";
import {
  markOpened,
  toggleSaved,
  useSharedInbox,
} from "../_data/use-shared-views";
import type { SharedView } from "../_data/shared-views";
import { BoardCanvas } from "./board-view";
import styles from "./shared-analytics.module.css";

/**
 * Shared Analytics — the inbox for views other people sent, the reader's own
 * saved ones, and the boards they built.
 *
 * Two things, split by whether the query carries widget ids:
 *
 *   ?board=Q3+review&w=osa-trend|…   a board that arrived by link
 *   (no params)                      the inbox
 *
 * A link-received board stays here rather than moving to `/analytics/boards`
 * because it is not the reader's board — it has no id, only contents, and it
 * exists for exactly as long as the URL does. The reader's own boards do have
 * ids and live under `/analytics/boards/<id>`; a bare `?board=<id>` is a link
 * from before that move, so it is forwarded rather than broken.
 */
export function SharedAnalytics() {
  const params = useSearchParams();
  const router = useRouter();
  const boardParam = params.get("board");
  const widgetsParam = params.get("w");
  const legacyOwnBoard = !!boardParam && !widgetsParam;

  useEffect(() => {
    if (legacyOwnBoard) router.replace(`/analytics/boards/${boardParam}`);
  }, [legacyOwnBoard, boardParam, router]);

  if (boardParam && widgetsParam) {
    return <SharedBoard name={boardParam} widgetIds={widgetsParam.split("|")} />;
  }
  /* Nothing to draw for the one frame before the replace lands. */
  if (legacyOwnBoard) return null;
  return <Inbox />;
}

/* ---------- the list ---------- */

function Inbox() {
  const { views, savedIds, openedIds } = useSharedInbox();

  const saved = views.filter((view) => savedIds.includes(view.id));
  /* Ordered by the open history, not by the list, so "recently opened" means
     what it says. */
  const recent = openedIds
    .map((id) => views.find((view) => view.id === id))
    .filter((view): view is SharedView => !!view);

  return (
    <div className={styles.screen}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Shared Analytics</h1>
          <p className={styles.subtitle}>
            Views your team sent you, the ones you kept, and boards of your own.
          </p>
        </div>
      </div>

      {recent.length > 0 ? (
        <Section title="Recently opened" caption="Where you were last.">
          <div className={styles.cardGrid}>
            {recent.map((view) => (
              <ViewCard
                key={`recent-${view.id}`}
                view={view}
                saved={savedIds.includes(view.id)}
              />
            ))}
          </div>
        </Section>
      ) : null}

      <Section
        title="Shared with me"
        caption="Opening one applies its filters. Star it to keep it."
      >
        <div className={styles.cardGrid}>
          {views.map((view) => (
            <ViewCard key={view.id} view={view} saved={savedIds.includes(view.id)} />
          ))}
        </div>
      </Section>

      <Section title="Saved" caption="Yours to come back to.">
        {saved.length ? (
          <div className={styles.cardGrid}>
            {saved.map((view) => (
              <ViewCard key={`saved-${view.id}`} view={view} saved />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>
            Nothing saved yet. Star a view above to keep it here.
          </p>
        )}
      </Section>

    </div>
  );
}

function Section({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <span className={styles.sectionCaption}>{caption}</span>
      </div>
      {children}
    </section>
  );
}

function ViewCard({ view, saved }: { view: SharedView; saved: boolean }) {
  /* `fromId` is empty on anything the reader shared themselves — there is no
     person to look up, and "Shared by you" is the truthful caption. */
  const from = view.fromId ? personById(view.fromId) : undefined;

  return (
    <div className={styles.viewCard}>
      <div className={styles.viewHead}>
        <Link
          href={view.query}
          className={styles.viewName}
          onClick={() => markOpened(view.id)}
        >
          {view.name}
        </Link>
        <button
          type="button"
          className={styles.star}
          data-on={saved}
          onClick={() => toggleSaved(view.id)}
          aria-label={saved ? `Unsave ${view.name}` : `Save ${view.name}`}
          aria-pressed={saved}
        >
          {/* One icon for both states, filled by CSS on `data-on` — the same
              way `.checkbox` signals itself rather than swapping glyph. */}
          <Icon name="star" size={14} />
        </button>
      </div>

      <div className={styles.viewFrom}>
        {from ? `${from.name} · ${from.role}` : "Shared by you"} · {view.when}
      </div>

      {view.note ? <p className={styles.viewNote}>{view.note}</p> : null}

      <div className={styles.viewChips}>
        {view.chips.length ? (
          view.chips.map((chip) => (
            <span key={`${chip.dim}-${chip.value}`} className={styles.viewChip}>
              <span className={styles.viewChipDim}>{chip.dim}</span>
              {chip.value}
            </span>
          ))
        ) : (
          <span className={styles.viewChipMuted}>No filters — the whole account</span>
        )}
      </div>
    </div>
  );
}

/* ---------- a board that arrived by link ---------- */

function SharedBoard({ name, widgetIds }: { name: string; widgetIds: string[] }) {
  const { adopt } = useBoards();
  const router = useRouter();
  const toast = useToast();

  /* Only the ids the catalogue knows. A link naming a widget this build does
     not have loses that card rather than failing to open. */
  const known = widgetIds.filter((id) => WIDGET_BY_ID.has(id));
  const dropped = widgetIds.length - known.length;

  return (
    <div className={styles.screen}>
      <BoardCrumb />

      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>{name}</h1>
          <p className={styles.subtitle}>
            Shared with you · read-only
            {dropped > 0
              ? ` · ${dropped} widget${dropped === 1 ? "" : "s"} this build does not have`
              : ""}
          </p>
        </div>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => {
            const saved = adopt(name, known);
            toast?.show({ message: `Saved “${saved.name}” to your boards.` });
            router.push(`/analytics/boards/${saved.id}`);
          }}
        >
          <Icon name="bookmark" size={14} />
          Save to my boards
        </button>
      </div>

      {/* Keyed by the widget set, not a constant. A hardcoded key meant every
          board arriving by link shared one saved order, so opening a second
          link in the same session rendered nothing — the cached order held the
          first board's ids, none of which the second one has. */}
      <BoardCanvas pageKey={`board:shared:${known.join(",")}`} widgetIds={known} />
    </div>
  );
}

function BoardCrumb() {
  return (
    <Link href="/analytics/shared" className={styles.crumb}>
      <Icon name="chevron-left" size={13} />
      Shared Analytics
    </Link>
  );
}

