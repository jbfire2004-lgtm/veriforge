import PmCompanySafetyContextDashboard from "@/src/pages/pm/company-safety-context/dashboard";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function PmCompanySafetyContextRoute({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <PmCompanySafetyContextDashboard
      companyId={parseInt(sp.companyId ?? "1", 10)}
    />
  );
}
