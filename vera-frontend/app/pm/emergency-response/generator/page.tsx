import { Suspense } from "react";
import { ErpGeneratorView } from "@/components/veripm-emergency-hub/ErpGeneratorView";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export const metadata = {
  title: "ERP Generator — VeriPM",
  description:
    "Generate Emergency Response Plans with project data, OHS dangerous-occurrence logic, and utility routing.",
};

export default async function ErpGeneratorRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const projectId = parseInt(sp.projectId ?? "1", 10);
  const companyId = parseInt(sp.companyId ?? "1", 10);

  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading…</p>}>
      <ErpGeneratorView projectId={projectId} companyId={companyId} />
    </Suspense>
  );
}
