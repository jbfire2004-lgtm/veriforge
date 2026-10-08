import PpePreUseDetailPage from "@/src/screens/pm/inspections/ppe-preuse/detail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PpePreUseDetailPage id={id} />;
}
