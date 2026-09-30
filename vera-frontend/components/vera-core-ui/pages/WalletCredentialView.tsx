"use client";

import { useMemo } from "react";
import { CoreHero } from "../CoreHero";
import { CredentialCard, type CredentialCardData } from "../CredentialCard";
import { CredentialStack } from "../CredentialStack";
import { CoreSection } from "../CoreSection";
import { SyncPulse } from "../SyncPulse";
import { complianceFromScore } from "@/lib/vera-core-ui/compliance";
import { complianceFromExpiry, complianceFromVerified } from "@/lib/vera-core-ui/compliance";

export type WalletCredentialSummary = {
  workerId: number;
  displayName: string;
  companyName?: string | null;
  readinessScore?: number;
  isCompliant?: boolean;
  syncedAt?: string | null;
  credentials: CredentialCardData[];
  children?: React.ReactNode;
};

type Props = {
  summary: WalletCredentialSummary;
  onSync?: () => void;
  syncStatus?: "idle" | "syncing" | "synced" | "offline";
  loading?: boolean;
};

export function WalletCredentialView({ summary, onSync, syncStatus, loading = false }: Props) {
  const compliance = summary.readinessScore != null
    ? complianceFromScore(summary.readinessScore)
    : summary.isCompliant
      ? "ok"
      : "at_risk";

  const stackCredentials = useMemo(
    () =>
      summary.credentials.map((c) => ({
        ...c,
        state:
          complianceFromVerified(c.verifiedStatus) === "ok"
            ? complianceFromExpiry(c.expiresAt)
            : complianceFromVerified(c.verifiedStatus),
      })),
    [summary.credentials],
  );

  return (
    <div className="space-y-8">
      <CoreHero
        eyebrow="Worker wallet"
        title={summary.displayName}
        description={summary.companyName ?? "Verified credentials for field scanning"}
        score={summary.readinessScore}
        compliance={compliance}
        actions={<SyncPulse status={syncStatus} lastSyncedAt={summary.syncedAt} onSync={onSync} />}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <CoreSection title="Your credentials" description="Apple Wallet–style cards with expiry countdowns.">
          {loading ? (
            <div className="rounded-xl border border-dashed border-vera-border p-6 text-sm text-vera-muted">
              Loading credentials...
            </div>
          ) : summary.credentials.length === 0 ? (
            <div className="rounded-xl border border-dashed border-vera-border p-6 text-sm text-vera-muted">
              No credentials available yet. Completed training records will appear here.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {summary.credentials.map((c) => (
                <CredentialCard key={c.id} credential={c} />
              ))}
            </div>
          )}
        </CoreSection>
        <div className="hidden lg:block">
          <CredentialStack credentials={stackCredentials} />
        </div>
      </div>

      {summary.children}
    </div>
  );
}
