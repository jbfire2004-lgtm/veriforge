"use client";

import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { Session } from "next-auth";
import { TrainingStatusBadge } from "@/components/training";
import {
  applySupervisorOverride,
  evaluatePermitToWork,
  hasSupervisorOverride,
  suggestSmartPermit,
  type PermitAiSuggestResult,
  type PermitAiSuggestionItem,
  type PermitToWorkAiResult,
} from "@/lib/pm-permit-ai";
import type { PermitTypeDefinition, PermitWorkflow } from "@/lib/pm-permits";
import { apiLoadErrorMessage } from "@/lib/network-error-message";
import { SfButton, SfCard, SfInput } from "@/src/components/safety-forms/ui";
import { SfFloatingTextarea } from "@/src/components/safety-forms/ui/SfFloatingTextarea";

type Props = {
  companyId: number;
  projectId: number;
  typeDef: PermitTypeDefinition;
  workflow: PermitWorkflow;
  session?: Session | null;
  tokenReady?: boolean;
  disabled?: boolean;
  onApply: (patch: {
    title?: string;
    workflow: PermitWorkflow;
  }) => void;
};

function SuggestionList({
  label,
  items,
  disabled,
  onToggle,
}: {
  label: string;
  items: PermitAiSuggestionItem[];
  disabled?: boolean;
  onToggle: (key: string, selected: boolean) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--sf-border)] px-3 py-2"
          >
            <label className="flex flex-1 cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                className="mt-1"
                checked={item.selected}
                disabled={disabled}
                onChange={(e) => onToggle(item.key, e.target.checked)}
              />
              <span>
                {item.label}
                <span className="mt-0.5 block text-xs text-[var(--sf-text-muted)]">
                  {Math.round(item.confidence * 100)}% · {item.source.replace(/_/g, " ")}
                  {item.reason ? ` · ${item.reason}` : ""}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SmartPermitPanel({
  companyId,
  projectId,
  typeDef,
  workflow,
  session,
  tokenReady = true,
  disabled,
  onApply,
}: Props) {
  const [jobScope, setJobScope] = useState(workflow.jobScope ?? "");
  const [workerId, setWorkerId] = useState(
    workflow.workerId != null ? String(workflow.workerId) : "",
  );
  const [locationNote, setLocationNote] = useState("");
  const [weatherNote, setWeatherNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PermitAiSuggestResult | null>(null);
  const [hazards, setHazards] = useState<PermitAiSuggestionItem[]>([]);
  const [controls, setControls] = useState<PermitAiSuggestionItem[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, unknown>>({});
  const [overrideReasons, setOverrideReasons] = useState<Record<string, string>>({});
  const [evalLoading, setEvalLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<PermitToWorkAiResult | null>(null);

  const draftWorkflow = useMemo((): PermitWorkflow => {
    let next: PermitWorkflow = {
      ...workflow,
      jobScope,
      workerId: workerId ? Number(workerId) : undefined,
      fieldValues,
      hazards: hazards.filter((h) => h.selected).map((h) => h.key),
      controls: controls.filter((c) => c.selected).map((c) => c.key),
      aiGenerated: true,
      aiSuggestionSummary: result?.message,
    };
    for (const block of result?.overridableBlocks ?? []) {
      if (block.blocked && overrideReasons[block.id]?.trim()) {
        next = applySupervisorOverride(next, block.id, overrideReasons[block.id]);
      }
    }
    return next;
  }, [workflow, jobScope, workerId, fieldValues, hazards, controls, result, overrideReasons]);

  async function runEvaluation() {
    if (!jobScope.trim()) {
      setError("Enter a job scope before evaluating.");
      return;
    }
    setEvalLoading(true);
    setError(null);
    try {
      const row = await evaluatePermitToWork(
        companyId,
        projectId,
        {
          permitType: String(typeDef.permitType),
          jobScope: jobScope.trim(),
          workerId: workerId ? Number(workerId) : undefined,
          locationNote: locationNote.trim() || undefined,
          weatherNote: weatherNote.trim() || undefined,
          fieldValues,
          attendantAssigned: Boolean(fieldValues.attendant),
        },
        session,
      );
      setEvaluation(row);
    } catch (e) {
      setError(apiLoadErrorMessage(e, "Permit-to-work evaluation failed"));
    } finally {
      setEvalLoading(false);
    }
  }

  async function generate() {
    if (!jobScope.trim()) {
      setError("Enter a job scope before generating.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const row = await suggestSmartPermit(
        companyId,
        projectId,
        {
          permitType: String(typeDef.permitType),
          jobScope: jobScope.trim(),
          workerId: workerId ? Number(workerId) : undefined,
          locationNote: locationNote.trim() || undefined,
          weatherNote: weatherNote.trim() || undefined,
        },
        session,
      );
      setResult(row);
      setHazards(row.hazards);
      setControls(row.controls);
      setFieldValues(row.fieldValues);
    } catch (e) {
      setError(apiLoadErrorMessage(e, "Smart permit generation failed"));
    } finally {
      setLoading(false);
    }
  }

  function applySuggestions() {
    onApply({
      title: result?.suggestedTitle,
      workflow: draftWorkflow,
    });
  }

  return (
    <SfCard className="space-y-4 border-indigo-200 bg-indigo-50/30 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-medium text-indigo-950">Smart permit assistant</h2>
          <p className="text-xs text-indigo-900">
            AI reads job scope, suggests hazards and controls, validates training and equipment.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SfButton
            type="button"
            variant="secondary"
            disabled={disabled || loading || !tokenReady || !jobScope.trim()}
            onClick={() => void generate()}
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            {loading ? "Generating…" : "Generate Smart Permit"}
          </SfButton>
          <SfButton
            type="button"
            variant="secondary"
            disabled={disabled || evalLoading || !tokenReady || !jobScope.trim()}
            onClick={() => void runEvaluation()}
          >
            {evalLoading ? "Evaluating…" : "Evaluate permit-to-work"}
          </SfButton>
        </div>
      </div>

      <SfFloatingTextarea
        label="Job scope for AI analysis"
        value={jobScope}
        onChange={(e) => setJobScope(e.target.value)}
        disabled={disabled || loading}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <SfInput
          label="Worker ID (optional)"
          type="number"
          value={workerId}
          onChange={(e) => setWorkerId(e.target.value)}
          disabled={disabled || loading}
        />
        <SfInput
          label="Location note (optional)"
          value={locationNote}
          onChange={(e) => setLocationNote(e.target.value)}
          disabled={disabled || loading}
        />
      </div>
      <SfInput
        label="Weather note (optional)"
        value={weatherNote}
        onChange={(e) => setWeatherNote(e.target.value)}
        disabled={disabled || loading}
      />

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {evalLoading ? (
        <p className="text-sm text-indigo-800">Validating requirements, qualifications, and conflicts…</p>
      ) : null}

      {evaluation ? (
        <div className="space-y-3 rounded-lg border border-violet-200 bg-violet-50/50 p-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-violet-950">{evaluation.permit_type}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                evaluation.final_permit_status === "APPROVED"
                  ? "bg-emerald-100 text-emerald-900"
                  : evaluation.final_permit_status === "REJECTED"
                    ? "bg-red-100 text-red-900"
                    : evaluation.final_permit_status === "CONDITIONAL"
                      ? "bg-amber-100 text-amber-900"
                      : "bg-slate-100 text-slate-800"
              }`}
            >
              {evaluation.final_permit_status}
            </span>
          </div>
          <p className="text-xs text-violet-900">{evaluation.field_summary}</p>

          {evaluation.high_risk_flags.length > 0 ? (
            <div className="rounded border border-red-200 bg-red-50 p-2">
              <p className="text-xs font-semibold uppercase text-red-900">High-risk conditions</p>
              <ul className="mt-1 list-disc pl-4 text-xs text-red-800">
                {evaluation.high_risk_flags.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {evaluation.conflicts_detected.length > 0 ? (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-violet-800">Conflicts</p>
              <ul className="space-y-1 text-xs">
                {evaluation.conflicts_detected.slice(0, 6).map((c) => (
                  <li key={c.code} className="rounded border border-violet-100 bg-white px-2 py-1">
                    [{c.severity}] {c.description}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {evaluation.recommended_controls.length > 0 ? (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-violet-800">Recommended controls</p>
              <ul className="space-y-1 text-xs">
                {evaluation.recommended_controls.slice(0, 5).map((c) => (
                  <li key={c.description} className="rounded border border-teal-100 bg-white px-2 py-1">
                    <span className="font-medium capitalize">{c.hierarchy}</span> — {c.description}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-indigo-800">Analyzing scope, hazards, training, and equipment…</p>
      ) : null}

      {result ? (
        <div className="space-y-4 rounded-lg border border-indigo-200 bg-white p-4">
          <p className="text-xs text-[var(--sf-text-muted)]">{result.message}</p>

          <SuggestionList
            label="Suggested hazards"
            items={hazards}
            disabled={disabled}
            onToggle={(key, selected) =>
              setHazards((prev) =>
                prev.map((h) => (h.key === key ? { ...h, selected } : h)),
              )
            }
          />

          <SuggestionList
            label="Suggested controls"
            items={controls}
            disabled={disabled}
            onToggle={(key, selected) =>
              setControls((prev) =>
                prev.map((c) => (c.key === key ? { ...c, selected } : c)),
              )
            }
          />

          {Object.keys(fieldValues).length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-medium">Pre-filled permit fields</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(fieldValues).map(([key, value]) => (
                  <SfInput
                    key={key}
                    label={key.replace(/_/g, " ")}
                    value={String(value ?? "")}
                    onChange={(e) =>
                      setFieldValues((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    disabled={disabled}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {result.training.requirements.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-medium">Training validation</p>
              <p className="mb-2 text-xs text-[var(--sf-text-muted)]">{result.training.message}</p>
              <ul className="space-y-1 text-sm">
                {result.training.requirements.map((req) => (
                  <li key={req.code} className="flex items-center justify-between gap-2">
                    <span>{req.name}</span>
                    <TrainingStatusBadge status={req.status} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.equipment.items.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-medium">Equipment certifications</p>
              <p className="mb-2 text-xs text-[var(--sf-text-muted)]">{result.equipment.message}</p>
              <ul className="space-y-1 text-sm">
                {result.equipment.items.map((item) => (
                  <li key={item.equipmentId} className="flex items-center justify-between gap-2">
                    <span>{item.name}</span>
                    <TrainingStatusBadge status={item.status === "valid" ? "valid" : "missing"} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <SfCard className="p-3 text-sm">
              <p className="font-medium">Weather (stub)</p>
              <p className="text-[var(--sf-text-muted)]">{result.weather.summary}</p>
            </SfCard>
            <SfCard className="p-3 text-sm">
              <p className="font-medium">Incidents (stub)</p>
              <p className="text-[var(--sf-text-muted)]">
                {result.incidents.recentCount} recent ·{" "}
                {result.incidents.proceed ? "No block" : "Review required"}
              </p>
            </SfCard>
          </div>

          {result.overridableBlocks.some((b) => b.blocked) ? (
            <div className="space-y-3 rounded border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-medium text-amber-950">Supervisor overrides</p>
              {result.overridableBlocks
                .filter((b) => b.blocked)
                .map((block) => (
                  <div key={block.id} className="space-y-2">
                    <p className="text-xs text-amber-900">
                      {block.label}: {block.message}
                    </p>
                    <SfInput
                      label={`Override reason (${block.label})`}
                      value={overrideReasons[block.id] ?? ""}
                      onChange={(e) =>
                        setOverrideReasons((prev) => ({
                          ...prev,
                          [block.id]: e.target.value,
                        }))
                      }
                      disabled={disabled}
                    />
                    {hasSupervisorOverride(draftWorkflow, block.id) ? (
                      <p className="text-xs text-emerald-700">Override recorded for submit.</p>
                    ) : null}
                  </div>
                ))}
            </div>
          ) : null}

          {result.warnings.length > 0 ? (
            <ul className="list-disc pl-5 text-xs text-[var(--sf-text-muted)]">
              {result.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}

          <SfButton type="button" disabled={disabled} onClick={applySuggestions}>
            Apply suggestions to permit
          </SfButton>
        </div>
      ) : null}
    </SfCard>
  );
}
