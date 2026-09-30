"use client";

import { useParams } from "next/navigation";
import { ProjectSafetyHub } from "@/components/safety-workflow/ProjectSafetyHub";

export default function ProjectSafetyPage() {
  const params = useParams();
  const projectId = Number(params.id);
  const companyId = Number(params.companyId);

  if (!Number.isFinite(projectId)) return null;

  return (
    <ProjectSafetyHub
      projectId={projectId}
      companyId={Number.isFinite(companyId) ? companyId : undefined}
    />
  );
}
