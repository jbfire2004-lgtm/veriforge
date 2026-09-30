"use client";

import { cn } from "@/src/lib/utils";
import type { PmSafetyWorkflowStatus } from "@/lib/pm-safety-workflow";

const styles: Record<PmSafetyWorkflowStatus, string> = {
  DRAFT: "border-slate-300 bg-slate-100 text-slate-900",
  SUBMITTED: "border-blue-300 bg-blue-100 text-blue-950",
  UNDER_REVIEW: "border-amber-300 bg-amber-100 text-amber-950",
  APPROVED: "border-emerald-300 bg-emerald-100 text-emerald-950",
  REJECTED: "border-red-300 bg-red-100 text-red-950",
  CLOSED: "border-slate-400 bg-slate-200 text-slate-950",
  CANCELLED: "border-neutral-400 bg-neutral-200 text-neutral-900",
};

export function PmSafetyStatusBadge({
  status,
}: {
  status: PmSafetyWorkflowStatus;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        styles[status]
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
