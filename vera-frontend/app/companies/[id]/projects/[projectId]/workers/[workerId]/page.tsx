"use client";

import { useParams } from "next/navigation";
import { ProjectWorkerCompliancePanel } from "@/components/project-compliance/ProjectWorkerCompliancePanel";

export default function ProjectWorkerCompliancePage() {
  const params = useParams();
  const companyId = Number(params.id);
  const projectId = Number(params.projectId);
  const workerId = Number(params.workerId);

  if (
    !Number.isFinite(companyId) ||
    !Number.isFinite(projectId) ||
    !Number.isFinite(workerId)
  ) {
    return null;
  }

  return (
    <ProjectWorkerCompliancePanel
      companyId={companyId}
      projectId={projectId}
      workerId={workerId}
      backHref={`/companies/${companyId}/projects/${projectId}`}
    />
  );
}
