import { VeraPageLayout } from "@/src/components/navigation";
import { VeriPmJhaFlhaHubView } from "@/components/veripm-jha-flha-hub/VeriPmJhaFlhaHubView";
import { resolveSearchParams } from "@/lib/resolve-search-params";
import { Suspense } from "react";

export const metadata = {
  title: "JHA / FLHA — VeriPM",
  description:
    "FLHA Energy Wheel, AI hazard prediction, JHA industry templates, and smart builder.",
};

export default async function JhaFlhaListRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const projectId = parseInt(sp.projectId ?? "1", 10);
  const companyId = parseInt(sp.companyId ?? "1", 10);

  return (
    <VeraPageLayout>
      <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading…</p>}>
        <VeriPmJhaFlhaHubView projectId={projectId} companyId={companyId} />
      </Suspense>
    </VeraPageLayout>
  );
}
