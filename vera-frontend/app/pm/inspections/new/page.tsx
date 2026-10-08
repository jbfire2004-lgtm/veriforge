import PmInspectionNewPage from "@/src/screens/pm/inspections/new";
import { resolveSearchParams } from "@/lib/resolve-search-params";
import { getPmInspectionRouteScope } from "@/lib/pm-inspection-route-scope";
import { Suspense } from "react";

export default async function PmInspectionNewRoute({
  searchParams,
}: {
  searchParams: Promise<{
    projectId?: string;
    companyId?: string;
    group?: string;
  }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const scope = await getPmInspectionRouteScope(sp);
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading…</p>}>
      <PmInspectionNewPage
        projectId={scope.projectId}
        companyId={scope.companyId}
        initialTemplates={scope.initialTemplates}
        libraryError={scope.libraryError}
        initialGroup={sp.group}
      />
    </Suspense>
  );
}
