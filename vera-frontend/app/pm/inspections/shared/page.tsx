import PmInspectionSharedReportsPage from "@/src/screens/pm/inspections/shared";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function PmInspectionSharedReportsRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <PmInspectionSharedReportsPage
      projectId={parseInt(sp.projectId ?? "1", 10)}
      companyId={parseInt(sp.companyId ?? "1", 10)}
    />
  );
}
