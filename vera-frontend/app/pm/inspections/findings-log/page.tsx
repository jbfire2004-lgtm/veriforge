import PmInspectionFindingsLogPage from "@/src/screens/pm/inspections/findings-log";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function PmInspectionFindingsLogRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <PmInspectionFindingsLogPage
      projectId={parseInt(sp.projectId ?? "1", 10)}
      companyId={parseInt(sp.companyId ?? "1", 10)}
    />
  );
}
