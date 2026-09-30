import PmInspectionDetailPage from "@/src/pages/pm/inspections/detail";
import { resolveRouteParams } from "@/lib/resolve-route-params";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function PmInspectionDetailRoute({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const { id } = await resolveRouteParams(params);
  const sp = await resolveSearchParams(searchParams);
  return (
    <PmInspectionDetailPage
      id={id}
      projectId={parseInt(sp.projectId ?? "1", 10)}
      companyId={parseInt(sp.companyId ?? "1", 10)}
    />
  );
}
