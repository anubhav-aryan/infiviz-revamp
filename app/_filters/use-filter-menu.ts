"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FilterDimension } from "./model";

/**
 * The Add-filter popover's behaviour, with no opinion about its markup.
 *
 * Store Explorer and Analytics draw their chip rows differently and from
 * different stylesheets, so sharing a component would mean threading a bag of
 * class names through it. Sharing the state machine instead is the same line
 * `nav.ts` and `thresholds.ts` already draw in this codebase.
 *
 * Destructure the result at the call site — `const { open, toggle } = …`, not
 * `menu.open`. The returned object carries `rootRef`, so the React Compiler's
 * `react-hooks/refs` rule treats every property read off it as a ref access
 * during render and errors. Both existing callers destructure for this reason.
 *
 * It is also usable as a plain popover: pass an empty catalogue and ignore the
 * `dim`/`dimension` step, which is what the date picker and saved-views menu do.
 *
 * `query`/`setQuery`/`matches` are additive — callers that never destructure
 * them are unaffected. They exist because a real client has thousands of stores
 * and hundreds of retailers, so a long dimension needs typeahead; see
 * `SEARCH_THRESHOLD` in `registry.ts` for where that line is drawn and why.
 */
export function useFilterMenu(catalogue: FilterDimension[]) {
  const [open, setOpen] = useState(false);
  const [dim, setDim] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  // Every transition between steps clears the query: a search typed against one
  // dimension's values means nothing against another's.
  const close = useCallback(() => {
    setOpen(false);
    setDim(null);
    setQuery("");
  }, []);

  const toggle = useCallback(() => {
    setOpen((wasOpen) => !wasOpen);
    setDim(null);
    setQuery("");
  }, []);

  const chooseDim = useCallback((next: string | null) => {
    setDim(next);
    setQuery("");
  }, []);

  useEffect(() => {
    if (!open) return;

    // pointerdown rather than click: a click listener fires after the button's
    // own handler has already re-opened the menu, so it never closes.
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const dimension = dim ? catalogue.find((d) => d.key === dim) ?? null : null;

  /** Case-insensitive substring match. No debounce: these are in-memory arrays,
   *  and the render is capped by the caller rather than by time. */
  const matches = useCallback(
    (label: string) => label.toLowerCase().includes(query.trim().toLowerCase()),
    [query],
  );

  return {
    open,
    toggle,
    close,
    dim,
    setDim: chooseDim,
    dimension,
    rootRef,
    query,
    setQuery,
    matches,
  };
}
