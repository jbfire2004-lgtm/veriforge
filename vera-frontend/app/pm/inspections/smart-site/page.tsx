import { PmSmartSiteStartPage } from "@/src/pages/pm/inspections/smart-workspace";
import { resolveSearchParams } from "@/lib/resolve-search-params";
import { getPmInspectionRouteScope } from "@/lib/pm-inspection-route-scope";

export default async function PmSmartSiteRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const scope = await getPmInspectionRouteScope(sp);
  return (
    <PmSmartSiteStartPage
      projectId={scope.projectId}
      companyId={scope.companyId}
      initialTemplates={scope.initialTemplates}
      libraryError={scope.libraryError}
    />
  );
}
