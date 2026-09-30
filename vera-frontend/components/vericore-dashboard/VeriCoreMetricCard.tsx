"use client";

import { cn } from "@/src/lib/utils";
import type { IndustryCompare, Metric } from "@/lib/vericore-dashboard/types";

function industryHint(ind?: IndustryCompare) {
  if (!ind || ind.sampleSuppressed) return "Industry: suppressed (n<5)";
  if (ind.companyValue == null || ind.industryMean == null) return undefined;
  const delta = Math.round((ind.companyValue - ind.industryMean) * 10) / 10;
  const sign = delta > 0 ? "+" : "";
  return `vs industry ${ind.industryMean} (${sign}${delta}) · ${ind.percentileRank}th pct · n=${ind.cohortSize}`;
}

export function VeriCoreMetricCard({
  metric,
  onOpen,
  tone = "default",
  className,
}: {
  metric: Metric;
  onOpen: (metric: Metric) => void;
  tone?: "default" | "amber" | "teal";
  className?: string;
}) {
  const hint = industryHint(metric.industry);
  const display =
    metric.value == null
      ? "—"
      : metric.unit === "%"
        ? `${metric.value}%`
        : metric.unit === "days"
          ? `${metric.value}d`
          : metric.unit === "count"
            ? String(metric.value)
            : `${metric.value}`;

  return (
    <button
      type="button"
      onClick={() => onOpen(metric)}
      className={cn(
        "group w-full rounded-[3px] border border-[#5A6169]/40 bg-white p-4 text-left shadow-none transition",
        "hover:border-[#1E6FB8] hover:bg-[#F7FAFC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1E6FB8]",
        tone === "amber" && "border-[#C89F3D]/50 bg-[#FBF8F0]",
        tone === "teal" && "border-[#2F8F8C]/40 bg-[#F3FAF9]",
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5a6b7c]">
        {metric.label}
      </p>
      <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-[#2A2E33]">
        {display}
        {metric.unit && metric.unit !== "%" && metric.unit !== "days" && metric.unit !== "count" ? (
          <span className="ml-1 text-sm font-medium text-[#5a6b7c]">{metric.unit}</span>
        ) : null}
      </p>
      {hint ? (
        <p className="mt-2 text-xs leading-relaxed text-[#5a6b7c]">{hint}</p>
      ) : (
        <p className="mt-2 text-xs text-[#8A9199] group-hover:text-[#1E6FB8]">
          Click for drill-down · formula
        </p>
      )}
    </button>
  );
}
