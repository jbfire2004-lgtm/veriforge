import { VeraPageLayout } from "@/src/components/navigation";
import { VeriPmInspectionsHubView } from "@/components/veripm-inspections-hub/VeriPmInspectionsHubView";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export const metadata = {
  title: "Inspections — VeriPM",
  description:
    "Smart inspections with AI focus areas, trends, and cross-links to Action Management, meetings, and training.",
};

export default async function PmInspectionsRoute({
  searchParams,
}: {
  searchParams: Promise<{
    projectId?: string;
    companyId?: string;
    focus?: string;
  }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const projectId = parseInt(sp.projectId ?? "1", 10);
  const companyId = parseInt(sp.companyId ?? "1", 10);

  return (
    <VeraPageLayout>
      <VeriPmInspectionsHubView
        projectId={projectId}
        companyId={companyId}
        initialFocus={sp.focus}
      />
    </VeraPageLayout>
  );
}
