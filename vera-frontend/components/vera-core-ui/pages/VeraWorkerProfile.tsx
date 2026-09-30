"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GraduationCap, Wallet } from "lucide-react";
import { getWorkerProfile } from "@/lib/api/vera-core";
import { fetchWorkerReadiness } from "@/lib/core/vera-core-platform";
import { buttonStyles } from "@/components/ui";
import { VeraPageLayout } from "@/src/components/navigation";
import {
  complianceFromExpiry,
  complianceFromScore,
  complianceFromVerified,
} from "@/lib/vera-core-ui/compliance";
import { CoreHero } from "../CoreHero";
import { CoreSection } from "../CoreSection";
import { CredentialCard, type CredentialCardData } from "../CredentialCard";
import { CredentialStack } from "../CredentialStack";
import { ComplianceRing } from "../ComplianceRing";
import { SyncPulse } from "../SyncPulse";
import { useVeraCoreUI } from "@/lib/vera-core-ui/store";
import { WorkerFitTestPanel } from "@/components/workers/WorkerFitTestPanel";
import { WorkerSafetyKnowledgeSummaryCard } from "@/components/workers/WorkerSafetyKnowledgeSummaryCard";
import { WorkerDocumentsPanel } from "@/components/documents/WorkerDocumentsPanel";
import { useVeraAuthOrHook } from "@/contexts/VeraAuthContext";

type Props = { workerId: number };

export function VeraWorkerProfile({ workerId }: Props) {
  const { markSynced, setSyncStatus } = useVeraCoreUI();
  const { authLoading, tokenReady, authenticated, sessionExpired } = useVeraAuthOrHook();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [readiness, setReadiness] = useState<Awaited<
    ReturnType<typeof fetchWorkerReadiness>
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    if (authLoading || !authenticated || sessionExpired || !tokenReady) {
      return;
    }
    setSyncStatus("syncing");
    void Promise.all([
      getWorkerProfile(workerId).catch(() => null),
      fetchWorkerReadiness(workerId).catch(() => null),
    ])
      .then(([p, r]) => {
        setProfile(p as Record<string, unknown> | null);
        setReadiness(r);
        markSynced();
      })
      .catch(() => {
        setError("Could not load worker profile");
        setSyncStatus("error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authLoading || !authenticated || sessionExpired || !tokenReady) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerId, authLoading, authenticated, sessionExpired, tokenReady]);

  const credentials = useMemo((): CredentialCardData[] => {
    const records = (profile?.trainingRecords as Array<Record<string, unknown>>) ?? [];
    return records.slice(0, 6).map((r) => ({
      id: Number(r.id),
      title:
        (r.certification as { name?: string })?.name ?? `Record #${String(r.id)}`,
      issuer: (r.trainingProvider as { name?: string })?.name ?? "Vera",
      expiresAt: r.expiresAt ? String(r.expiresAt) : null,
      issuedAt: r.issuedAt ? String(r.issuedAt) : null,
      verifiedStatus: r.lastVerificationStatus ? String(r.lastVerificationStatus) : null,
      href: `/core/verification?record=${String(r.id)}`,
    }));
  }, [profile]);

  if (loading) {
    return (
      <VeraPageLayout title="Worker profile">
        <p className="text-sm text-[var(--muted-foreground)]">Loading profile…</p>
      </VeraPageLayout>
    );
  }

  if (error || !profile) {
    return (
      <VeraPageLayout title="Worker profile">
        <p className="text-sm text-[var(--compliance-bad-fg)]">{error ?? "Worker not found"}</p>
      </VeraPageLayout>
    );
  }

  const firstName = String(profile.firstName ?? "");
  const lastName = String(profile.lastName ?? "");
  const score = readiness?.score ?? 0;
  const compliance = readiness
    ? complianceFromScore(score, readiness.training.expired)
    : "unknown";

  return (
    <VeraPageLayout
      actions={
        <>
          <SyncPulse onSync={refresh} />
          <Link href={`/wallet/${workerId}`} className={buttonStyles({ variant: "teal", size: "sm" })}>
            <Wallet className="h-4 w-4" aria-hidden />
            Open wallet
          </Link>
        </>
      }
    >
      <div className="space-y-8">
        <CoreHero
          eyebrow={`Worker #${workerId}`}
          title={`${firstName} ${lastName}`.trim() || `Worker ${workerId}`}
          description={profile.email ? String(profile.email) : undefined}
          score={score}
          compliance={compliance}
          badges={[
            {
              label: readiness?.isCompliant ? "Compliant" : "Needs attention",
              state: readiness?.isCompliant ? "ok" : "at_risk",
            },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <CoreSection
            title="Credentials"
            description="Verified training cards — tap for verification detail."
          >
            {credentials.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {credentials.map((c) => (
                  <CredentialCard key={c.id} credential={c} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">No training records yet.</p>
            )}
          </CoreSection>

          <div className="space-y-4">
            <CredentialStack credentials={credentials} maxVisible={3} />
            {readiness ? (
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 text-center shadow-sm">
                <ComplianceRing value={score} state={compliance} size={96} label="Readiness" />
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  {readiness.training.expired} expired · {readiness.training.expiring30} expiring
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {readiness && readiness.issues.length > 0 ? (
          <CoreSection title="Compliance issues">
            <ul className="space-y-2 rounded-2xl border border-[var(--compliance-risk)]/30 bg-[var(--compliance-risk-bg)]/40 p-4">
              {readiness.issues.map((issue, i) => (
                <li key={i} className="text-sm text-[var(--compliance-risk-fg)]">
                  {issue.type}: {issue.message}
                </li>
              ))}
            </ul>
          </CoreSection>
        ) : null}

        <WorkerFitTestPanel workerId={workerId} />
        <WorkerSafetyKnowledgeSummaryCard
          workerId={workerId}
          summary={readiness?.safetyKnowledge}
        />

        <CoreSection title="All training records" description="Newest credentials first.">
          <ul className="divide-y rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)]">
            {credentials.length === 0 ? (
              <li className="px-4 py-3 text-sm text-[var(--muted-foreground)]">No records</li>
            ) : (
              ((profile.trainingRecords as Array<Record<string, unknown>>) ?? []).map((r) => {
                const state = complianceFromVerified(
                  r.lastVerificationStatus ? String(r.lastVerificationStatus) : null,
                );
                const expiry = complianceFromExpiry(
                  r.expiresAt ? String(r.expiresAt) : null,
                );
                const finalState = state === "ok" ? expiry : state;
                return (
                  <li
                    key={String(r.id)}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                  >
                    <span className="inline-flex items-center gap-2 font-medium text-[var(--foreground)]">
                      <GraduationCap className="h-4 w-4 text-[var(--compliance-ok)]" aria-hidden />
                      {(r.certification as { name?: string })?.name ?? `Record #${String(r.id)}`}
                    </span>
                    <span className="text-[var(--muted-foreground)]">
                      {r.expiresAt
                        ? new Date(String(r.expiresAt)).toLocaleDateString()
                        : "No expiry"}
                      {" · "}
                      {finalState.replace("_", " ")}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </CoreSection>

        <WorkerDocumentsPanel workerId={workerId} />
      </div>
    </VeraPageLayout>
  );
}
