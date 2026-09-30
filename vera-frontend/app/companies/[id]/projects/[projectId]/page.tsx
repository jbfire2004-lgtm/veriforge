"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Building2 } from "lucide-react";
import { ProjectComplianceDashboard } from "@/components/project-compliance/ProjectComplianceDashboard";
import { buttonStyles } from "@/components/ui/button";

export default function ProjectTrainingCompliancePage() {
  const params = useParams();
  const companyId = Number(params.id);
  const projectId = Number(params.projectId);

  if (!Number.isFinite(companyId) || !Number.isFinite(projectId)) {
    return null;
  }

  return (
    <div className="space-y-vera-6">
      <header className="flex flex-wrap items-end justify-between gap-vera-3">
        <p className="flex items-center gap-vera-2 text-sm text-vera-muted">
          <Building2 className="h-4 w-4" aria-hidden />
          Project compliance
        </p>
        <Link
          href={`/companies/${companyId}`}
          className={buttonStyles({ variant: "outline", size: "sm" })}
        >
          Back to company
        </Link>
      </header>

      <ProjectComplianceDashboard companyId={companyId} projectId={projectId} />
    </div>
  );
}
