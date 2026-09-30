"use client";

import {
  VeriForgeProgressBar,
  useFieldAnalyticsSync,
} from "@/components/veriforge";

export function VeriForgeDashboardFieldOperationsStatus() {
  const { analytics } = useFieldAnalyticsSync();
  return (
    <div
      className={`border bg-[#1A1A1A] p-4 ${
        analytics.criticalHazards > 0 || analytics.overdueTasks > 0
          ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.3)]"
          : "border-[#424242]"
      }`}
    >
      <p className="mb-3 font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcfcf]">
        Live Field Operations
      </p>
      <VeriForgeProgressBar
        label={`Field status · overdue ${analytics.overdueTasks}`}
        value={analytics.fieldStatusScore}
      />
      <p className="mt-2 text-xs text-[#b8b8b8]">
        Tasks: {analytics.totalTasks} · Completion: {analytics.taskCompletion}% · Critical
        hazards: {analytics.criticalHazards} · Equipment hours:{" "}
        {analytics.equipmentUsageHours}
      </p>
    </div>
  );
}
