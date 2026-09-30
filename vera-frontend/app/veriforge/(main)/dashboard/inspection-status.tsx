"use client";

import {
  VeriForgeProgressBar,
  useInspectionAnalyticsSync,
} from "@/components/veriforge";

export function VeriForgeDashboardInspectionStatus() {
  const { analytics } = useInspectionAnalyticsSync();
  return (
    <div
      className={`border bg-[#1A1A1A] p-4 ${
        analytics.criticalDefects > 0 || analytics.overdueInspections > 0
          ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.3)]"
          : "border-[#424242]"
      }`}
    >
      <p className="mb-3 font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
        Live Equipment Inspections
      </p>
      <VeriForgeProgressBar
        label={`Avg score · overdue ${analytics.overdueInspections}`}
        value={analytics.averageScore}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        Equipment: {analytics.totalEquipment} · Critical defects: {analytics.criticalDefects} ·
        Expired certs: {analytics.expiredCerts} · Completion: {analytics.averageCompletion}%
      </p>
    </div>
  );
}
