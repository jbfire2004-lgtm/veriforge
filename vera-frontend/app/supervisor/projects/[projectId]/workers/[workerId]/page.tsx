"use client";

import { useParams, useSearchParams } from "next/navigation";
import { ProjectWorkerCompliancePanel } from "@/components/project-compliance/ProjectWorkerCompliancePanel";

export default function SupervisorProjectWorkerCompliancePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = Number(params.projectId);
  const workerId = Number(params.workerId);
  const companyId = Number(searchParams.get("companyId") ?? "1");

  if (!Number.isFinite(projectId) || !Number.isFinite(workerId)) {
    return null;
  }

  return (
    <ProjectWorkerCompliancePanel
      companyId={companyId}
      projectId={projectId}
      workerId={workerId}
      backHref={`/supervisor/projects/${projectId}/compliance?companyId=${companyId}`}
    />
  );
}
