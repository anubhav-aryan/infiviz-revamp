"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/app/_components/icon";
import { ReorderableGrid, type ReorderableItem } from "@/app/_components/reorderable-grid";
import { CURRENT_MONTH } from "@/app/_time/periods";
import { WIDGET_BY_ID } from "../_data/board-widgets";
import { useBoards, type Board } from "../_data/use-boards";
import { BoardWidgetCard } from "./board-widget-card";
import styles from "./boards.module.css";

/**
 * A saved board.
 *
 * Read-only apart from arranging it: what is *on* a board is decided in the
 * editor, and the one thing this page owns is the order, because dragging a
 * card is the kind of change you make while looking at the result.
 */
export function BoardView({ id }: { id: string }) {
  const { boards, ready, remove } = useBoards();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const board = boards.find((b) => b.id === id);

  if (!board) {
    return (
      <div className={styles.screen}>
        <Crumb />
        <p className={styles.empty}>
          {ready
            ? "That board is not on this device. Boards live in the browser that made them — open a shared link to bring one across."
            : "Checking this browser…"}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <Crumb />

      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>{board.name}</h1>
          <p className={styles.subtitle}>
            {board.widgets.length}{" "}
            {board.widgets.length === 1 ? "widget" : "widgets"}
            {board.widgets.length > 1 ? " · drag to rearrange" : ""}
          </p>
        </div>
        <div className={styles.headActions}>
          {confirming ? (
            /* Inline confirm rather than a browser dialog, matching how the
               ticket panel guards its delete. The old board page removed and
               navigated on a single click with no confirmation at all. */
            <div className={styles.confirmRow}>
              <span className={styles.confirmText}>Delete “{board.name}”?</span>
              <button
                type="button"
                className={styles.dangerButton}
                onClick={() => {
                  remove(board.id);
                  router.push("/analytics/boards");
                }}
              >
                Delete
              </button>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setConfirming(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <ShareBoardButton board={board} />
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setConfirming(true)}
              >
                <Icon name="trash-2" size={13} />
                Delete
              </button>
              <Link
                href={`/analytics/boards/${board.id}/edit`}
                className={styles.primaryButton}
              >
                <Icon name="sliders-horizontal" size={14} />
                Edit
              </Link>
            </>
          )}
        </div>
      </div>

      <BoardCanvas
        pageKey={`board:${board.id}`}
        widgetIds={board.widgets}
        emptyAction={
          <Link href={`/analytics/boards/${board.id}/edit`} className={styles.primaryButton}>
            <Icon name="plus" size={14} />
            Add widgets
          </Link>
        }
      />
    </div>
  );
}

/**
 * The widgets of a board, arranged.
 *
 * Shared with the link-received board, which is why `pageKey` is a parameter
 * rather than derived from an id here: a board that arrived by link has no id
 * of its own, and two different links must not share one saved order.
 */
export function BoardCanvas({
  pageKey,
  widgetIds,
  emptyAction,
}: {
  pageKey: string;
  widgetIds: string[];
  emptyAction?: React.ReactNode;
}) {
  const widgets = widgetIds
    .map((id) => WIDGET_BY_ID.get(id))
    .filter((w): w is NonNullable<typeof w> => !!w);

  if (!widgets.length) {
    return (
      <div className={styles.blankCanvas}>
        <Icon name="layout-grid" size={22} />
        <p className={styles.blankTitle}>Nothing on this board yet</p>
        <p className={styles.blankText}>
          Choose what goes on it and the cards appear here.
        </p>
        {emptyAction}
      </div>
    );
  }

  const items: ReorderableItem[] = widgets.map((widget) => ({
    id: widget.id,
    span: widget.span,
    node: <BoardWidgetCard widget={widget} period={CURRENT_MONTH} />,
  }));

  return <ReorderableGrid pageKey={pageKey} items={items} columns={2} />;
}

function Crumb() {
  return (
    <Link href="/analytics/boards" className={styles.crumb}>
      <Icon name="chevron-left" size={13} />
      Boards
    </Link>
  );
}

/**
 * Copies a link that carries the board's contents, not just its id — boards
 * live in the browser that made them, so an id alone would open empty for
 * anyone else. Widget ids are short, so the URL stays a URL.
 */
export function ShareBoardButton({ board }: { board: Board }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    const query = new URLSearchParams({
      board: board.name,
      w: board.widgets.join("|"),
    });
    const url = `${window.location.origin}/analytics/shared?${query}`;
    void navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  }

  return (
    <button
      type="button"
      className={styles.ghostButton}
      onClick={copy}
      disabled={!board.widgets.length}
      title={board.widgets.length ? undefined : "Add a widget first"}
    >
      <Icon name={copied ? "check" : "share-2"} size={13} />
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
