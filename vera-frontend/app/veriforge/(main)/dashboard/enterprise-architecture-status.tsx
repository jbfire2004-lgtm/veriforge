"use client";

import {
  VeriForgeProgressBar,
  useEnterpriseArchitectureAnalyticsSync,
} from "@/components/veriforge";

export function VeriForgeDashboardEnterpriseArchitectureStatus() {
  const { analytics } = useEnterpriseArchitectureAnalyticsSync();
  return (
    <div
      className={`border bg-[#1A1A1A] p-4 ${
        analytics.criticalLayers > 0 || analytics.observabilityCritical > 0
          ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.3)]"
          : "border-[#424242]"
      }`}
    >
      <p className="mb-3 font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
        Live Enterprise Architecture
      </p>
      <VeriForgeProgressBar
        label={`Architecture score · critical layers ${analytics.criticalLayers}`}
        value={analytics.architectureScore}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        Layers: {analytics.layerCount} · Tenant-aware: {analytics.tenantAwareCoverage}% · RLS:{" "}
        {analytics.rlsCoverage}% · Infra load: {analytics.infraLoadAverage}% · Tenant:{" "}
        {analytics.tenantId}
      </p>
    </div>
  );
}
