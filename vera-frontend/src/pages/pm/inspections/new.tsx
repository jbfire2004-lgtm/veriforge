"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createPmInspection,
  PM_CHECKLIST_LIBRARY_GROUPS,
  type PmInspectionTemplate,
} from "@/lib/pm-inspections";
import { usePmInspectionCatalog } from "@/hooks/usePmInspectionCatalog";
import { usePmInspectionScope } from "@/hooks/usePmInspectionScope";
import { PmLoadingState, PmPageShell } from "@/src/components/pm/layout";
import { InspectionTemplatesEmpty, TemplatePickerCard } from "@/components/inspections";

const GROUP_ORDER = [
  "equipment",
  "ppe",
  "safety_devices",
  "site",
  "construction",
  "environmental",
  "emergency",
  "general",
] as const;

type LibraryGroup = (typeof GROUP_ORDER)[number];

function isLibraryGroup(value: string | null): value is LibraryGroup {
  return !!value && (GROUP_ORDER as readonly string[]).includes(value);
}

const GROUP_DESCRIPTIONS: Partial<Record<LibraryGroup, string>> = {
  equipment:
    "PME, aerial lifts, forklifts, cranes, and power tools — pre-use and daily checklists.",
  ppe: "PPE spot checks — posted requirements, issuance, condition, and task training.",
  safety_devices:
    "Guards, interlocks, E-stops, extinguishers, eyewash, alarms, and other engineered controls.",
};

export default function PmInspectionNewPage({
  projectId = 1,
  companyId = 1,
  initialTemplates = [],
  libraryError = null,
  initialGroup = null,
}: {
  projectId?: number;
  companyId?: number;
  initialTemplates?: PmInspectionTemplate[];
  libraryError?: string | null;
  initialGroup?: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupFilter = searchParams.get("group") ?? initialGroup;
  const activeGroup = isLibraryGroup(groupFilter) ? groupFilter : null;

  const { companyId: scopedCompanyId, projectId: scopedProjectId, query, session } =
    usePmInspectionScope(companyId, projectId);
  const {
    checklists,
    error,
    ready,
    authLoading,
    authenticated,
    tokenReady,
    sessionExpired,
    reload,
  } = usePmInspectionCatalog(companyId, projectId, initialTemplates, libraryError);
  const [loading, setLoading] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, PmInspectionTemplate[]>();
    for (const t of checklists) {
      const group = t.scoringRules?.libraryGroup ?? "general";
      if (activeGroup && group !== activeGroup) continue;
      const list = map.get(group) ?? [];
      list.push(t);
      map.set(group, list);
    }
    return map;
  }, [checklists, activeGroup]);

  const visibleGroups = activeGroup ? [activeGroup] : [...GROUP_ORDER];
  const filteredCount = useMemo(() => {
    let n = 0;
    for (const g of visibleGroups) n += grouped.get(g)?.length ?? 0;
    return n;
  }, [grouped, visibleGroups]);

  const title = activeGroup
    ? `Start ${PM_CHECKLIST_LIBRARY_GROUPS[activeGroup] ?? activeGroup}`
    : "Start inspection";
  const description = activeGroup
    ? (GROUP_DESCRIPTIONS[activeGroup] ??
      `Choose a published ${PM_CHECKLIST_LIBRARY_GROUPS[activeGroup] ?? activeGroup} checklist.`)
    : "Choose a published checklist from your company library — equipment, PPE, safety devices, site, construction, and more.";

  async function start(templateId: string) {
    setLoading(true);
    setStartError(null);
    try {
      const row = await createPmInspection(
        {
          templateId,
          companyId: scopedCompanyId,
          projectId: scopedProjectId,
        },
        { session },
      );
      router.push(`/pm/inspections/${row.id}${query}`);
    } catch (e) {
      setStartError(
        e instanceof Error ? e.message : "Could not start the inspection. Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <PmPageShell
      title={title}
      description={description}
      auth={{
        authLoading,
        authenticated,
        tokenReady,
        sessionExpired,
        signInMessage: "Sign in to load checklist templates.",
      }}
    >
      {error ? (
        <p className="text-sm text-amber-700" role="status">
          {error}
        </p>
      ) : null}

      {startError ? (
        <p className="text-sm text-red-600" role="alert">
          {startError}
        </p>
      ) : null}

      {ready && authenticated && filteredCount > 0 ? (
        <p className="text-sm text-[#5a6b7c]">
          {filteredCount} checklist template{filteredCount === 1 ? "" : "s"}
          {activeGroup
            ? ` in ${PM_CHECKLIST_LIBRARY_GROUPS[activeGroup] ?? activeGroup}`
            : " loaded for your company"}
          .
        </p>
      ) : null}

      {visibleGroups.map((group) => {
        const items = grouped.get(group);
        if (!items?.length) return null;
        return (
          <section key={group} className="space-y-3">
            <h2 className="text-lg font-semibold">
              {PM_CHECKLIST_LIBRARY_GROUPS[group] ?? group}
            </h2>
            <ul className="space-y-3">
              {items.map((t) => (
                <li key={t.id}>
                  <TemplatePickerCard
                    template={t}
                    busy={loading}
                    disabled={!tokenReady}
                    onStart={start}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {ready && authenticated && tokenReady && filteredCount === 0 ? (
        <InspectionTemplatesEmpty
          title={
            activeGroup
              ? `No ${PM_CHECKLIST_LIBRARY_GROUPS[activeGroup] ?? activeGroup} templates yet`
              : "No checklist templates yet"
          }
          description={
            activeGroup
              ? "Seed the default library from Vera Core, or browse all checklists."
              : "Seed the default library from Vera Core or create templates in the builder."
          }
          manageHref={`/pm/inspections/templates${query}`}
          onRetry={reload}
        >
          {activeGroup ? (
            <a
              href={`/pm/inspections/new${query}`}
              className="text-sm font-medium text-[var(--sf-primary)] underline"
            >
              Browse all checklists
            </a>
          ) : null}
        </InspectionTemplatesEmpty>
      ) : null}

      {!ready && authenticated && tokenReady && !checklists.length ? (
        <PmLoadingState message="Loading checklist library…" />
      ) : null}
    </PmPageShell>
  );
}
