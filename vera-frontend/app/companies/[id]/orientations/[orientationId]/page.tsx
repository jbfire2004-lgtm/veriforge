import { VeraPageLayout } from "@/src/components/navigation";
import { OrientationEditor } from "@/components/orientation/veriforge";

type Props = {
  params: Promise<{ id: string; orientationId: string }>;
};

export default async function CompanyOrientationEditPage({ params }: Props) {
  const { id, orientationId } = await params;
  const companyId = parseInt(id, 10);

  return (
    <VeraPageLayout title="Edit orientation">
      <OrientationEditor
        companyId={companyId}
        orientationId={orientationId}
        mode="native"
        basePath={`/companies/${companyId}/orientations`}
      />
    </VeraPageLayout>
  );
}
