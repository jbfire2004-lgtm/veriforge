import { VeraPageLayout } from "@/src/components/navigation";
import { VeriPmEmergencyHubView } from "@/components/veripm-emergency-hub/VeriPmEmergencyHubView";
import { resolveSearchParams } from "@/lib/resolve-search-params";
import { Suspense } from "react";

export const metadata = {
  title: "Emergency Response — VeriPM",
  description:
    "AI ERP generator, local EMS lookup, scenario plans, and quality scoring.",
};

export default async function PmEmergencyRoute({
  searchParams,
}: {
  searchParams: Promise<{
    siteId?: string;
    projectId?: string;
    companyId?: string;
  }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const projectId = parseInt(sp.projectId ?? "1", 10);
  const companyId = parseInt(sp.companyId ?? "1", 10);

  return (
    <VeraPageLayout>
      <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading…</p>}>
        <VeriPmEmergencyHubView projectId={projectId} companyId={companyId} />
      </Suspense>
    </VeraPageLayout>
  );
}
