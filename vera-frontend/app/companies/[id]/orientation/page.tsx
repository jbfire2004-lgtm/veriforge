import { OrientationDashboard } from "@/components/orientation/OrientationDashboard";

type Props = { params: Promise<{ id: string }> };

export default async function CompanyOrientationPage({ params }: Props) {
  const { id } = await params;
  const companyId = parseInt(id, 10);

  return (
    <OrientationDashboard
      companyId={companyId}
      basePath={`/companies/${companyId}/orientation`}
    />
  );
}
