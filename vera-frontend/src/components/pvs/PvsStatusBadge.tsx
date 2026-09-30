"use client";

import type { PvsVerificationStatus } from "@/lib/pvs-api";

const STYLES: Record<string, string> = {
  draft: "bg-zinc-50 text-zinc-700 border-zinc-200",
  submitted: "bg-sky-50 text-sky-800 border-sky-200",
  in_review: "bg-amber-50 text-amber-900 border-amber-200",
  verified: "bg-emerald-50 text-emerald-800 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  exempt: "bg-sky-50 text-sky-800 border-sky-200",
  missing: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

export function PvsStatusBadge({
  status,
}: {
  status: PvsVerificationStatus | string;
}) {
  return (
    <span
      className={`inline-flex border px-2 py-0.5 text-xs font-medium capitalize ${STYLES[status] ?? STYLES.draft}`}
    >
      {String(status).replace(/_/g, " ")}
    </span>
  );
}
