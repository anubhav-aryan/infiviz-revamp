"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/app/_components/icon";
import { useToast } from "@/app/_components/toast/toast-context";
import { ControlledReorderableGrid } from "@/app/_components/reorderable-grid";
import { CURRENT_MONTH } from "@/app/_time/periods";
import { WIDGET_BY_ID, widgetsByGroup } from "../_data/board-widgets";
import { useBoards, type Board, type BoardDraft } from "../_data/use-boards";
import { BoardWidgetCard } from "./board-widget-card";
import styles from "./boards.module.css";

/**
 * Compose a board: name it, tick the widgets, Save.
 *
 * **The draft never touches storage until Save.** That is the whole point of
 * this component, and it is what the first version got wrong — it created the
 * board on the click that opened the editor and wrote every keystroke of the
 * name straight to localStorage. Because the write trimmed as it went, a
 * trailing space never survived long enough to type a second word, so a
 * multi-word name was impossible. A draft in component state cannot do that.
 *
 * Serves both routes. `board` absent is a new board; `board` present edits
 * that one in place, keeping its id so a link already shared still resolves.
 */
export function BoardEditor({ board }: { board?: Board }) {
  const { saveBoard } = useBoards();
  const router = useRouter();
  const toast = useToast();

  const [draft, setDraft] = useState<BoardDraft>({
    name: board?.name ?? "",
    widgets: board?.widgets ?? [],
  });

  const named = draft.name.trim().length > 0;
  const chosen = draft.widgets
    .map((id) => WIDGET_BY_ID.get(id))
    .filter((w): w is NonNullable<typeof w> => !!w);

  function toggle(id: string) {
    setDraft((current) => ({
      ...current,
      widgets: current.widgets.includes(id)
        ? current.widgets.filter((w) => w !== id)
        : [...current.widgets, id],
    }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    /* Belt and braces: the button is disabled without a name, but a form also
       submits on Enter from the field itself. */
    if (!named) return;
    const saved = saveBoard(draft, board?.id);
    toast?.show({
      message: board ? `Saved “${saved.name}”.` : `Created “${saved.name}”.`,
      action: { label: "Open", href: `/analytics/boards/${saved.id}` },
    });
    router.push(`/analytics/boards/${saved.id}`);
  }

  return (
    <form className={styles.screen} onSubmit={submit}>
      <Link href={board ? `/analytics/boards/${board.id}` : "/analytics/boards"} className={styles.crumb}>
        <Icon name="chevron-left" size={13} />
        {board ? board.name : "Boards"}
      </Link>

      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>{board ? "Edit board" : "New board"}</h1>
          <p className={styles.subtitle}>
            Name it, choose what goes on it, then save. Nothing is kept until you do.
          </p>
        </div>
      </div>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Board name</span>
        <input
          className={styles.input}
          value={draft.name}
          onChange={(event) =>
            setDraft((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="Q3 availability review"
          /* Matches the only other named-thing input in the app, the saved-views
             field — a name longer than this stops fitting its card. */
          maxLength={40}
          autoFocus
        />
      </label>

      <div className={styles.editorPanes}>
        <div className={styles.editorPane}>
          <div className={styles.paneLabel}>
            Widgets
            <span className={styles.paneCount}>
              {draft.widgets.length} selected
            </span>
          </div>

          {widgetsByGroup().map(({ group, widgets }) => (
            <div key={group} className={styles.catGroup}>
              <div className={styles.catGroupLabel}>{group}</div>
              {widgets.map((widget) => {
                const on = draft.widgets.includes(widget.id);
                return (
                  /* `role="checkbox"` on a button with a `data-on` box — the
                     idiom every multi-select in this app uses. There is no
                     checkbox primitive here by design. */
                  <button
                    key={widget.id}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    className={styles.catItem}
                    onClick={() => toggle(widget.id)}
                  >
                    <span className={styles.checkbox} data-on={on} aria-hidden="true">
                      {on ? <Icon name="check" size={11} /> : null}
                    </span>
                    <span className={styles.catItemMain}>
                      <span className={styles.catItemLabel}>{widget.label}</span>
                      <span className={styles.catItemBlurb}>{widget.blurb}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className={styles.editorPane}>
          <div className={styles.paneLabel}>Preview</div>
          {chosen.length ? (
            /* Real figures, through the same card the saved board renders, so
               what you tick is what you get — arrangement included.

               Controlled, not persisted: the order *is* `draft.widgets`, which
               is what Save writes, so dragging here needs no storage of its own
               and a draft that is cancelled leaves no layout behind. */
            <ControlledReorderableGrid
              items={chosen.map((widget) => ({
                id: widget.id,
                span: widget.span,
                node: <BoardWidgetCard widget={widget} period={CURRENT_MONTH} />,
              }))}
              order={draft.widgets}
              onReorder={(next) =>
                setDraft((current) => ({ ...current, widgets: next }))
              }
              columns={2}
              gap={12}
            />
          ) : (
            <div className={styles.blankCanvas}>
              <Icon name="layout-grid" size={22} />
              <p className={styles.blankTitle}>Nothing chosen yet</p>
              <p className={styles.blankText}>
                Tick a widget on the left and it appears here with its real
                figures. Everything on offer comes from a module that already
                publishes it.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.formActions}>
        <Link
          href={board ? `/analytics/boards/${board.id}` : "/analytics/boards"}
          className={styles.ghostButton}
        >
          Cancel
        </Link>
        <button type="submit" className={styles.primaryButton} disabled={!named}>
          <Icon name="check" size={14} />
          {draft.widgets.length
            ? `Save board · ${draft.widgets.length} ${draft.widgets.length === 1 ? "widget" : "widgets"}`
            : "Save board"}
        </button>
      </div>
    </form>
  );
}
