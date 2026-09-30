"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  evaluateUnifiedIntelGate,
  fetchUnifiedIntelDashboard,
  fetchUnifiedIntelPredictions,
  fetchUnifiedIntelRecommendations,
  fetchUnifiedIntelScores,
  fetchUnifiedIntelTrends,
  runUnifiedIntelBatch,
} from "@/lib/pm-unified-safety-intelligence";
import { VeraPageLayout } from "@/src/components/navigation";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

type Tab = "overview" | "predictions" | "scores" | "recommendations" | "gating" | "models";

export default function PmUnifiedSafetyIntelligenceDashboard({
  companyId = 1,
  projectId,
}: {
  companyId?: number;
  projectId?: number;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null);
  const [trends, setTrends] = useState<Record<string, unknown> | null>(null);
  const [predictions, setPredictions] = useState<Array<Record<string, unknown>>>([]);
  const [scores, setScores] = useState<Array<Record<string, unknown>>>([]);
  const [recommendations, setRecommendations] = useState<Array<Record<string, unknown>>>([]);
  const [gate, setGate] = useState<Record<string, unknown> | null>(null);

  const reload = useCallback(() => {
    void fetchUnifiedIntelDashboard(companyId, projectId).then(setDashboard).catch(() => undefined);
    void fetchUnifiedIntelTrends(companyId, projectId).then(setTrends).catch(() => undefined);
    void fetchUnifiedIntelPredictions(companyId, projectId).then(setPredictions).catch(() => undefined);
    void fetchUnifiedIntelScores(companyId, projectId).then(setScores).catch(() => undefined);
    void fetchUnifiedIntelRecommendations(companyId, projectId)
      .then(setRecommendations)
      .catch(() => undefined);
  }, [companyId, projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const metrics = dashboard?.metrics as Record<string, unknown> | undefined;
  const leading = trends?.leadingIndicators as Record<string, unknown> | undefined;

  async function runBatch() {
    if (!projectId) return;
    await runUnifiedIntelBatch(companyId, projectId);
    reload();
  }

  async function runGate() {
    if (!projectId) return;
    const r = await evaluateUnifiedIntelGate({ companyId, projectId });
    setGate(r);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "predictions", label: "Predictions" },
    { id: "scores", label: "Scores" },
    { id: "recommendations", label: "Recommendations" },
    { id: "gating", label: "Safety gating" },
    { id: "models", label: "Models" },
  ];

  return (
    <VeraPageLayout
      title="Unified safety intelligence (CAIL)"
      description={
        <>
          Deterministic rules + scoring — zero hallucination. Company #{companyId}
          {projectId ? ` · Project #${projectId}` : ""}.{" "}
          <Link href="/pm/safety-intelligence" className="text-[var(--sf-primary)] hover:underline">
            Legacy VSI hub →
          </Link>
        </>
      }
    >
      {metrics ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SfCard className="p-4">
            <p className="text-xs text-[var(--sf-text-muted)]">Company score</p>
            <p className="text-2xl font-semibold">{String(metrics.companySafetyScore ?? "—")}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs text-[var(--sf-text-muted)]">Project score</p>
            <p className="text-2xl font-semibold">{String(metrics.projectSafetyScore ?? "—")}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs text-[var(--sf-text-muted)]">Open recommendations</p>
            <p className="text-2xl font-semibold">{String(metrics.openRecommendations ?? 0)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs text-[var(--sf-text-muted)]">Predictions (7d)</p>
            <p className="text-2xl font-semibold">{String(metrics.predictions7d ?? 0)}</p>
          </SfCard>
        </div>
      ) : null}

      {leading ? (
        <SfCard className="p-4 text-sm">
          <h2 className="mb-2 font-medium">Leading indicators (30d)</h2>
          <ul className="text-[var(--sf-text-muted)]">
            <li>Predictions: {String(leading.predictions30d)}</li>
            <li>High risk: {String(leading.highRiskPredictions)}</li>
            <li>Inference runs: {String(leading.inferenceRuns30d)}</li>
          </ul>
        </SfCard>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1 text-sm ${
              tab === t.id
                ? "bg-[var(--sf-primary)] text-white"
                : "bg-[var(--sf-surface-muted)] text-[var(--sf-text-muted)]"
            }`}
          >
            {t.label}
          </button>
        ))}
        {projectId ? (
          <SfButton variant="secondary" className="ml-auto" onClick={() => void runBatch()}>
            Run batch inference
          </SfButton>
        ) : null}
      </div>

      {tab === "predictions" && (
        <SfCard className="p-4">
          <ul className="space-y-2 text-sm">
            {predictions.map((p) => (
              <li key={String(p.id)} className="flex justify-between border-b py-2">
                <span>
                  {String(p.predictionType)} · {String(p.entityType)} {String(p.entityId)}
                </span>
                <span>
                  {Math.round(Number(p.probability) * 100)}% · {String(p.riskLevel)}
                </span>
              </li>
            ))}
          </ul>
        </SfCard>
      )}

      {tab === "scores" && (
        <SfCard className="p-4">
          <ul className="space-y-2 text-sm">
            {scores.map((s) => (
              <li key={String(s.id)} className="flex justify-between border-b py-2">
                <span>
                  {String(s.scoreType)} · {String(s.entityType)} {String(s.entityId)}
                </span>
                <span className="font-medium">{String(s.score)}/100</span>
              </li>
            ))}
          </ul>
        </SfCard>
      )}

      {tab === "recommendations" && (
        <SfCard className="p-4">
          <ul className="space-y-3 text-sm">
            {recommendations.map((r) => (
              <li key={String(r.id)}>
                <p className="font-medium">{String(r.title)}</p>
                <p className="text-[var(--sf-text-muted)]">{String(r.reason)}</p>
                <p className="text-xs">
                  {String(r.recommendationType)} · confidence {Math.round(Number(r.confidence) * 100)}%
                </p>
              </li>
            ))}
          </ul>
        </SfCard>
      )}

      {tab === "gating" && (
        <SfCard className="space-y-3 p-4">
          <p className="text-sm text-[var(--sf-text-muted)]">
            Deterministic safety gating for worker/equipment access, task start, permits, JHA, PM scheduling.
          </p>
          {projectId ? (
            <SfButton variant="secondary" onClick={() => void runGate()}>
              Evaluate project gate
            </SfButton>
          ) : null}
          {gate ? (
            <div className="text-sm">
              <p className="font-medium">{gate.allowed ? "Allowed" : "Blocked"}</p>
              {Array.isArray(gate.blockers) ? (
                <ul className="mt-2 list-disc pl-5 text-[var(--sf-text-muted)]">
                  {(gate.blockers as string[]).map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </SfCard>
      )}

      {tab === "models" && (
        <SfCard className="p-4 text-sm text-[var(--sf-text-muted)]">
          <p>
            Active model: <strong>{String(dashboard?.modelKey ?? "deterministic_rules_v1")}</strong>
          </p>
          <p className="mt-2">
            Deploy and rollback via API <code>POST /models/:id/deploy</code> and{" "}
            <code>POST /models/:id/rollback</code> (supervisor+).
          </p>
        </SfCard>
      )}
    </VeraPageLayout>
  );
}
