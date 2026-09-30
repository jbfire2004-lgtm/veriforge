"use client";

import { useEffect, useState } from "react";
import {
  loadWorkerVerification,
  type TrainingRecord,
} from "@/components/wallet/wallet-api";
import { toBadgeStatus } from "@vera/api-contract";
import { VerifiedByVeraBadge } from "@/src/components/verification/VerifiedByVeraBadge";

type Props = {
  workerId: number | null;
  className?: string;
};

export function SiteAccessTrainingVeraSection({ workerId, className }: Props) {
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workerId == null || workerId < 1) {
      setRecords([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void loadWorkerVerification(workerId)
      .then((payload) => {
        if (cancelled) return;
        const list =
          payload.certifications?.length > 0
            ? payload.certifications
            : payload.worker.trainingRecords ?? [];
        setRecords(list);
      })
      .catch(() => {
        if (!cancelled) setRecords([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workerId]);

  if (workerId == null || workerId < 1) {
    return null;
  }

  if (loading) {
    return (
      <p className={className ?? "text-sm text-[var(--sf-text-muted)]"}>
        Loading training verification…
      </p>
    );
  }

  if (records.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h3 className="mb-2 text-sm font-medium">Training — Verified by Vera</h3>
      <ul className="divide-y text-sm">
        {records.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-2 py-2"
          >
            <span className="min-w-0 truncate">
              {r.certification?.name ?? r.courseName ?? `Training #${r.id}`}
            </span>
            {r.verifiedByVeraStatus &&
            r.verifiedByVeraStatus !== "UNVERIFIED" ? (
              <VerifiedByVeraBadge
                status={toBadgeStatus(r.verifiedByVeraStatus)}
                jurisdictionCoverage={r.jurisdictionCoverage}
                regulatorySummary={r.regulatorySummary}
                hasNft={
                  r.verifiedByVeraStatus === "VERIFIED_WITH_NFT" ||
                  r.nftTokenId != null
                }
              />
            ) : (
              <VerifiedByVeraBadge trainingRecordId={r.id} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
