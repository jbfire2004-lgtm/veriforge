import { Suspense } from "react";
import { EmergencyQuickAccessView } from "@/components/veripm-emergency-hub/EmergencyQuickAccessView";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export const metadata = {
  title: "Emergency Quick Access — VeriPM",
  description:
    "Immediate actions, verified contacts, muster points, equipment, ERP procedures — offline on device.",
};

export default async function EmergencyQuickAccessRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const projectId = parseInt(sp.projectId ?? "1", 10);
  const companyId = parseInt(sp.companyId ?? "1", 10);

  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading…</p>}>
      <EmergencyQuickAccessView projectId={projectId} companyId={companyId} />
    </Suspense>
  );
}
