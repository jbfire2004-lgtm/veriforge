import PmPermitDetailPage from "@/src/pages/pm/permits/detail";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function PmPermitDetailRoute({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const { id } = await params;
  const sp = await resolveSearchParams(searchParams);
  return (
    <PmPermitDetailPage
      id={id}
      projectId={parseInt(sp.projectId ?? "1", 10)}
      companyId={parseInt(sp.companyId ?? "1", 10)}
    />
  );
}
