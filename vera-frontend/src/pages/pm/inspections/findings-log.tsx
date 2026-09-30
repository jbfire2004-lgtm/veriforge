"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchPmInspectionFindingsLog } from "@/lib/pm-inspections";
import { usePmInspectionScope } from "@/hooks/usePmInspectionScope";
import { PmPageShell, PmSurfaceCard } from "@/src/components/pm/layout";

export default function PmInspectionFindingsLogPage({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const { session, query, authLoading, authenticated, tokenReady, sessionExpired } =
    usePmInspectionScope(companyId, projectId);
  const [log, setLog] = useState<Awaited<ReturnType<typeof fetchPmInspectionFindingsLog>> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenReady) return;
    void fetchPmInspectionFindingsLog(projectId, companyId, { session })
      .then(setLog)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load log"));
  }, [projectId, companyId, tokenReady, session?.accessToken]);

  return (
    <PmPageShell
      title="Inspection findings log"
      description="All site walk photos — safe and at risk — with correction status and responsible companies."
      auth={{
        authLoading,
        authenticated,
        tokenReady,
        sessionExpired,
        signInMessage: "Sign in to load findings.",
      }}
    >
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {!log && !error ? (
        <p className="text-sm text-[var(--sf-text-muted)]">Loading findings log…</p>
      ) : null}

      <PmSurfaceCard className="overflow-x-auto p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-[var(--sf-text-muted)]">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Inspection</th>
              <th className="px-3 py-2">Location</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Company</th>
              <th className="px-3 py-2">Correction</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {log?.entries?.map((row) => (
              <tr key={row.id}>
                <td className="px-3 py-2 font-semibold">{row.photoNumber ?? "—"}</td>
                <td className="px-3 py-2">
                  <Link
                    href={`/pm/inspections/${row.inspectionId}/report${query}`}
                    className="text-[var(--sf-primary)] hover:underline"
                  >
                    {row.inspectionTitle ?? "Inspection"}
                  </Link>
                </td>
                <td className="px-3 py-2">{row.locationDescription || "—"}</td>
                <td className="px-3 py-2">{row.pictureDescription || "—"}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      row.safetyStatus === "at_risk"
                        ? "font-medium text-red-700"
                        : row.safetyStatus === "safe"
                          ? "text-green-700"
                          : ""
                    }
                  >
                    {row.safetyStatus === "at_risk"
                      ? "At risk"
                      : row.safetyStatus === "safe"
                        ? "Safe"
                        : "—"}
                  </span>
                </td>
                <td className="px-3 py-2">{row.responsibleCompanyName ?? "—"}</td>
                <td className="px-3 py-2 capitalize">
                  {row.correctionPhotoDataUrl
                    ? "Proof received"
                    : row.dispatchStatus?.replace(/_/g, " ") ?? "—"}
                </td>
              </tr>
            ))}
            {log && !log.entries?.length ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-[var(--sf-text-muted)]">
                  No findings logged yet. Complete a Smart Site Inspection to populate this log.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </PmSurfaceCard>
    </PmPageShell>
  );
}
