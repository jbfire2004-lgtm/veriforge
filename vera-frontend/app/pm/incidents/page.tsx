import { VeraPageLayout } from "@/src/components/navigation";
import { VeriPmIncidentApplicationView } from "@/components/veripm-incidents-hub/VeriPmIncidentApplicationView";
import { VeriPmIncidentsHubView } from "@/components/veripm-incidents-hub/VeriPmIncidentsHubView";
import { resolveSearchParams } from "@/lib/resolve-search-params";
import { Suspense } from "react";

export const metadata = {
  title: "Incidents — VeriPM",
  description:
    "Enterprise incident investigation: information, evidence, multi-method root cause, linked corrective actions, and final review.",
};

export default async function PmIncidentsRoute({
  searchParams,
}: {
  searchParams: Promise<{
    projectId?: string;
    companyId?: string;
    tab?: string;
    hub?: string;
  }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const projectId = parseInt(sp.projectId ?? "1", 10);
  const companyId = parseInt(sp.companyId ?? "1", 10);
  const legacyHub = sp.hub === "legacy";

  return (
    <VeraPageLayout>
      <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading…</p>}>
        {legacyHub ? (
          <VeriPmIncidentsHubView
            projectId={projectId}
            companyId={companyId}
            initialTab={sp.tab}
          />
        ) : (
          <VeriPmIncidentApplicationView
            projectId={projectId}
            companyId={companyId}
            initialTab={sp.tab}
          />
        )}
      </Suspense>
    </VeraPageLayout>
  );
}
