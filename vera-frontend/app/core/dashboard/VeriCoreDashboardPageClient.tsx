"use client";

import { useSearchParams } from "next/navigation";
import { VeriCoreDashboardView } from "@/components/vericore-dashboard/VeriCoreDashboardView";

export function VeriCoreDashboardPageClient() {
  const search = useSearchParams();
  const projectIdRaw = search.get("projectId");
  const contractorIdRaw = search.get("contractorId");
  const companyIdRaw = search.get("companyId");

  return (
    <VeriCoreDashboardView
      companyId={companyIdRaw ? Number(companyIdRaw) : 1}
      initialProjectId={projectIdRaw ? Number(projectIdRaw) : null}
      initialContractorId={contractorIdRaw ? Number(contractorIdRaw) : null}
    />
  );
}
