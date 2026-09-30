import PmInspectionTemplatesBuilderPage from "@/src/pages/pm/inspections/templates-builder";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function PmInspectionTemplatesBuildRoute({
  searchParams,
}: {
  searchParams: Promise<{
    projectId?: string;
    companyId?: string;
    templateId?: string;
  }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <PmInspectionTemplatesBuilderPage
      projectId={parseInt(sp.projectId ?? "1", 10)}
      companyId={parseInt(sp.companyId ?? "1", 10)}
      templateId={sp.templateId}
    />
  );
}
