import { OrientationPackageDetailView } from "@/components/orientation/OrientationPackageDetailView";

type Props = { params: Promise<{ id: string; packageId: string }> };

export default async function CompanyOrientationDetailPage({ params }: Props) {
  const { id, packageId } = await params;
  return (
    <OrientationPackageDetailView
      packageId={packageId}
      basePath={`/companies/${id}/orientation`}
      scope="COMPANY"
    />
  );
}
