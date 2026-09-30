import PmPermitsPage from "@/src/pages/pm/permits/index";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function PmPermitsRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string; tab?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <PmPermitsPage
      projectId={parseInt(sp.projectId ?? "1", 10)}
      companyId={parseInt(sp.companyId ?? "1", 10)}
    />
  );
}
