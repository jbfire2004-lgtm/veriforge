import SdsLibraryPage from "@/src/pages/pm/safety-management/sds-library";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function SdsRoute({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const companyId = parseInt(sp.companyId ?? "1", 10);
  return <SdsLibraryPage companyId={companyId} />;
}
