import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RailShell, type SectionGroup } from "@/app/_components/app-shell";
import { ModuleScreen } from "@/app/analytics/_modules/module-screen";
import {
  MODULES,
  PERSONAS,
  allRoutes,
  modulePath,
  railGroupsFor,
  type ModuleId,
  type PersonaId,
  type TabId,
} from "@/app/analytics/_data/module-matrix";
import styles from "@/app/analytics/_modules/persona.module.css";

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
 * The persona switcher. Links rather than buttons: the persona is a path
 * segment, so it should be deep-linkable and prerendered — and this keeps the
 * control a Server Component.
 */
function PersonaSwitcher({
  active,
  module,
  tab,
}: {
  active: PersonaId;
  module: ModuleId;
  tab: TabId;
}) {
  return (
    <div>
      <div className={styles.switcherLabel}>Viewing as</div>
      <div className={styles.switcher} role="group" aria-label="Persona">
        {PERSONAS.map((persona) => {
          /* Stay on the same module when switching persona if that persona
             owns it; otherwise land on the first module that is theirs. */
          const owned = railGroupsFor(persona.id)
            .flatMap((group) => group.items)
            .some((entry) => entry.id === module);
          const target = owned
            ? modulePath(persona.id, module, tab)
            : firstBuiltPath(persona.id);

          return (
            <Link
              key={persona.id}
              href={target}
              className={styles.switcherButton}
              data-active={persona.id === active}
              aria-current={persona.id === active ? "page" : undefined}
              title={persona.blurb}
            >
              {persona.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function firstBuiltPath(persona: PersonaId): string {
  const first = railGroupsFor(persona)
    .flatMap((group) => group.items)
    .find((entry) => entry.built);
  // Every persona has at least one built module by construction of the matrix.
  return first ? modulePath(persona, first.id, first.tabs[0]) : "/analytics";
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
        <PersonaSwitcher active={personaId} module={moduleId} tab={tabId} />
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
