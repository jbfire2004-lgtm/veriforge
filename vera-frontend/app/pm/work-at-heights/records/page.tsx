import { Suspense } from "react";
import { VeraPageLayout } from "@/src/components/navigation";
import { WahRecordsView } from "@/components/veripm-work-at-heights/WahRecordsView";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export const metadata = {
  title: "Records — Work at Heights — VeriPM",
};

export default async function WahRecordsRoute({
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
        <WahRecordsView projectId={projectId} companyId={companyId} />
      </Suspense>
    </VeraPageLayout>
  );
}
