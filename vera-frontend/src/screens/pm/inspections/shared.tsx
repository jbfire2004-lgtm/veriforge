"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchPmInspectionSharedReports } from "@/lib/pm-inspections";
import { usePmInspectionScope } from "@/hooks/usePmInspectionScope";
import { PmPageShell, PmSurfaceCard } from "@/src/components/pm/layout";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PmInspectionSharedReportsPage({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const { session, query, authLoading, authenticated, tokenReady, sessionExpired } =
    usePmInspectionScope(companyId, projectId);
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchPmInspectionSharedReports>> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenReady) return;
    void fetchPmInspectionSharedReports(projectId, { session })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load shared reports"));
  }, [projectId, tokenReady, session?.accessToken]);

  return (
    <PmPageShell
      title="Shared inspection reports"
      description="Completed site walks and audits shared with your project team, contractors, and workers."
      auth={{
        authLoading,
        authenticated,
        tokenReady,
        sessionExpired,
        signInMessage: "Sign in to load shared reports.",
      }}
    >
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {!data && !error ? (
        <p className="text-sm text-[var(--muted-foreground)]">Loading shared reports…</p>
      ) : null}

      {data ? (
        <PmSurfaceCard title={`Shared reports (${data.total})`}>
          <ul className="divide-y divide-[var(--border)] text-sm">
            {data.items.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {r.templateName} · {formatDate(r.submittedAt)} · {r.accessReason}
                  </p>
                </div>
                <Link
                  href={`/pm/inspections/${r.id}/report${query}`}
                  className="text-sm font-medium text-[var(--primary)] hover:underline"
                >
                  View report
                </Link>
              </li>
            ))}
            {data.items.length === 0 ? (
              <li className="py-6 text-center text-[var(--muted-foreground)]">
                No shared reports yet.
              </li>
            ) : null}
          </ul>
        </PmSurfaceCard>
      ) : null}
    </PmPageShell>
  );
}
