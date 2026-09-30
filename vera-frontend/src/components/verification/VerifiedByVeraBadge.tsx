"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Link2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  toBadgeStatus,
  type VerifiedByVeraBadgeStatus,
  type VerifiedByVeraStatus,
} from "@vera/api-contract";
import { fetchVerifiedByVeraProjection } from "@/lib/training-credential-nft/api";

export type VerifiedByVeraBadgeProps = {
  trainingRecordId?: number;
  status?: VerifiedByVeraBadgeStatus;
  jurisdictionCoverage?: string[];
  regulatorySummary?: string | null;
  /** Explicit NFT flag; defaults from status === verified_with_nft */
  hasNft?: boolean;
  /** When true, renders a muted label for unverified (default: hidden) */
  showUnverified?: boolean;
  className?: string;
};

function mapApiStatus(s: VerifiedByVeraStatus): VerifiedByVeraBadgeStatus {
  return toBadgeStatus(s);
}

const labelByStatus: Record<VerifiedByVeraBadgeStatus, string> = {
  unverified: "Not verified",
  pending: "Verification pending",
  verified: "Verified by Vera",
  verified_with_nft: "Verified by Vera",
};

function buildTooltip(
  status: VerifiedByVeraBadgeStatus,
  summary: string | null | undefined,
  coverage: string[] | undefined,
  hasNft: boolean,
): string {
  const parts: string[] = [];
  if (summary) parts.push(summary);
  if (coverage?.length) {
    parts.push(`Accepted in: ${coverage.join(", ")}`);
  }
  parts.push("Verified against OHS/CSA and related regulations.");
  if (hasNft || status === "verified_with_nft") {
    parts.push("NFT-locked credential. Tamper-resistant.");
  }
  return parts.join(" · ");
}

export function VerifiedByVeraBadge({
  trainingRecordId,
  status: statusProp,
  jurisdictionCoverage: coverageProp,
  regulatorySummary: summaryProp,
  hasNft: hasNftProp,
  showUnverified = false,
  className,
}: VerifiedByVeraBadgeProps) {
  const [status, setStatus] = useState<VerifiedByVeraBadgeStatus | null>(
    statusProp ?? null,
  );
  const [coverage, setCoverage] = useState<string[] | undefined>(coverageProp);
  const [summary, setSummary] = useState<string | null | undefined>(summaryProp);
  const [fetchedHasNft, setFetchedHasNft] = useState<boolean | undefined>(
    undefined,
  );

  useEffect(() => {
    if (statusProp != null) {
      setStatus(statusProp);
      setCoverage(coverageProp);
      setSummary(summaryProp);
      return;
    }
    if (trainingRecordId == null) return;
    let cancelled = false;
    void fetchVerifiedByVeraProjection(trainingRecordId)
      .then((p) => {
        if (cancelled) return;
        setStatus(mapApiStatus(p.verifiedByVeraStatus));
        setCoverage(p.jurisdictionCoverage);
        setSummary(p.regulatorySummary);
        setFetchedHasNft(
          p.verifiedByVeraStatus === "VERIFIED_WITH_NFT" || p.nftTokenId != null,
        );
      })
      .catch(() => {
        if (!cancelled) setStatus("unverified");
      });
    return () => {
      cancelled = true;
    };
  }, [trainingRecordId, statusProp, coverageProp, summaryProp]);

  const resolvedStatus = statusProp ?? status;
  const hasNft = useMemo(() => {
    if (hasNftProp != null) return hasNftProp;
    if (fetchedHasNft != null) return fetchedHasNft;
    return resolvedStatus === "verified_with_nft";
  }, [hasNftProp, fetchedHasNft, resolvedStatus]);

  if (resolvedStatus == null) {
    return null;
  }

  if (resolvedStatus === "unverified") {
    if (!showUnverified) return null;
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600",
          className,
        )}
        title="Regulatory verification not completed"
      >
        <span>{labelByStatus.unverified}</span>
      </span>
    );
  }

  const tooltip = buildTooltip(resolvedStatus, summary, coverage, hasNft);
  const isPending = resolvedStatus === "pending";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold",
        isPending
          ? "border-amber-200 bg-amber-50 text-amber-900"
          : "border-teal-200 bg-teal-50 text-teal-900",
        className,
      )}
      title={tooltip}
    >
      <BadgeCheck
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          isPending ? "text-amber-700" : "text-teal-700",
        )}
        aria-hidden
      />
      <span>{labelByStatus[resolvedStatus]}</span>
      {hasNft ? (
        <Link2
          className="h-3 w-3 shrink-0 text-teal-700"
          aria-label="NFT-locked"
        />
      ) : null}
    </span>
  );
}
