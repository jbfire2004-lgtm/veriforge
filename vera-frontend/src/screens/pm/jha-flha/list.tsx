"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchJhaFlhaAnalytics, listJhaFlha, type JhaFlhaSummary } from "@/lib/jha-flha";
import {
  PmMetricCard,
  PmMetricGrid,
  PmPageShell,
  PmSurfaceCard,
} from "@/src/components/pm/layout";
import { SfButton } from "@/src/components/safety-forms/ui";
import { useVeraAuthOrHook } from "@/contexts/VeraAuthContext";

export default function JhaFlhaListPage({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const { authLoading, authenticated, tokenReady, sessionExpired } = useVeraAuthOrHook();
  const [rows, setRows] = useState<JhaFlhaSummary[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const query = `?projectId=${projectId}&companyId=${companyId}`;

  useEffect(() => {
    void listJhaFlha({ projectId, companyId }).then(setRows).catch(() => undefined);
    void fetchJhaFlhaAnalytics(projectId).then(setAnalytics).catch(() => undefined);
  }, [projectId, companyId]);

  return (
    <PmPageShell
      title="JHA / FLHA"
      description={`Field level hazard assessments and job hazard analyses — project #${projectId}`}
      auth={{
        authLoading,
        authenticated,
        tokenReady,
        sessionExpired,
        signInMessage: "Sign in to load JHA/FLHA records.",
      }}
      actions={
        <>
          <Link href={`/pm/jha-flha/new/flha${query}`}>
            <SfButton type="button">New FLHA</SfButton>
          </Link>
          <Link href={`/pm/jha-flha/new/jha${query}`}>
            <SfButton type="button" variant="secondary">
              New JHA
            </SfButton>
          </Link>
        </>
      }
    >
      {analytics?.scores ? (
        <PmMetricGrid columns={4}>
          {Object.entries(analytics.scores as Record<string, unknown>).map(([k, v]) => (
            <PmMetricCard
              key={k}
              label={k.replace(/Score/g, " score").replace(/([A-Z])/g, " $1")}
              value={String(v)}
            />
          ))}
        </PmMetricGrid>
      ) : null}

      <PmSurfaceCard title={`Assessments (${rows.length})`}>
        {rows.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            No JHA/FLHA records yet. Create a new FLHA to start.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {rows.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/pm/jha-flha/${r.id}${query}`}
                  className="flex justify-between gap-4 py-3 transition hover:bg-[var(--accent)]/40"
                >
                  <div>
                    <p className="font-medium">{r.taskDescription}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {r.kind} · {r.status}
                      {r.sifPotential ? " · SIF" : ""}
                    </p>
                  </div>
                  <div className="text-right text-xs text-[var(--muted-foreground)]">
                    <p>Risk {r.riskScore ?? "—"}</p>
                    <p>Quality {r.qualityScore ?? "—"}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PmSurfaceCard>
    </PmPageShell>
  );
}
