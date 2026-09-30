import { Suspense } from "react";
import { VeraPageLayout } from "@/src/components/navigation";
import { VeriPmWorkAtHeightsHubView } from "@/components/veripm-work-at-heights/VeriPmWorkAtHeightsHubView";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export const metadata = {
  title: "Work at Heights — VeriPM",
  description:
    "Clearance worksheets, manufacturer specs, industry playbooks, and fall-protection controls.",
};

export default async function PmWorkAtHeightsRoute({
  searchParams,
}: {
  searchParams: Promise<{
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
        <VeriPmWorkAtHeightsHubView projectId={projectId} companyId={companyId} />
      </Suspense>
    </VeraPageLayout>
  );
}
