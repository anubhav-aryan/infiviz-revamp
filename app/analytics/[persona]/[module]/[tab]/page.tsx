import type { Metadata } from "next";
import { Suspense } from "react";
import { RailGroups, RailShell, type SectionGroup } from "@/app/_components/app-shell";
import { ModuleScreen } from "@/app/analytics/_modules/module-screen";
import {
  AnalyticsRailItems,
  PersonaSwitcher,
  PersonaSwitcherView,
  ScopePicker,
} from "@/app/analytics/_modules/rail-controls";
import {
  MODULES,
  PERSONAS,
  allRoutes,
  landingModule,
  modulePath,
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
function switcherTargets(module: ModuleId, tab: TabId) {
  return PERSONAS.map((persona) => {
    const owned = railGroupsFor(persona.id)
      .flatMap((group) => group.items)
      .some((entry) => entry.id === module);
    const landing = landingModule(persona.id);
    return {
      id: persona.id,
      label: persona.label,
      blurb: persona.blurb,
      href: owned
        ? modulePath(persona.id, module, tab)
        : modulePath(persona.id, landing.id, landing.tabs[0]),
    };
  });
}

export default async function AnalyticsModulePage(
  props: PageProps<"/analytics/[persona]/[module]/[tab]">,
) {
  const { persona, module: moduleParam, tab } = await props.params;
  const personaId = persona as PersonaId;
  const moduleId = moduleParam as ModuleId;
  const tabId = tab as TabId;

  const groups: SectionGroup[] = railGroupsFor(personaId).map((group) => ({
    label: group.label,
    items: group.items.map((entry) => ({
      id: entry.id,
      label: entry.label,
      icon: entry.icon,
      sub: entry.blurb,
      /* Unbuilt modules render inert, the treatment Master Data already gives
         its undesigned sub-surfaces — shown, so the rail is an honest map. */
      href: entry.built ? modulePath(personaId, entry.id, entry.tabs[0]) : undefined,
    })),
  }));

  return (
    <RailShell
      active="analytics"
      section={{
        title: "Analytics",
        caption: PERSONAS.find((entry) => entry.id === personaId)?.blurb ?? "",
      }}
      groups={groups}
      activeSection={moduleId}
      railHeader={
        /* The fallback is the switcher with plain hrefs and the scope picker
           absent, which is exactly what the prerendered HTML should contain —
           neither can be resolved without the query string. */
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
  );
}

/* Referenced so the module registry stays in this file's dependency graph and
   an unknown module id is a build error rather than a blank rail. */
void MODULES;
