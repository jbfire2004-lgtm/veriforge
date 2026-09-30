import PmEquipmentSafetyDashboardPage from "@/src/pages/pm/equipment-safety/dashboard";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function PmEquipmentSafetyRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <PmEquipmentSafetyDashboardPage
      projectId={parseInt(sp.projectId ?? "1", 10)}
      companyId={parseInt(sp.companyId ?? "1", 10)}
    />
  );
}
