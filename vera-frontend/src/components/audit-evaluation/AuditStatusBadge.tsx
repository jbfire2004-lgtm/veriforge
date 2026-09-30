"use client";

import type { AuditEvaluationStatus } from "@/lib/audit-evaluation-api";

const STYLES: Record<AuditEvaluationStatus, string> = {
  draft: "bg-zinc-50 text-zinc-700 border-zinc-200",
  assigned: "bg-sky-50 text-sky-800 border-sky-200",
  in_review: "bg-amber-50 text-amber-900 border-amber-200",
  scored: "bg-emerald-50 text-emerald-800 border-emerald-200",
  closed: "bg-zinc-100 text-zinc-600 border-zinc-300",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export function AuditStatusBadge({
  status,
}: {
  status: AuditEvaluationStatus;
}) {
  return (
    <span
      className={`inline-flex border px-2 py-0.5 text-xs font-medium capitalize ${STYLES[status] ?? STYLES.draft}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function AuditScorePill({ score }: { score?: number | null }) {
  if (score == null) {
    return <span className="text-xs text-zinc-400">—</span>;
  }
  const tone =
    score >= 80
      ? "text-emerald-700"
      : score >= 60
        ? "text-amber-800"
        : "text-red-700";
  return (
    <span className={`text-sm font-semibold tabular-nums ${tone}`}>
      {Math.round(score)}
    </span>
  );
}
