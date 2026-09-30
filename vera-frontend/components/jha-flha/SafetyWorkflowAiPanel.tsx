"use client";

import { useCallback, useState } from "react";
import { ShieldCheck, Sparkles } from "lucide-react";
import {
  analyzeSafetyWorkflow,
  type SafetyWorkflowAiResult,
  type SafetyWorkflowType,
} from "@/lib/safety-workflow-ai";
import { SfButton } from "@/src/components/safety-forms/ui";

type SafetyWorkflowAiPanelProps = {
  task: string;
  companyId: number;
  projectId: number;
  workflowType: SafetyWorkflowType;
  workerIds?: number[];
  taskSteps?: string[];
  workScope?: string;
  locationNote?: string;
  equipment?: string[];
  environment?: Record<string, unknown>;
  existingHazardDescriptions?: string[];
  existingControlDescriptions?: string[];
  editable?: boolean;
};

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-700 bg-emerald-100";
  if (score >= 60) return "text-amber-800 bg-amber-100";
  return "text-red-800 bg-red-100";
}

export function SafetyWorkflowAiPanel({
  task,
  companyId,
  projectId,
  workflowType,
  workerIds = [],
  taskSteps,
  workScope,
  locationNote,
  equipment,
  environment,
  existingHazardDescriptions,
  existingControlDescriptions,
  editable = true,
}: SafetyWorkflowAiPanelProps) {
  const [result, setResult] = useState<SafetyWorkflowAiResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(() => {
    if (!task.trim()) return;
    setBusy(true);
    setError(null);
    void analyzeSafetyWorkflow({
      task,
      companyId,
      projectId,
      workflowType,
      workerIds,
      taskSteps,
      workScope,
      locationNote,
      equipment,
      environment,
      existingHazardDescriptions,
      existingControlDescriptions,
    })
      .then(setResult)
      .catch((e) => setError(e instanceof Error ? e.message : "Safety analysis failed"))
      .finally(() => setBusy(false));
  }, [
    task,
    companyId,
    projectId,
    workflowType,
    workerIds,
    taskSteps,
    workScope,
    locationNote,
    equipment,
    environment,
    existingHazardDescriptions,
    existingControlDescriptions,
  ]);

  if (!task.trim()) return null;

  return (
    <div className="space-y-4 rounded-lg border border-violet-200 bg-violet-50/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-violet-800" />
          <h2 className="font-medium text-violet-950">Safety Workflow Intelligence</h2>
        </div>
        <SfButton
          type="button"
          size="sm"
          variant="secondary"
          disabled={!editable || busy}
          onClick={() => void run()}
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          {busy ? "Analyzing…" : "Run safety analysis"}
        </SfButton>
      </div>

      <p className="text-xs text-violet-900">
        Predicts hazards, maps controls (hierarchy), training, and crew readiness for{" "}
        {workflowType}.
      </p>

      {error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${scoreColor(result.safety_quality_score)}`}
            >
              Safety Quality Score: {result.safety_quality_score}/100
            </span>
            <span className="text-xs text-violet-800">
              {result.predicted_hazards.length} hazards · {result.recommended_controls.length}{" "}
              controls · {result.required_training.length} training
            </span>
          </div>

          <p className="text-xs text-violet-900">{result.field_summary}</p>

          {result.gaps.filter((g) => g.severity === "critical").length > 0 ? (
            <div className="rounded border border-red-200 bg-red-50 p-3">
              <p className="mb-1 text-xs font-semibold uppercase text-red-900">Critical gaps</p>
              <ul className="list-disc space-y-0.5 pl-4 text-xs text-red-800">
                {result.gaps
                  .filter((g) => g.severity === "critical")
                  .map((g) => (
                    <li key={`${g.type}-${g.description}`}>{g.description}</li>
                  ))}
              </ul>
            </div>
          ) : null}

          {result.predicted_hazards.length > 0 ? (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-violet-800">
                Predicted hazards
              </p>
              <ul className="space-y-1 text-xs">
                {result.predicted_hazards.slice(0, 6).map((h) => (
                  <li key={h.description} className="rounded border border-violet-100 bg-white px-2 py-1">
                    {h.description}
                    {h.sif_potential ? (
                      <span className="ml-2 rounded bg-red-100 px-1 text-[10px] font-semibold text-red-800">
                        SIF
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.recommended_controls.length > 0 ? (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-violet-800">
                Recommended controls
              </p>
              <ul className="space-y-1 text-xs">
                {result.recommended_controls.slice(0, 5).map((c) => (
                  <li key={c.description} className="rounded border border-teal-100 bg-white px-2 py-1">
                    <span className="font-medium capitalize text-teal-900">{c.hierarchy}</span>
                    {" — "}
                    {c.description}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.worker_readiness.length > 0 ? (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-violet-800">Crew readiness</p>
              <ul className="space-y-1 text-xs">
                {result.worker_readiness.map((w) => (
                  <li key={w.worker_id} className="rounded border border-slate-200 bg-white px-2 py-1">
                    <span className="font-medium">{w.worker_name}</span>
                    {" — "}
                    <span
                      className={
                        w.ready_for_task ? "text-emerald-700" : "text-amber-800"
                      }
                    >
                      {w.ready_for_task ? "Ready" : w.status}
                    </span>
                    {w.gaps.length > 0 ? (
                      <span className="text-slate-500"> ({w.gaps.length} gap(s))</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
