import PmUnifiedSafetyIntelligenceDashboard from "@/src/screens/pm/unified-safety-intelligence/dashboard";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const q = await searchParams;
  return (
    <PmUnifiedSafetyIntelligenceDashboard
      companyId={q.companyId ? parseInt(q.companyId, 10) : 1}
      projectId={q.projectId ? parseInt(q.projectId, 10) : undefined}
    />
  );
}
