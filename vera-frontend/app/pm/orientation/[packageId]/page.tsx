import { OrientationPackageDetailView } from "@/components/orientation/OrientationPackageDetailView";

type Props = { params: Promise<{ packageId: string }> };

export default async function PmOrientationDetailPage({ params }: Props) {
  const { packageId } = await params;
  return (
    <OrientationPackageDetailView
      packageId={packageId}
      basePath="/pm/orientation"
      scope="PROJECT"
    />
  );
}
