"use client";

import { Badge } from "@/components/ui";
import { cn } from "@/src/lib/utils";
import type { InsuranceStatus } from "@/lib/contractor-directory-api";

export function ComplianceBadge({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const variant =
    score >= 80 ? "success" : score >= 55 ? "warning" : score > 0 ? "danger" : "outline";

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", className)}>
      <Badge variant={variant}>Compliance {score}</Badge>
    </span>
  );
}

export function InsuranceBadge({ status }: { status: InsuranceStatus }) {
  const label: Record<InsuranceStatus, string> = {
    valid: "Insurance valid",
    expiring: "Insurance expiring",
    expired: "Insurance expired",
    missing: "Insurance missing",
    unknown: "Insurance unknown",
  };
  return <Badge variant="outline">{label[status]}</Badge>;
}

export function ConnectionStatusBadge({
  status,
}: {
  status: string | null | undefined;
}) {
  if (!status) {
    return <Badge variant="outline">Not connected</Badge>;
  }
  const map: Record<string, string> = {
    pending: "Pending",
    approved: "Connected",
    rejected: "Rejected",
    revoked: "Revoked",
  };
  return <Badge variant={status === "approved" ? "default" : "outline"}>
    {map[status] ?? status}
  </Badge>;
}

export function SafetyRatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="text-sm text-amber-600" title={`${rating}/5`}>
      {"★".repeat(full)}
      {half ? "½" : ""}
      {"☆".repeat(Math.max(0, 5 - full - (half ? 1 : 0)))}
      <span className="ml-1 text-zinc-500">{rating.toFixed(1)}</span>
    </span>
  );
}
