import PmCapaDetailPage from "@/src/pages/pm/corrective-actions/detail";
import { resolveRouteParams } from "@/lib/resolve-route-params";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function PmCapaDetailRoute({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { id } = await resolveRouteParams(params);
  const sp = await resolveSearchParams(searchParams);
  return (
    <PmCapaDetailPage
      id={id}
      projectId={parseInt(sp.projectId ?? "1", 10)}
    />
  );
}
