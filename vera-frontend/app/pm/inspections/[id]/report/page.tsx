import PmInspectionReportPage from "@/src/pages/pm/inspections/report";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function PmInspectionReportRoute({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const { id } = await params;
  const sp = await resolveSearchParams(searchParams);
  return (
    <PmInspectionReportPage
      id={id}
      projectId={parseInt(sp.projectId ?? "1", 10)}
      companyId={parseInt(sp.companyId ?? "1", 10)}
    />
  );
}
