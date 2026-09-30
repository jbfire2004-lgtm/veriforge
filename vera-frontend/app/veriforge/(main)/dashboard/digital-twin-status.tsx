"use client";

import {
  VeriForgeProgressBar,
  useDigitalTwinAnalyticsSync,
} from "@/components/veriforge";

export function VeriForgeDashboardDigitalTwinStatus() {
  const { analytics } = useDigitalTwinAnalyticsSync();
  return (
    <div
      className={`border bg-[#1A1A1A] p-4 ${
        analytics.activeHazards > 0 || analytics.criticalEquipment > 0
          ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.3)]"
          : "border-[#424242]"
      }`}
    >
      <p className="mb-3 font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
        Live Safety Digital Twin
      </p>
      <VeriForgeProgressBar
        label={`Health · hazards ${analytics.activeHazards}`}
        value={analytics.twinHealthScore}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        Site: {analytics.siteId} · Critical EQ: {analytics.criticalEquipment} · Low
        ready: {analytics.lowReadinessWorkers} · Predicted risk:{" "}
        {analytics.predictedHighRisk}
      </p>
    </div>
  );
}
