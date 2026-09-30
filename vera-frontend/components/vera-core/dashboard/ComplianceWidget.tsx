"use client";

import * as React from "react";
import { DashboardCard, type DashboardCardProps } from "./DashboardCard";
import { ProgressBar } from "../status/ProgressBar";
import { Filters } from "../list/Filters";
import type { FilterChip } from "@/lib/wireframes/types";
import { cn } from "@/src/lib/utils";

export type ComplianceBreakdownItem = {
  label: string;
  value: number;
  tone?: "success" | "warning" | "danger" | "default";
};

export type ComplianceWidgetProps = Omit<DashboardCardProps, "tone"> & {
  status?: "compliant" | "expiring" | "nonCompliant";
  /** 0–100 compliance score */
  progress?: number;
  progressLabel?: string;
  breakdown?: ComplianceBreakdownItem[];
  filterChips?: FilterChip[];
  activeFilterId?: string;
  onFilterChange?: (id: string) => void;
};

const toneMap = {
  compliant: "success" as const,
  expiring: "warning" as const,
  nonCompliant: "danger" as const,
};

const breakdownToneClass = {
  success: "bg-[var(--badge-success-bg)] text-[var(--badge-success-fg)]",
  warning: "bg-[var(--badge-warning-bg)] text-[var(--badge-warning-fg)]",
  danger: "bg-[var(--badge-danger-bg)] text-[var(--badge-danger-fg)]",
  default: "bg-[var(--muted)] text-[var(--foreground)]",
};

export function ComplianceWidget({
  status = "compliant",
  progress,
  progressLabel = "Overall compliance",
  breakdown,
  filterChips,
  activeFilterId,
  onFilterChange,
  children,
  className,
  ...props
}: ComplianceWidgetProps) {
  return (
    <DashboardCard tone={toneMap[status]} className={className} {...props}>
      {filterChips && filterChips.length > 0 ? (
        <Filters
          chips={filterChips}
          activeId={activeFilterId}
          onChange={onFilterChange}
          className="mb-4"
        />
      ) : null}
      {progress != null ? (
        <ProgressBar
          value={progress}
          label={progressLabel}
          showLabel
          tone={status === "nonCompliant" ? "danger" : status === "expiring" ? "warning" : "teal"}
          className="mb-4"
        />
      ) : null}
      {breakdown && breakdown.length > 0 ? (
        <ul className="grid gap-2 sm:grid-cols-2" aria-label="Compliance breakdown">
          {breakdown.map((item) => (
            <li
              key={item.label}
              className={cn(
                "flex items-center justify-between rounded-[var(--radius-md)] px-3 py-2 text-sm",
                breakdownToneClass[item.tone ?? "default"]
              )}
            >
              <span>{item.label}</span>
              <span className="font-semibold tabular-nums">{item.value}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {children}
    </DashboardCard>
  );
}
