"use client";

import { ArrowLeft, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  runVsiCopilot,
  type CopilotRunResponse,
  type VsiCopilotModule,
} from "@/lib/safety-intelligence";
import {
  SfButton,
  SfCard,
  SfFloatingInput,
  SfFloatingTextarea,
} from "@/src/components/safety-forms/ui";

const MODULES: Array<{ value: VsiCopilotModule; label: string }> = [
  { value: "inspection", label: "Inspection" },
  { value: "bbo", label: "BBO" },
  { value: "incident", label: "Incident" },
  { value: "equipment", label: "Equipment" },
  { value: "form_hazard", label: "Form hazard" },
  { value: "lessons_learned", label: "Lessons learned" },
  { value: "presentation", label: "Presentation" },
  { value: "predictive_risk", label: "Predictive risk" },
  { value: "cail_analyze", label: "CAIL analyze" },
];

const DEFAULT_CONTEXT: Record<VsiCopilotModule, string> = {
  inspection: JSON.stringify(
    {
      caption: "Worker on ladder without tie-off near open edge",
      polarity: "at_risk",
    },
    null,
    2,
  ),
  bbo: JSON.stringify(
    {
      behaviorDescription: "Crew bypassed barricade to access trench",
      polarity: "at_risk",
      severity: "high",
    },
    null,
    2,
  ),
  incident: JSON.stringify(
    {
      title: "Near miss — dropped material from scaffold",
      description: "4x4 lumber fell from third level, no injuries",
      severity: "HIGH",
    },
    null,
    2,
  ),
  equipment: JSON.stringify(
    {
      failureMode: "Hydraulic leak on telehandler",
      title: "Failed checklist: fluid_levels",
    },
    null,
    2,
  ),
  form_hazard: JSON.stringify(
    {
      title: "FLHA — inadequate fall protection",
      formName: "Field Level Hazard Assessment",
      missingControls: ["guardrails", "harness anchor"],
    },
    null,
    2,
  ),
  lessons_learned: JSON.stringify(
    {
      title: "Verified: trench access control",
      rootCauseNotes: "Barricade removed during material delivery",
      correctiveAction: "Install designated delivery gate with spotter",
    },
    null,
    2,
  ),
  presentation: JSON.stringify(
    {
      openCailCount: 12,
      overdueCailCount: 3,
      atRiskBboCount: 5,
    },
    null,
    2,
  ),
  predictive_risk: JSON.stringify(
    {
      openCailCount: 12,
      overdueCailCount: 3,
      incidentCount: 1,
      companyHotspots: ["Company 2: 4 items (behavior)"],
    },
    null,
    2,
  ),
  cail_analyze: JSON.stringify(
    {
      title: "Open trench without shoring",
      description: "Observed during walk-around",
      sourceType: "inspection",
    },
    null,
    2,
  ),
};

export default function VsiCopilotDevPage() {
  const [module, setModule] = useState<VsiCopilotModule>("inspection");
  const [projectId, setProjectId] = useState("1");
  const [companyId, setCompanyId] = useState("");
  const [contextJson, setContextJson] = useState(DEFAULT_CONTEXT.inspection);
  const [result, setResult] = useState<CopilotRunResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const parsedIds = useMemo(() => {
    const p = Number(projectId);
    const c = Number(companyId);
    return {
      projectId: Number.isSafeInteger(p) && p > 0 ? p : undefined,
      companyId: Number.isSafeInteger(c) && c > 0 ? c : undefined,
    };
  }, [projectId, companyId]);

  function onModuleChange(next: VsiCopilotModule) {
    setModule(next);
    setContextJson(DEFAULT_CONTEXT[next]);
    setResult(null);
    setError(null);
  }

  async function onRun() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      let context: Record<string, unknown>;
      try {
        context = JSON.parse(contextJson) as Record<string, unknown>;
      } catch {
        throw new Error("Context must be valid JSON");
      }
      const res = await runVsiCopilot({
        module,
        projectId: parsedIds.projectId,
        companyId: parsedIds.companyId,
        context,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Copilot run failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      <Link
        href="/pm/safety-intelligence"
        className="inline-flex items-center gap-1 text-sm text-[var(--sf-text-muted)] hover:text-[var(--sf-primary)]"
      >
        <ArrowLeft className="h-4 w-4" />
        CAIL
      </Link>

      <header className="space-y-2">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--sf-primary)]">
          <Sparkles className="h-4 w-4" />
          Copilot dev harness
        </p>
        <h1 className="text-2xl font-semibold text-[var(--sf-text)]">
          VSI Copilot engine
        </h1>
        <p className="text-sm text-[var(--sf-text-muted)]">
          Calls <code className="text-xs">POST /ai/copilot/run</code> with module
          JSON. Use for integration testing — production emits also auto-enrich
          CAIL on create.
        </p>
      </header>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <SfCard className="space-y-4 p-6">
        <label className="block text-sm font-medium text-[var(--sf-text)]">
          Module
        </label>
        <select
          className="w-full rounded-lg border border-[var(--sf-border)] bg-[var(--sf-surface)] px-3 py-2 text-sm"
          value={module}
          onChange={(e) => onModuleChange(e.target.value as VsiCopilotModule)}
        >
          {MODULES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <div className="grid gap-4 sm:grid-cols-2">
          <SfFloatingInput
            label="Project ID (optional)"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          />
          <SfFloatingInput
            label="Company ID (optional)"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
          />
        </div>

        <SfFloatingTextarea
          label="Context (JSON)"
          value={contextJson}
          onChange={(e) => setContextJson(e.target.value)}
          rows={12}
        />

        <SfButton type="button" disabled={busy} onClick={() => void onRun()}>
          <Play className="h-4 w-4" />
          {busy ? "Running…" : "Run Copilot"}
        </SfButton>
      </SfCard>

      {result && (
        <SfCard className="space-y-3 p-6">
          <p className="text-sm font-medium text-[var(--sf-text)]">
            Engine: {result.engine.join(" → ")}
          </p>
          <pre className="max-h-[480px] overflow-auto rounded-lg bg-[var(--sf-surface-muted)] p-4 text-xs text-[var(--sf-text)]">
            {JSON.stringify(result, null, 2)}
          </pre>
        </SfCard>
      )}
    </div>
  );
}
