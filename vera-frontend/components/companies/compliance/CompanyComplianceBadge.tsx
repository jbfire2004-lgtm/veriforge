"use client";

import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { CompanyComplianceOverallStatus } from "@/lib/companies/compliance";

const STYLES: Record<
  CompanyComplianceOverallStatus,
  { label: string; className: string; Icon: typeof CheckCircle2 }
> = {
  compliant: {
    label: "Compliant",
    className: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    Icon: CheckCircle2,
  },
  at_risk: {
    label: "At risk",
    className: "bg-amber-50 text-amber-900 ring-amber-200",
    Icon: AlertTriangle,
  },
  non_compliant: {
    label: "Non-compliant",
    className: "bg-red-50 text-red-800 ring-red-200",
    Icon: ShieldAlert,
  },
};

type Props = {
  status: CompanyComplianceOverallStatus;
  size?: "sm" | "md" | "lg";
};

export function CompanyComplianceBadge({ status, size = "md" }: Props) {
  const cfg = STYLES[status];
  const Icon = cfg.Icon;
  const sizeClass =
    size === "sm"
      ? "px-2 py-0.5 text-[10px] gap-1"
      : size === "lg"
        ? "px-3 py-1.5 text-sm gap-2"
        : "px-2.5 py-1 text-xs gap-1.5";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold uppercase tracking-wide ring-1 ring-inset",
        cfg.className,
        sizeClass,
      )}
    >
      <Icon className={size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"} aria-hidden />
      {cfg.label}
    </span>
  );
}
