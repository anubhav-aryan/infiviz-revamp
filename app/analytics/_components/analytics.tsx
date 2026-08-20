"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CsvTable } from "@/app/_export/csv";
import { useGlobalFilters } from "@/app/_filters/global-filter-context";
import { useRole } from "@/app/_identity/use-role";
import type { ActiveFilter } from "@/app/_filters/model";
import { CURRENT_MONTH, previousMonth, type MonthKey } from "@/app/_time/periods";
import { presetToMonth } from "@/app/_time/presets";
import {
  DEFAULT_DIM,
  DIM_OPTIONS,
  PRECOMPUTED,
  buildView,
  toAnalyticsFilters,
  exportFilename,
  missingCsv,
  rankedCsv,
  type DimKey,
  type Persona,
} from "../_data/analytics";
import { AnalyticsHeader } from "./analytics-header";
import { DataHealthBand } from "./data-health-band";
import { CategoryBody } from "./category-body";
import { ExecBody } from "./exec-body";
import { FieldBody } from "./field-body";
import { RegionalBody } from "./regional-body";
import { Segmented } from "./shared";

/**
 * Persona, month, dimension, compare and filters all live in the URL, so a view
 * can be linked, bookmarked and walked back through with the browser's own
 * history. Defaults are omitted from the query string, which keeps the opening
 * state a bare `/analytics`.
 */
type Scope = {
  persona: Persona;
  dim: DimKey;
  period: MonthKey;
  compare: boolean;
  filters: ActiveFilter[];
};

function isPersona(value: string | null): value is Persona {
  return (
    value === "exec" ||
    value === "regional" ||
    value === "category" ||
    value === "field"
  );
}

/** A dimension the incoming persona has no option for is not a dimension. */
function readDim(persona: Persona, raw: string | null): DimKey {
  const options: readonly string[] = DIM_OPTIONS[persona];
  return raw && options.includes(raw) ? (raw as DimKey) : DEFAULT_DIM[persona];
}

function toQuery(scope: Scope): string {
  const query = new URLSearchParams();
  if (scope.persona !== "exec") query.set("persona", scope.persona);
  if (scope.dim !== DEFAULT_DIM[scope.persona]) query.set("dim", scope.dim);
  if (scope.compare) query.set("compare", "1");
  // `month` is retired alongside `f`: the global bar's date token is the one
  // place the period is written, and this screen resolves it.
  // `f` is deliberately absent: the global filter bar owns that parameter, and
  // two writers on one param is how they end up disagreeing.
  return query.toString();
}

export function Analytics() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const rawPersona = params.get("persona");
  const urlPersona: Persona = isPersona(rawPersona) ? rawPersona : "exec";

  /* The reader's role decides which dashboard they get. Only "internal" — the
     operator view — still picks its persona from the URL.

     Until `ready`, the URL persona is what renders: the role arrives from
     localStorage one pass after hydration, and anything that diverged from the
     prerendered markup before then would be a mismatch. */
  const { role, ready } = useRole();
  const locked = ready && role !== "internal";
  const persona: Persona = locked ? role : urlPersona;
  const dim = readDim(persona, params.get("dim"));

  const compare = params.get("compare") === "1";

  /* The global bar owns `?f=` and writes it in the shared vocabulary; this
     screen translates it into its own dimension keys at the boundary. */
  const globalFilters = useGlobalFilters();
  const filters = useMemo(
    () => toAnalyticsFilters(globalFilters?.filters ?? []),
    [globalFilters?.filters],
  );

  /* The month comes from the bar's date token, resolved by the same
     `presetToMonth` the report screens use — one token, one resolver per
     screen. `?month=` is retired so there is a single writer of the date. */
  const period: MonthKey = useMemo(
    () =>
      globalFilters
        ? presetToMonth(globalFilters.date.preset, globalFilters.date.custom)
        : CURRENT_MONTH,
    [globalFilters],
  );

  // Unfiltered is the overwhelmingly common case and every month of it is
  // already built, so the first render after hydration recomputes nothing.
  const view = useMemo(
    () => (filters.length ? buildView(period, filters) : PRECOMPUTED[period]),
    [period, filters],
  );

  // The competitor breakout is a way of looking at one panel rather than a
  // scope, so it stays out of the URL alongside the rest of the state.
  const [breakout, setBreakout] = useState(false);
  const toggleBreakout = useCallback(() => setBreakout((on) => !on), []);

  const navigate = useCallback(
    (scope: Scope) => {
      const query = toQuery(scope);
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [router, pathname],
  );

  // The scope is rebuilt from the URL on every render, so memoising the
  // handlers that close over it would only ever produce a fresh closure anyway.
  const scope: Scope = { persona, dim, period, compare, filters };

  /* A shared link carrying someone else's persona is rewritten to the reader's
     own, so the URL keeps saying what is actually on screen. Only a
     *disagreeing* param is touched: a bare `/analytics` renders as the role
     without acquiring one. */
  useEffect(() => {
    if (!locked || !rawPersona || rawPersona === role) return;
    navigate({ ...scope, persona: role, dim: readDim(role, params.get("dim")) });
    // `scope` is rebuilt every render by design; the identity that matters is
    // the mismatch itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, rawPersona, role, navigate]);

  // Each persona slices by a different set of dimensions, so the picker cannot
  // carry a selection the incoming persona has no option for.
  const changePersona = (next: Persona) =>
    navigate({ ...scope, persona: next, dim: DEFAULT_DIM[next] });

  const changeDim = (next: DimKey) => navigate({ ...scope, dim: next });

  const changeCompare = (next: boolean) => navigate({ ...scope, compare: next });

  /* Saved views record a period the bar now owns, so applying one restores the
     filters and leaves the date alone rather than fighting the bar for it. */
  const applyView = () => navigate({ ...scope });

  const dimPicker = (
    <Segmented
      options={DIM_OPTIONS[persona]}
      value={dim}
      onChange={changeDim}
      label="Dimension"
    />
  );

  // The category persona draws no ranked list, so what it exports is the SKU
  // table it actually reads.
  const exportTable: CsvTable =
    persona === "category"
      ? missingCsv(view.whatsMissing)
      : rankedCsv(dim, view.ranked[dim]);

  return (
    <>
      <AnalyticsHeader
        persona={persona}
        personaLocked={locked}
        onPersonaChange={changePersona}
        period={period}
        compare={compare}
        onCompareChange={changeCompare}
        comparable={previousMonth(period) !== null}
        coverage={view.coverage}
        filters={filters}
        onApplyView={applyView}
        exportTable={exportTable}
        exportFilename={exportFilename(persona, dim, period)}
      />

      {persona === "exec" ? (
        <ExecBody view={view} dim={dim} dimPicker={dimPicker} compare={compare} />
      ) : null}
      {persona === "regional" ? (
        <RegionalBody
          view={view}
          dim={dim}
          dimPicker={dimPicker}
          compare={compare}
        />
      ) : null}
      {persona === "category" ? (
        <CategoryBody
          view={view}
          breakout={breakout}
          onToggleBreakout={toggleBreakout}
          dimPicker={dimPicker}
          compare={compare}
        />
      ) : null}
      {persona === "field" ? (
        <FieldBody view={view} dim={dim} dimPicker={dimPicker} compare={compare} />
      ) : null}

      {/* Supporting data, at the foot. The capture funnel qualifies every figure
          above it, but it is not what anyone opens the dashboard to see — it
          answers "how much data is behind this?", which is a second question. */}
      <DataHealthBand month={period} />
    </>
  );
}
