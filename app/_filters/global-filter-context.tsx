"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEFAULT_DATE,
  isDefaultDate,
  parseDate,
  serializeDate,
  type DateToken,
} from "./date-token";
import {
  filterKey,
  parseFilters,
  serializeFilters,
  type ActiveFilter,
  type FilterDimension,
} from "./model";
import { catalogueFor, type DimId } from "./registry";

/**
 * The global filter state: one filter set and one date, shared by every
 * session-scoped screen.
 *
 * **The URL is the source of truth.** Analytics already worked this way; Store
 * Explorer seeded `useState` from `?f=` once and wrote the URL downstream,
 * which is exactly why its filters did not survive navigation. One direction,
 * everywhere: read from `useSearchParams`, write with `router.replace`.
 *
 * **Carrying across screens.** The URL alone is not enough, because a plain
 * `<Link>` to another screen drops the query. Rather than teach every link in
 * the app about filters, the last applied set is mirrored into `sessionStorage`
 * and replayed on arrival when the URL carries none. The store is read through
 * `useSyncExternalStore` with an empty server snapshot, so the first client
 * paint still matches the prerendered HTML — the same shape `use-saved-views.ts`
 * uses and for the same reason.
 */

export type GlobalFilterApi = {
  filters: ActiveFilter[];
  date: DateToken;
  /** The dimensions this screen offers, already canonical. */
  catalogue: FilterDimension[];
  add: (filter: ActiveFilter) => void;
  remove: (filter: ActiveFilter) => void;
  /**
   * Replaces the whole set in one write. `add`/`remove` each call `write`,
   * which closes over the current `params`, so a loop of them in one tick keeps
   * only the last — any caller changing more than one filter at a time (a
   * multi-select, a saved view, Analytics' scope picker swapping region for
   * category) has to come through here.
   */
  setFilters: (filters: ActiveFilter[]) => void;
  clear: () => void;
  setDate: (token: DateToken) => void;
  /** True where the date lives in the path, so the bar links instead of writing `?d=`. */
  dateInPath: boolean;
};

const GlobalFilterContext = createContext<GlobalFilterApi | null>(null);

export const FILTER_PARAM = "f";
export const DATE_PARAM = "d";

/** A URL with every filter in it is not a URL anyone can share. */
const MAX_FILTERS = 12;

/* ---------- sticky store ---------- */

const STICKY_KEY = "infiviz:global-filters";

type Sticky = { f: string; d: string };
const EMPTY_STICKY: Sticky = { f: "", d: "" };

let cache: Sticky | null = null;
const listeners = new Set<() => void>();

function readSticky(): Sticky {
  if (cache) return cache;
  try {
    const raw = window.sessionStorage.getItem(STICKY_KEY);
    const parsed = raw ? (JSON.parse(raw) as Sticky) : null;
    cache =
      parsed && typeof parsed.f === "string" && typeof parsed.d === "string"
        ? parsed
        : EMPTY_STICKY;
  } catch {
    // Private mode / corrupt value. Degrade to "nothing remembered".
    cache = EMPTY_STICKY;
  }
  return cache;
}

