"use client";

import { VeriPmIncidentInvestigationWorkspace } from "@/components/veripm-incidents-hub/VeriPmIncidentInvestigationWorkspace";

export default function PmIncidentDetailPage({
  id,
  projectId = 1,
  companyId = 1,
}: {
  id: string;
  projectId?: number;
  companyId?: number;
}) {
  return (
    <VeriPmIncidentInvestigationWorkspace
      id={id}
      projectId={projectId}
      companyId={companyId}
    />
  );
}
