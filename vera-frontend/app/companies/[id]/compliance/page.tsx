import { apiGetSafe } from "@/lib/api";
import { CompanyCompliancePageClient } from "@/components/companies/compliance/CompanyCompliancePageClient";
import type { CompanyDetails } from "../types";

type RouteParams = { id: string };

export default async function CompanyCompliancePage({
  params,
}: {
  params: Promise<RouteParams> | RouteParams;
}) {
  const { id } = await Promise.resolve(params);
  const companyId = Number(id);

  const res = await apiGetSafe<CompanyDetails>(`/companies/${companyId}`);
  const companyName = res.ok ? res.data.name : `Company #${companyId}`;

  return (
    <CompanyCompliancePageClient companyId={companyId} companyName={companyName} />
  );
}