function writeSticky(next: Sticky): void {
  cache = next;
  try {
    window.sessionStorage.setItem(STICKY_KEY, JSON.stringify(next));
  } catch {
    // In-memory value still serves this session.
  }
  listeners.forEach((notify) => notify());
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

const serverSticky = () => EMPTY_STICKY;

/* ---------- provider ---------- */

export function GlobalFilterProvider({
  dims,
  extraDims,
  dateInPath = false,
  seed,
  children,
}: {
  /** Which canonical dimensions this screen offers. */
  dims: readonly DimId[];
  /** Screen-local dimensions no other screen can answer for (Analytics' Brand…). */
  extraDims?: FilterDimension[];
  dateInPath?: boolean;
  /** Applied on first arrival when neither the URL nor the session holds a
   *  selection — see `SCOPE_SEEDS`. */
  seed?: ActiveFilter[];
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const catalogue = useMemo(
    () => catalogueFor(dims, extraDims ?? []),
    [dims, extraDims],
  );

  const rawFilters = params.get(FILTER_PARAM) ?? "";
  const rawDate = params.get(DATE_PARAM) ?? "";

  const filters = useMemo(
    () => parseFilters(rawFilters, catalogue),
    [rawFilters, catalogue],
  );
  const date = useMemo(() => parseDate(rawDate), [rawDate]);

  const sticky = useSyncExternalStore(subscribe, readSticky, serverSticky);

  const write = useCallback(
    (nextFilters: ActiveFilter[], nextDate: DateToken) => {
      const next = new URLSearchParams(params.toString());

      const f = serializeFilters(nextFilters);
      if (f) next.set(FILTER_PARAM, f);
      else next.delete(FILTER_PARAM);

      // The date lives in the path on the month-routed screens; writing `?d=`
      // there would be a second, disagreeing source of truth.
      if (!dateInPath && !isDefaultDate(nextDate)) {
        next.set(DATE_PARAM, serializeDate(nextDate));
      } else {
        next.delete(DATE_PARAM);
      }

      writeSticky({ f, d: dateInPath ? sticky.d : serializeDate(nextDate) });

      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router, dateInPath, sticky.d],
  );

  /**
   * Replay on arrival: this screen has no filters in its URL but the session
   * remembers some, so put them back. Runs after hydration only — the server
   * snapshot is empty, so the prerendered HTML is never affected.
   */
  useEffect(() => {
    if (rawFilters || rawDate) return;

    /* Nothing in the URL and nothing remembered: open on the scope's own
       default rather than unfiltered. Written through the same `replace` as a
       replay, so the seed is visible in the URL and can be cleared like any
       other filter. */
    if (!sticky.f && !sticky.d) {
      if (!seed?.length) return;
      const seeded = serializeFilters(parseFilters(serializeFilters(seed), catalogue));
      if (!seeded) return;
      const withSeed = new URLSearchParams(params.toString());
      withSeed.set(FILTER_PARAM, seeded);
      router.replace(`${pathname}?${withSeed.toString()}`, { scroll: false });
      return;
    }

    const next = new URLSearchParams(params.toString());
    // Re-parsed against *this* screen's catalogue, so a dimension it cannot
    // answer for is dropped here rather than silently ignored later.
    const replayed = serializeFilters(parseFilters(sticky.f, catalogue));
    if (replayed) next.set(FILTER_PARAM, replayed);
    if (!dateInPath && sticky.d && sticky.d !== DEFAULT_DATE.preset) {
      next.set(DATE_PARAM, sticky.d);
    }

    const query = next.toString();
    if (query === params.toString()) return;
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [rawFilters, rawDate, sticky, params, pathname, router, catalogue, dateInPath, seed]);

  const add = useCallback(
    (filter: ActiveFilter) => {
      if (filters.some((f) => filterKey(f) === filterKey(filter))) return;
      if (filters.length >= MAX_FILTERS) return;
      write([...filters, filter], date);
    },
    [filters, date, write],
  );

  const remove = useCallback(
    (filter: ActiveFilter) => {
      write(
        filters.filter((f) => filterKey(f) !== filterKey(filter)),
        date,
      );
    },
    [filters, date, write],
  );

  const setFilters = useCallback(
    (next: ActiveFilter[]) => write(next.slice(0, MAX_FILTERS), date),
    [date, write],
  );

  const clear = useCallback(() => write([], DEFAULT_DATE), [write]);

  const setDate = useCallback(
    (token: DateToken) => write(filters, token),
    [filters, write],
  );

  const value = useMemo(
    () => ({
      filters,
      date,
      catalogue,
      add,
      remove,
      setFilters,
      clear,
      setDate,
      dateInPath,
    }),
    [filters, date, catalogue, add, remove, setFilters, clear, setDate, dateInPath],
  );

  return (
    <GlobalFilterContext.Provider value={value}>{children}</GlobalFilterContext.Provider>
  );
}

/**
 * `null` outside a provider rather than throwing, matching `useChatPane()`.
 * Catalog, Master data, Tickets, `/login` and `/reference` have no filter bar,
 * and a shared component that offers to filter should render nothing there
 * rather than crash a page that was never meant to have one.
 */
export function useGlobalFilters(): GlobalFilterApi | null {
  return useContext(GlobalFilterContext);
}
