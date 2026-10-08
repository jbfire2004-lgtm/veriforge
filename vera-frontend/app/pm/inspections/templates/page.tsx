import PmInspectionTemplatesPage from "@/src/screens/pm/inspections/templates";
import { resolveSearchParams } from "@/lib/resolve-search-params";
import { getPmInspectionRouteScope } from "@/lib/pm-inspection-route-scope";

export default async function PmInspectionTemplatesRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const scope = await getPmInspectionRouteScope(sp);
  return (
    <PmInspectionTemplatesPage
      projectId={scope.projectId}
      companyId={scope.companyId}
      initialTemplates={scope.initialTemplates}
      libraryError={scope.libraryError}
    />
  );
}
