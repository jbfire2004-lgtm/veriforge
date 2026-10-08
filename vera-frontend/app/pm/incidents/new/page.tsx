import PmIncidentWizardPage from "@/src/screens/pm/incidents/wizard";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function PmIncidentNewRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <PmIncidentWizardPage
      projectId={parseInt(sp.projectId ?? "1", 10)}
      companyId={parseInt(sp.companyId ?? "1", 10)}
    />
  );
}
