import { VeraPageLayout } from "@/src/components/navigation";
import { OrientationRequirementManager } from "@/components/orientation/veriforge";

type Props = { params: Promise<{ id: string }> };

export default async function CompanyOrientationRequirementsPage({
  params,
}: Props) {
  const { id } = await params;
  const companyId = parseInt(id, 10);

  return (
    <VeraPageLayout
      title="Orientation requirements"
      description="Scope which orientations workers must complete"
    >
      <OrientationRequirementManager companyId={companyId} />
    </VeraPageLayout>
  );
}
