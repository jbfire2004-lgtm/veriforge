import PmPermitNewPage from "@/src/pages/pm/permits/new";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function PmPermitNewRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string; type?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <PmPermitNewPage
      projectId={parseInt(sp.projectId ?? "1", 10)}
      companyId={parseInt(sp.companyId ?? "1", 10)}
    />
  );
}
