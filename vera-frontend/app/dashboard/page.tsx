import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { sessionRole } from "@/lib/phase1-roles";
import { resolveDashboardScope } from "@/lib/dashboard/resolve-dashboard-scope";
import { WorkflowDashboard } from "@/components/dashboard/WorkflowDashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = sessionRole(session);
  const scope = await resolveDashboardScope(session);

  return (
    <WorkflowDashboard
      role={role}
      userName={session?.user?.name ?? null}
      companyId={scope.companyId}
      unionHallId={scope.unionHallId}
    />
  );
}
