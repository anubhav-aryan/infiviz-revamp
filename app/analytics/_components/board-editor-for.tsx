"use client";

import Link from "next/link";
import { Icon } from "@/app/_components/icon";
import { useBoards } from "../_data/use-boards";
import { BoardEditor } from "./board-editor";
import styles from "./boards.module.css";

/**
 * Resolves a board id to the board, then hands it to the editor.
 *
 * A separate component because `BoardEditor` seeds its draft from the board it
 * is given, via `useState` — so it must not mount until that board is known.
 * Rendering it with `board={undefined}` while localStorage is still being read
 * would seed an empty draft and then keep it, quietly turning an edit into a
 * new board. Waiting for `ready` here is what prevents that.
 */
export function BoardEditorFor({ id }: { id: string }) {
  const { boards, ready } = useBoards();

  if (!ready) {
    return (
      <div className={styles.screen}>
        <p className={styles.empty}>Checking this browser…</p>
      </div>
    );
  }

  const board = boards.find((b) => b.id === id);

  if (!board) {
    return (
      <div className={styles.screen}>
        <Link href="/analytics/boards" className={styles.crumb}>
          <Icon name="chevron-left" size={13} />
          Boards
        </Link>
        <p className={styles.empty}>
          That board is not on this device, so there is nothing to edit.
        </p>
      </div>
    );
  }

  /* Keyed by id so switching boards remounts the editor and reseeds the draft,
     rather than keeping the previous board's name and ticks. */
  return <BoardEditor key={board.id} board={board} />;
}
