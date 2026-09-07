"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/app/_components/icon";
import { useToast } from "@/app/_components/toast/toast-context";
import { useRole } from "@/app/_identity/use-role";
import { recordShare } from "@/app/analytics/_data/use-shared-views";
import { assignableTo, RANK_LABEL } from "@/app/tickets/_data/people";
import { describeFilter } from "./registry";
import type { ActiveFilter } from "./model";
import styles from "./global-filter-bar.module.css";

/**
 * Hands the current filters to someone else.
 *
 * **Half of this is real and half is theatre — deliberately, and it matters
 * which.** The link is real: `global-filter-context.tsx` keeps every filter in
 * `?f=` and the date in `?d=`, so the address bar already *is* the shareable
 * artefact, and `MAX_FILTERS = 12` was capped for exactly this reason. Copying
 * `window.location.href` verbatim rather than re-serializing is what makes it
 * correct everywhere: Session Viewer carries a day-grained `?period=` that
 * `serializeFilters` knows nothing about, and the live URL has it already.
 *
 * The recipient list is theatre. There is no backend, no second user and no
 * inbox, so "Share" raises a toast and files the view under the reader's own
 * Shared Analytics list — the same place a real send would land it. Nothing
 * leaves the browser.
 */
export function ShareFiltersButton({ filters }: { filters: ActiveFilter[] }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [href, setHref] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const { role } = useRole();

  /* Captured in the handler rather than during render or in an effect.
     `window.location.href` is not available to the server pass, so reading it
     while rendering would diverge from the prerendered markup — and an effect
     that set it would just be a second render for something a click already
     knows. Opening the panel is the only way to need it. */
  function toggle() {
    if (!open) setHref(window.location.href);
    setOpen(!open);
  }

  /* Same dismissal contract as the filter menus — outside click and Escape.
     `useFilterMenu` is not reused here because it also carries the two-step
     dimension/value state this panel has no use for. */
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const people = assignableTo(role);

  /* The default name describes the filters rather than being blank, so a
     reader who shares without typing still sends something legible. */
  const suggested = filters.length
    ? filters.map((filter) => describeFilter(filter).valueLabel).join(" · ")
    : "National, unfiltered";

  function copy() {
    void navigator.clipboard?.writeText(href).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  }

  function share() {
    const recipients = people.filter((p) => picked.includes(p.id)).map((p) => p.name);
    recordShare({
      name: name.trim() || suggested,
      note: "",
      query: relativeOf(href),
      chips: filters.map((filter) => {
        const { dimLabel, valueLabel: label } = describeFilter(filter);
        return { dim: dimLabel, value: label };
      }),
      recipients,
    });
    toast?.show({
      message: recipients.length
        ? `Shared with ${recipients.length} ${recipients.length === 1 ? "person" : "people"}.`
        : "Filters saved to Shared Analytics.",
      action: { label: "View", href: "/analytics/shared" },
    });
    setOpen(false);
    setPicked([]);
    setName("");
  }

  return (
    <div className={styles.popoverWrap} ref={rootRef}>
      <button
        type="button"
        className={styles.shareButton}
        onClick={toggle}
        aria-expanded={open}
      >
        <Icon name="share-2" size={13} />
        Share
      </button>

      {open ? (
        <div className={`${styles.menu} ${styles.shareMenu}`}>
          <div className={styles.menuHead}>Share these filters</div>

          <label className={styles.shareField}>
            <span className={styles.shareLabel}>Name</span>
            <input
              className={styles.shareInput}
              value={name}
              placeholder={suggested}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <div className={styles.shareField}>
            <span className={styles.shareLabel}>Link</span>
            <div className={styles.shareLinkRow}>
              <input className={styles.shareInput} value={href} readOnly />
              <button
                type="button"
                className={styles.shareCopy}
                onClick={copy}
                aria-label="Copy link"
              >
                <Icon name={copied ? "check" : "copy"} size={13} />
              </button>
            </div>
            <p className={styles.shareHint}>
              {copied ? "Link copied." : "Opens with these filters already applied."}
            </p>
          </div>

          <div className={styles.shareField}>
            <span className={styles.shareLabel}>Send to</span>
            <div className={styles.shareScroll}>
              {people.map((person) => {
                const on = picked.includes(person.id);
                return (
                  <button
                    key={person.id}
                    type="button"
                    className={styles.menuItem}
                    role="checkbox"
                    aria-checked={on}
                    onClick={() =>
                      setPicked((current) =>
                        on
                          ? current.filter((id) => id !== person.id)
                          : [...current, person.id],
                      )
                    }
                  >
                    <span className={styles.checkbox} data-on={on} aria-hidden="true">
                      {on ? <Icon name="check" size={11} /> : null}
                    </span>
                    <span className={styles.menuItemLabel}>{person.name}</span>
                    <span className={styles.menuCount}>{RANK_LABEL[person.rank]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button type="button" className={styles.applyButton} onClick={share}>
            {picked.length ? `Share with ${picked.length}` : "Save to Shared Analytics"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Absolute URL → path plus query, which is what a `<Link>` wants. */
function relativeOf(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return "/analytics";
  }
}
