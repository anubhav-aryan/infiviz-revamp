import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Icon } from "@/app/_components/icon";
import { RailGroups, RailShell, type SectionGroup } from "@/app/_components/app-shell";
import { RolePicker } from "@/app/_identity/role-picker";
import { ModuleScreen } from "@/app/analytics/_modules/module-screen";
import {
  AnalyticsRailItems,
  PersonaSwitcher,
  PersonaSwitcherView,
  ScopePicker,
} from "@/app/analytics/_modules/rail-controls";
import styles from "@/app/analytics/_modules/persona.module.css";
import {
  MODULES,
  PERSONAS,
  allRoutes,
  modulePath,
  overviewPath,
  railGroupsFor,
  type ModuleId,
  type PersonaId,
  type TabId,
} from "@/app/analytics/_data/module-matrix";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Shelf, availability, revenue and field analytics by role.",
};

/**
 * One prerendered page per persona × module × tab, enumerated from
 * `MODULE_MATRIX`. `dynamicParams = false` means a combination the matrix does
 * not describe 404s rather than rendering a module that persona has no business
 * seeing.
 */
export function generateStaticParams() {
  return allRoutes();
}

export const dynamicParams = false;

/**
 * Where each persona's switcher button goes.
 *
 * Computed here, on the server, because it is a fact about the matrix rather
 * than about the current URL — which keeps the client component that renders
 * the buttons free of routing logic and takes only plain data across the
 * boundary. Switching persona stays on the current module when the target
 * persona owns it, and otherwise lands on the module they open on.
 */
/* Every persona sees every module now, so switching keeps your place instead of
   bouncing you to the next persona's landing screen — what changes is the scope
   the numbers are read at, which is the point of the switch. */
function switcherTargets(module: ModuleId, tab: TabId) {
  return PERSONAS.map((persona) => ({
    id: persona.id,
    label: persona.label,
    blurb: persona.blurb,
    href: modulePath(persona.id, module, tab),
  }));
}

export default async function AnalyticsModulePage(
  props: PageProps<"/analytics/[persona]/[module]/[tab]">,
) {
  const { persona, module: moduleParam, tab } = await props.params;
  const personaId = persona as PersonaId;
  const moduleId = moduleParam as ModuleId;
  const tabId = tab as TabId;

  /* Labelled again. Unlabelled clusters read as arbitrary spacing once you are
     three levels in, and a reader who could not name the section they were in
     could not find their way back out of it — which is what the demo surfaced.
     The per-module blurbs stay gone; at 210px those were explanation rather
     than navigation. */
  const groups: SectionGroup[] = railGroupsFor(personaId).map((group) => ({
    label: group.label,
    items: group.items.map((entry) => ({
      id: entry.id,
      label: entry.label,
      icon: entry.icon,
      /* Unbuilt modules render inert, the treatment Master Data already gives
         its undesigned sub-surfaces — shown, so the rail is an honest map. */
      href: entry.built ? modulePath(personaId, entry.id, entry.tabs[0]) : undefined,
    })),
  }));

  return (
    <>
    <RailShell
      filterScope="analytics"
      active="analytics"
      railLabel="Analytics modules"
      groups={groups}
      activeSection={moduleId}
      railHeader={
        <>
          {/* The module rail has no other way back to the curated overview —
              the product rail's mark goes to "/", not "/analytics". Plain link,
              no query dependency, so it renders outside the Suspense boundary
              below rather than waiting on the client. */}
          <Link href={overviewPath(personaId)} className={styles.backLink}>
            <Icon name="arrow-left" size={14} />
            Back to overview
          </Link>

          {/* The fallback is the switcher with plain hrefs and the scope picker
              absent, which is exactly what the prerendered HTML should contain —
              neither can be resolved without the query string. */}
          <Suspense
            fallback={
              <PersonaSwitcherView
                active={personaId}
                targets={switcherTargets(moduleId, tabId)}
              />
            }
          >
            <PersonaSwitcher
              active={personaId}
              targets={switcherTargets(moduleId, tabId)}
            />
            <ScopePicker persona={personaId} />
          </Suspense>
        </>
      }
      railItems={
        <Suspense
          fallback={<RailGroups groups={groups} activeSection={moduleId} />}
        >
          <AnalyticsRailItems groups={groups} activeSection={moduleId} />
        </Suspense>
      }
    >
      {/* Month and measure round-trip through the query string, and
          `useSearchParams` needs a boundary to suspend on. The shell and rail
          around this still prerender. */}
      <Suspense fallback={null}>
        <ModuleScreen persona={personaId} module={moduleId} tab={tabId} />
      </Suspense>
    </RailShell>
    {/* Sibling of the shell, as on the overview: a role that does not own this
        route redirects itself from inside `ModuleScreen`. */}
    <RolePicker />
    </>
  );
}

/* Referenced so the module registry stays in this file's dependency graph and
   an unknown module id is a build error rather than a blank rail. */
void MODULES;
