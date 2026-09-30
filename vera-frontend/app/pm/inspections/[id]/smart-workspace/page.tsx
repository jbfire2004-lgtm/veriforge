import PmSmartSiteWorkspacePage from "@/src/pages/pm/inspections/smart-workspace";
import { resolveSearchParams } from "@/lib/resolve-search-params";
import { getPmInspectionRouteScope } from "@/lib/pm-inspection-route-scope";

export default async function PmSmartWorkspaceRoute({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const { id } = await params;
  const sp = await resolveSearchParams(searchParams);
  const { companyId, projectId } = await getPmInspectionRouteScope(sp);
  return (
    <PmSmartSiteWorkspacePage
      id={id}
      projectId={projectId}
      companyId={companyId}
    />
  );
}
