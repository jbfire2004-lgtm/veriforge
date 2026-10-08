import { Suspense } from "react";
import { VeraPageLayout } from "@/src/components/navigation";
import PmIncidentDetailPage from "@/src/screens/pm/incidents/detail";
import { resolveRouteParams } from "@/lib/resolve-route-params";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function PmIncidentDetailRoute({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const { id } = await resolveRouteParams(params);
  const sp = await resolveSearchParams(searchParams);
  return (
    <VeraPageLayout>
      <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading investigation…</p>}>
        <PmIncidentDetailPage
          id={id}
          projectId={parseInt(sp.projectId ?? "1", 10)}
          companyId={parseInt(sp.companyId ?? "1", 10)}
        />
      </Suspense>
    </VeraPageLayout>
  );
}
