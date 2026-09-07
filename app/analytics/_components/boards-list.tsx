"use client";

import Link from "next/link";
import { Icon } from "@/app/_components/icon";
import { useBoards } from "../_data/use-boards";
import styles from "./boards.module.css";

/**
 * The boards a reader has built.
 *
 * "Create a board" is a link, not a button that creates one. The previous
 * version created a board named "Board 3" on click and navigated to it, which
 * left an empty board behind every time someone looked and backed out — and
 * numbered from `boards.length + 1`, so deleting one and creating another gave
 * two boards with the same name.
 */
export function BoardsList() {
  const { boards, ready } = useBoards();

  return (
    <div className={styles.screen}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Boards</h1>
          <p className={styles.subtitle}>
            Pages you assemble yourself, from figures the modules already publish.
          </p>
        </div>
        <Link href="/analytics/boards/new" className={styles.primaryButton}>
          <Icon name="plus" size={14} />
          Create a board
        </Link>
      </div>

      {/* `ready` gates the empty state, never the list: until localStorage has
          been read the honest answer is "checking", and asserting there are no
          boards would differ from what was prerendered. */}
      {boards.length ? (
        <div className={styles.boardGrid}>
          {boards.map((board) => (
            <Link
              key={board.id}
              href={`/analytics/boards/${board.id}`}
              className={styles.boardCard}
            >
              <span className={styles.boardName}>{board.name}</span>
              <span className={styles.boardMeta}>
                {board.widgets.length}{" "}
                {board.widgets.length === 1 ? "widget" : "widgets"}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>
          {ready
            ? "No boards yet. Create one and put whatever you want to watch on it."
            : "Checking this browser…"}
        </p>
      )}
    </div>
  );
}
