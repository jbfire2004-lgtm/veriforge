import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { requireRouteAccess } from "@/lib/route-access";
import { canAccessSupervisorShell } from "@/lib/phase1-roles";
import {
  getUserCompanyContext,
  mergeCompaniesWithUser,
} from "@/lib/user-company-context";
import { ProjectComplianceDashboard } from "@/components/project-compliance/ProjectComplianceDashboard";
import { Breadcrumbs, buttonStyles } from "@/components/ui";
import { WorkspaceHero } from "@/components/theme/workspace";

type Props = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ companyId?: string }>;
};

export default async function SupervisorProjectCompliancePage({
  params,
  searchParams,
}: Props) {
  const { session } = await requireRouteAccess({
    callbackUrl: "/supervisor",
    guard: canAccessSupervisorShell,
  });

  const { projectId: projectIdRaw } = await params;
  const { companyId: companyIdRaw } = await searchParams;
  const projectId = Number(projectIdRaw);

  const [companiesRes, userCompany] = await Promise.all([
    apiGetSafe<{ id: number; name: string }[]>("/companies", session),
    getUserCompanyContext(session),
  ]);
  const companies = mergeCompaniesWithUser(
    companiesRes.ok ? companiesRes.data : [],
    userCompany,
  );
  const companyId = companyIdRaw
    ? Number(companyIdRaw)
    : userCompany.companyId ?? companies[0]?.id ?? 1;

  return (
    <div className="space-y-vera-6">
      <Breadcrumbs
        items={[
          { label: "Supervisor", href: "/supervisor" },
          { label: "Project compliance", href: "#" },
        ]}
      />
      <WorkspaceHero
        title="Project compliance"
        description="Real-time credential compliance for workers on this project."
        actions={
          <Link href="/supervisor" className={buttonStyles({ variant: "outline", size: "sm" })}>
            Supervisor home
          </Link>
        }
      />
      <ProjectComplianceDashboard
        companyId={companyId}
        projectId={projectId}
        workerDetailBasePath={`/supervisor/projects/${projectId}/workers`}
      />
    </div>
  );
}
