"use client";

import type { DocumentCenterStatus } from "@/lib/document-center-api";

const STYLES: Record<DocumentCenterStatus, string> = {
  valid: "bg-emerald-50 text-emerald-800 border-emerald-200",
  expiring: "bg-amber-50 text-amber-900 border-amber-200",
  expired: "bg-red-50 text-red-800 border-red-200",
  pending_review: "bg-zinc-50 text-zinc-700 border-zinc-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  exempt: "bg-sky-50 text-sky-800 border-sky-200",
  missing: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

export function DocumentStatusBadge({
  status,
}: {
  status: DocumentCenterStatus;
}) {
  return (
    <span
      className={`inline-flex border px-2 py-0.5 text-xs font-medium capitalize ${STYLES[status] ?? STYLES.pending_review}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function DocumentDashboardIndicators({
  indicators,
  totals,
}: {
  indicators: {
    hasExpiring: boolean;
    hasExpired: boolean;
    missingRequired: string[];
  };
  totals: {
    expiring: number;
    expired: number;
    documents: number;
  };
}) {
  return (
    <div className="flex flex-wrap gap-2 text-sm">
      {indicators.hasExpired ? (
        <span className="border border-red-200 bg-red-50 px-3 py-1 text-red-800">
          {totals.expired} expired
        </span>
      ) : null}
      {indicators.hasExpiring ? (
        <span className="border border-amber-200 bg-amber-50 px-3 py-1 text-amber-900">
          {totals.expiring} expiring soon
        </span>
      ) : null}
      {indicators.missingRequired.length ? (
        <span className="border border-zinc-300 bg-zinc-50 px-3 py-1 text-zinc-700">
          Missing: {indicators.missingRequired.join(", ").replace(/_/g, " ")}
        </span>
      ) : (
        <span className="border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800">
          Required categories covered ({totals.documents} docs)
        </span>
      )}
    </div>
  );
}
