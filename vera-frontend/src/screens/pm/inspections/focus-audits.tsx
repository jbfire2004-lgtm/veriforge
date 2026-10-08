"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createPmInspection, type PmInspectionTemplate } from "@/lib/pm-inspections";
import { usePmInspectionCatalog } from "@/hooks/usePmInspectionCatalog";
import { usePmInspectionScope } from "@/hooks/usePmInspectionScope";
import { PmLoadingState, PmPageShell } from "@/src/components/pm/layout";
import { InspectionTemplatesEmpty, TemplatePickerCard } from "@/components/inspections";

const INDUSTRY_ORDER = [
  "construction",
  "mining",
  "manufacturing",
  "oil_gas",
  "nuclear",
  "power_generation",
  "wind",
  "utilities",
  "forestry",
  "general",
] as const;

const INDUSTRY_LABELS: Record<string, string> = {
  construction: "Construction",
  mining: "Mining",
  manufacturing: "Manufacturing",
  oil_gas: "Oil & Gas",
  nuclear: "Nuclear",
  power_generation: "Power Generation",
  wind: "Wind Energy",
  utilities: "Utilities",
  forestry: "Forestry",
  general: "General / All industries",
};

export default function PmFocusAuditsPage({
  projectId = 1,
  companyId = 1,
  initialTemplates = [],
  libraryError = null,
}: {
  projectId?: number;
  companyId?: number;
  initialTemplates?: PmInspectionTemplate[];
  libraryError?: string | null;
}) {
  const router = useRouter();
  const { companyId: scopedCompanyId, projectId: scopedProjectId, query, session } =
    usePmInspectionScope(companyId, projectId);
  const {
    focusAudits,
    error,
    ready,
    authLoading,
    authenticated,
    tokenReady,
    sessionExpired,
    reload,
  } = usePmInspectionCatalog(companyId, projectId, initialTemplates, libraryError);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, PmInspectionTemplate[]>();
    for (const t of focusAudits) {
      const industry = t.scoringRules?.industry ?? "general";
      const list = map.get(industry) ?? [];
      list.push(t);
      map.set(industry, list);
    }
    return map;
  }, [focusAudits]);

  async function start(templateId: string) {
    setBusyId(templateId);
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
      router.push(`/pm/inspections/${row.id}/smart-workspace${query}`);
    } catch (e) {
      setStartError(
        e instanceof Error ? e.message : "Could not start the audit. Please try again.",
      );
      setBusyId(null);
    }
  }

  return (
    <PmPageShell
      title="Focus Audits"
      description="Targeted, photo-assisted audits for construction, mining, manufacturing, and other industries — same smart technology as Smart Site Inspection."
      auth={{
        authLoading,
        authenticated,
        tokenReady,
        sessionExpired,
        signInMessage: "Sign in to load focus audit templates.",
      }}
    >
      {ready && authenticated && focusAudits.length > 0 ? (
        <p className="text-sm text-[#5a6b7c]">
          {focusAudits.length} focus audit templates loaded for your company.
        </p>
      ) : null}

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

      {INDUSTRY_ORDER.map((industry) => {
        const items = grouped.get(industry);
        if (!items?.length) return null;
        return (
          <section key={industry} className="space-y-3">
            <h2 className="text-lg font-semibold">
              {INDUSTRY_LABELS[industry] ?? industry}
            </h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {items.map((t) => (
                <li key={t.id}>
                  <TemplatePickerCard
                    template={t}
                    busy={busyId === t.id}
                    disabled={!tokenReady}
                    actionLabel="Start audit"
                    subtitle={`${(t.items ?? []).length} checklist items · AI photo capture`}
                    onStart={start}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {ready && authenticated && tokenReady && !focusAudits.length ? (
        <InspectionTemplatesEmpty
          title="No focus audit templates yet"
          description="Your company library has not been seeded with industry focus audits. Reload to pull templates from Vera Core, or manage templates manually."
          manageHref={`/pm/inspections/templates${query}`}
          onRetry={reload}
        />
      ) : null}

      {!ready && authenticated && tokenReady && !focusAudits.length ? (
        <PmLoadingState message="Loading focus audit library…" />
      ) : null}
    </PmPageShell>
  );
}
