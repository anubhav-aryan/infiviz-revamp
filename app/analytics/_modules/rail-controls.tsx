"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { RailGroups, type SectionGroup } from "@/app/_components/app-shell";
import { useGlobalFilters } from "@/app/_filters/global-filter-context";
import {
  PERSONA_SCOPES,
  SCOPES,
  filtersWithScope,
  scopeForFilters,
  scopeOptionLabel,
  type ScopeId,
} from "../_data/scope";
import type { PersonaId } from "../_data/module-matrix";
import styles from "./persona.module.css";

/**
 * The three rail controls that have to know the current query string.
 *
 * Path carries identity — persona, module, tab. Query carries how you are
 * looking at it — scope, month, measure. Rail links are rendered on the server,
 * which knows the path but not the query, so a server-rendered rail silently
 * drops your region the moment you open another module. These three components
 * are the fix, and they are the only client code in the rail.
 *
 * Each is wrapped in a Suspense boundary whose fallback renders the same markup
 * without the query, so the prerendered HTML is what these hydrate over and
 * nothing moves on the page.
 */

/** Query keys that survive navigation inside a persona's rail. */
/* `f` and `d` ride along so rail navigation does not silently drop the global
   filter set — the bar writes them, every in-section link must preserve them.
   `scope` and `month` used to be here too; both are now expressed as `f`/`d`,
   so carrying them would be carrying the same statement twice. */
const KEPT = ["measure", "f", "d"] as const;

function withQuery(href: string, params: URLSearchParams, keys: readonly string[]) {
  const next = new URLSearchParams();
  for (const key of keys) {
    const value = params.get(key);
    if (value) next.set(key, value);
  }
  const query = next.toString();
  return query ? `${href}?${query}` : href;
}

export function AnalyticsRailItems({
  groups,
  activeSection,
}: {
  groups: SectionGroup[];
  activeSection: string;
}) {
  const params = useSearchParams();

  const carried: SectionGroup[] = groups.map((group) => ({
    label: group.label,
    items: group.items.map((item) => ({
      ...item,
      href: item.href ? withQuery(item.href, params, KEPT) : undefined,
    })),
  }));

  return <RailGroups groups={carried} activeSection={activeSection} />;
}

export type PersonaTarget = {
  id: PersonaId;
  label: string;
  blurb: string;
  href: string;
};

/**
 * The switcher's markup, with whatever hrefs it is handed.
 *
 * Hook-free, so it is what the Suspense fallback renders — a fallback that
 * called `useSearchParams` would suspend too, and the page could not prerender
 * at all.
 */
export function PersonaSwitcherView({
  active,
  targets,
}: {
  active: PersonaId;
  targets: PersonaTarget[];
}) {
  return (
    <div>
      <div className={styles.switcherLabel}>Viewing as</div>
      <div className={styles.switcher} role="group" aria-label="Persona">
        {targets.map((persona) => (
          <Link
            key={persona.id}
            href={persona.href}
            className={styles.switcherButton}
            data-active={persona.id === active}
            aria-current={persona.id === active ? "page" : undefined}
            title={persona.blurb}
          >
            {persona.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * The persona switcher, carrying the view state across.
 *
 * Month and measure travel; **scope does not**. The four personas have
 * different vocabularies — a region means nothing to a category lead — so
 * switching resets to the new persona's default. `scopeFor` validates anyway,
 * which makes a stale or hand-edited link resolve rather than break, but
 * dropping it here means the URL never claims a scope the rail cannot show.
 */
export function PersonaSwitcher({
  active,
  targets,
}: {
  active: PersonaId;
  targets: PersonaTarget[];
}) {
  const params = useSearchParams();

  return (
    <PersonaSwitcherView
      active={active}
      targets={targets.map((persona) => ({
        ...persona,
        /* The button for the persona you are already on keeps the scope —
           clicking it is not a switch, and dropping it there would quietly
           reset your region. */
        href: withQuery(
          persona.href,
          params,
          persona.id === active ? KEPT : ["month", "measure"],
        ),
      }))}
    />
  );
}

/**
 * What this persona is looking at.
 *
 * A native select rather than the `Segmented` control the rest of the app uses:
 * six region names do not fit across a 210px rail, and a scope is a choice from
 * a list rather than a two- or three-way toggle. The executive has no picker —
 * their scope is the country — so they get the caption alone, which keeps the
 * rail's shape the same for every persona.
 */
export function ScopePicker({ persona }: { persona: PersonaId }) {
  const api = useGlobalFilters();

  const config = PERSONA_SCOPES[persona];
  /* The bar is the writer: a scope *is* a Region or Category filter, and this
     picker is the rail's view of one. Outside a provider there is nothing to
     read, so it falls back to the persona's default. */
  const scope = scopeForFilters(persona, api?.filters ?? []);

  const onChange = useCallback(
    (value: string) => {
      api?.setFilters(filtersWithScope(api.filters, value as ScopeId));
    },
    [api],
  );

  if (config.picker === "none") {
    return (
      <div className={styles.scopeBlock}>
        <div className={styles.switcherLabel}>{config.label}</div>
        <div className={styles.scopeStatic}>{scope.caption}</div>
      </div>
    );
  }

  return (
    <div className={styles.scopeBlock}>
      <label className={styles.switcherLabel} htmlFor="analytics-scope">
        {config.label}
      </label>
      <select
        id="analytics-scope"
        className={styles.scopeSelect}
        value={scope.id}
        onChange={(event) => onChange(event.target.value)}
      >
        {config.options.map((id: ScopeId) => (
          <option key={id} value={id}>
            {scopeOptionLabel(config.picker, SCOPES[id])}
          </option>
        ))}
      </select>
      <div className={styles.scopeCaption}>{scope.caption}</div>
    </div>
  );
}
