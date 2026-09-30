import PmFocusAuditsPage from "@/src/pages/pm/inspections/focus-audits";
import { resolveSearchParams } from "@/lib/resolve-search-params";
import { getPmInspectionRouteScope } from "@/lib/pm-inspection-route-scope";

export default async function PmFocusAuditsRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const scope = await getPmInspectionRouteScope(sp);
  return (
    <PmFocusAuditsPage
      projectId={scope.projectId}
      companyId={scope.companyId}
      initialTemplates={scope.initialTemplates}
      libraryError={scope.libraryError}
    />
  );
}
