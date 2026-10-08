"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchVsiIncidents, type VsiIncidentSummary } from "@/lib/safety-intelligence";
import { useVeraAuthOrHook } from "@/contexts/VeraAuthContext";
import { PmLoadingState, PmPageShell } from "@/src/components/pm/layout";
import { SfButton, SfCard, SfFloatingInput } from "@/src/components/safety-forms/ui";

export default function IncidentsListPage() {
  const { session, authLoading, authenticated, tokenReady, sessionExpired } =
    useVeraAuthOrHook();
  const [rows, setRows] = useState<VsiIncidentSummary[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [projectId, setProjectId] = useState("1");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const parsedCompany = useMemo(() => {
    const n = Number(companyId);
    return Number.isSafeInteger(n) && n > 0 ? n : undefined;
  }, [companyId]);

  useEffect(() => {
    if (authLoading || !tokenReady) return;
    setLoading(true);
    setLoadError(null);
    fetchVsiIncidents({ companyId: parsedCompany }, { session })
      .then(setRows)
      .catch((e) => {
        setRows([]);
        setLoadError(e instanceof Error ? e.message : "Could not load incidents.");
      })
      .finally(() => setLoading(false));
  }, [parsedCompany, authLoading, tokenReady, session]);

  return (
    <PmPageShell
      title="Incidents"
      description="Open investigations and generate AI CAPA packs linked to CAIL."
      auth={{
        authLoading,
        authenticated,
        tokenReady,
        sessionExpired,
        signInMessage: "Sign in to load incidents.",
      }}
    >
      <SfCard className="flex flex-wrap gap-4 p-6">
        <SfFloatingInput
          label="Company ID filter"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="max-w-[160px]"
        />
        <SfFloatingInput
          label="Default project ID"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="max-w-[160px]"
        />
      </SfCard>

      {loadError ? (
        <p className="text-sm text-red-600" role="alert">
          {loadError}
        </p>
      ) : null}

      {loading ? (
        <PmLoadingState message="Loading incidents…" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-[var(--sf-text-muted)]">No incidents match your filters.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id}>
              <SfCard className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-[var(--sf-text-muted)]">
                    #{r.id} · {r.severity} · {r.status}
                    {r.hasInvestigation ? " · investigation open" : ""}
                  </p>
                </div>
                <Link
                  href={`/pm/safety-intelligence/incidents/${r.id}?projectId=${r.projectId ?? projectId}`}
                >
                  <SfButton type="button" variant="secondary">
                    {r.hasInvestigation ? "Continue" : "Investigate"}
                  </SfButton>
                </Link>
              </SfCard>
            </li>
          ))}
        </ul>
      )}
    </PmPageShell>
  );
}
