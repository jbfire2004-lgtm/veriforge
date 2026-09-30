"use client";

import { useSearchParams } from "next/navigation";
import { VeriPmDashboardView } from "@/components/veripm-dashboard/VeriPmDashboardView";

export function VeriPmDashboardPageClient() {
  const search = useSearchParams();
  const projectId = search.get("projectId");
  const assetId = search.get("assetId");
  return (
    <VeriPmDashboardView
      initialProjectId={projectId ? Number(projectId) : null}
      initialAssetId={assetId}
    />
  );
}
