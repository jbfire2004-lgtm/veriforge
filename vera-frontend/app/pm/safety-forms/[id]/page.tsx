import SafetyFormDetailPage from "@/src/screens/pm/safety-forms/detail";

type Props = { params: Promise<{ id: string }> };

export default async function SafetyFormDetailRoute({ params }: Props) {
  const { id } = await params;
  return <SafetyFormDetailPage formId={id} />;
}
