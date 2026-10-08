import PmUnifiedCorrectiveActionDetailPage from "@/src/screens/pm/unified-corrective-action/detail";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const { id } = await params;
  const q = await searchParams;
  return (
    <PmUnifiedCorrectiveActionDetailPage
      id={id}
      companyId={q.companyId ? parseInt(q.companyId, 10) : 1}
      projectId={q.projectId ? parseInt(q.projectId, 10) : undefined}
    />
  );
}
