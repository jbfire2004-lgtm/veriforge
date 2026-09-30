import { VeraPageLayout } from "@/src/components/navigation";
import { OrientationDashboard } from "@/components/orientation/veriforge";

type Props = { params: Promise<{ id: string }> };

export default async function CompanyOrientationsPage({ params }: Props) {
  const { id } = await params;
  const companyId = parseInt(id, 10);

  return (
    <VeraPageLayout
      title="Orientations"
      description="VeriForge orientation definitions for this company"
    >
      <OrientationDashboard
        companyId={companyId}
        basePath={`/companies/${companyId}/orientations`}
        requirementsPath={`/companies/${companyId}/orientation-requirements`}
      />
    </VeraPageLayout>
  );
}
