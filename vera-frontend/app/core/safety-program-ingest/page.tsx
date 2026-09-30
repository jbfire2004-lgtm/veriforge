import { canAccessCoreTools } from "@/lib/phase1-roles";
import { requireRouteAccess } from "@/lib/route-access";
import { getUserCompanyContext } from "@/lib/user-company-context";
import { VeraPageLayout } from "@/src/components/navigation";
import { SafetyProgramIngestPanel } from "@/components/safety-program-ingestion/SafetyProgramIngestPanel";

export const metadata = {
  title: "Safety Program Ingestion — Vera Core",
  description:
    "Schema-validated safety document extract with human confirm before VeriCore/VeriPM write-back.",
};

export default async function CoreSafetyProgramIngestPage() {
  const { session } = await requireRouteAccess({
    callbackUrl: "/core/safety-program-ingest",
    guard: canAccessCoreTools,
  });
  const userCompany = await getUserCompanyContext(session);
  const companyId = userCompany.companyId ?? 1;

  return (
    <VeraPageLayout>
      <SafetyProgramIngestPanel
        companyId={companyId}
        channel="core"
        title="Safety Program Ingestion"
      />
    </VeraPageLayout>
  );
}
