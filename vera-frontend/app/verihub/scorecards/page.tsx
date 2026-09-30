"use client";

import { useState } from "react";
import { VeriHubConsoleShell } from "@/src/components/verihub/VeriHubConsoleShell";
import { Button } from "@/components/ui";
import {
  ComplianceScoreSection,
  ProjectScoreSection,
  ScorecardBreakdown,
  ScorecardOverview,
} from "@/src/components/scorecards";
import { useScorecard, veriforgeMutations } from "@/lib/veriforge-hooks";
import { getVeriHubSession } from "@/lib/verihub-org-api";

export default function VeriHubScorecardsPage() {
  const { data: view, error, loading, reload } = useScorecard();
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function onRecalculate() {
    setBusy(true);
    setActionError(null);
    try {
      await veriforgeMutations.recalculateSafetyScorecard(
        getVeriHubSession()?.orgId,
      );
      await reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Recalculation failed");
    } finally {
      setBusy(false);
    }
  }

  const projects = Array.isArray(
    (view as { projectScores?: unknown } | null)?.projectScores,
  )
    ? ((view as { projectScores: Array<Record<string, unknown>> }).projectScores)
    : [];

  return (
    <VeriHubConsoleShell
      title="Scorecards"
      description="Contractor safety scorecard with compliance artifact weighting."
      actions={
        <Button type="button" variant="outline" disabled={busy} onClick={onRecalculate}>
          {busy ? "Recalculating…" : "Recalculate"}
        </Button>
      }
    >
      {error || actionError ? (
        <p className="mb-4 text-sm text-red-600">{error ?? actionError}</p>
      ) : null}
      {loading || !view ? (
        <p className="text-sm text-zinc-600">Loading scorecard…</p>
      ) : (
        <div className="space-y-6">
          <ScorecardOverview view={view} />
          <ComplianceScoreSection view={view} />
          <ScorecardBreakdown view={view} />
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-600">
              Project scores
            </h2>
            <ProjectScoreSection projects={projects} />
          </section>
        </div>
      )}
    </VeriHubConsoleShell>
  );
}
