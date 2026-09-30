"use client";

import { useCallback, useState } from "react";
import { FileText } from "lucide-react";
import {
  generateSafetyContent,
  SAFETY_CONTENT_TYPES,
  type SafetyContentGeneratorResult,
  type SafetyContentType,
} from "@/lib/safety-content-generator-ai";
import { SfButton } from "@/src/components/safety-forms/ui";

type SafetyContentGeneratorPanelProps = {
  companyId: number;
  projectId?: number;
  defaultTask?: string;
  defaultContentType?: SafetyContentType;
};

export function SafetyContentGeneratorPanel({
  companyId,
  projectId,
  defaultTask = "",
  defaultContentType = "jha_template",
}: SafetyContentGeneratorPanelProps) {
  const [contentType, setContentType] = useState<SafetyContentType>(defaultContentType);
  const [task, setTask] = useState(defaultTask);
  const [result, setResult] = useState<SafetyContentGeneratorResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReadable, setShowReadable] = useState(false);

  const run = useCallback(() => {
    if (!task.trim()) return;
    setBusy(true);
    setError(null);
    void generateSafetyContent({
      contentType,
      task: task.trim(),
      companyId,
      projectId,
    })
      .then(setResult)
      .catch((e) => setError(e instanceof Error ? e.message : "Content generation failed"))
      .finally(() => setBusy(false));
  }, [contentType, task, companyId, projectId]);

  return (
    <div className="space-y-4 rounded-lg border border-emerald-200 bg-emerald-50/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-emerald-900" />
          <h2 className="font-medium text-emerald-950">Safety Content Generator</h2>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium text-emerald-900">Content type</span>
          <select
            className="w-full rounded border border-emerald-200 bg-white px-3 py-2 text-sm"
            value={contentType}
            onChange={(e) => setContentType(e.target.value as SafetyContentType)}
          >
            {SAFETY_CONTENT_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-emerald-900">Task / topic</span>
          <textarea
            className="w-full rounded border border-emerald-200 bg-white px-3 py-2 text-sm"
            rows={2}
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Describe the work activity or safety topic…"
          />
        </label>
      </div>

      <SfButton type="button" size="sm" variant="secondary" disabled={busy || !task.trim()} onClick={() => void run()}>
        {busy ? "Generating…" : "Generate content"}
      </SfButton>

      {error ? <p className="text-xs text-red-700" role="alert">{error}</p> : null}

      {result ? (
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-emerald-950">{result.content.title}</p>
            <p className="text-xs text-emerald-900">{result.content.summary}</p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-emerald-800">
            <span>{result.content.hazards.length} hazards</span>
            <span>{result.content.controls.length} controls</span>
            <span>{result.content.required_training.length} training items</span>
            <span>{result.content.evidence_placeholders.length} evidence fields</span>
          </div>

          <div className="space-y-2">
            {result.content.sections.slice(0, 4).map((section) => (
              <div key={section.id} className="rounded border border-emerald-100 bg-white p-3">
                <p className="font-medium text-emerald-950">{section.title}</p>
                <p className="mt-1 whitespace-pre-wrap text-xs text-slate-700">{section.body.slice(0, 280)}{section.body.length > 280 ? "…" : ""}</p>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="text-xs font-medium text-emerald-800 underline"
            onClick={() => setShowReadable((v) => !v)}
          >
            {showReadable ? "Hide" : "Show"} human-readable text
          </button>

          {showReadable ? (
            <pre className="max-h-64 overflow-auto rounded border border-slate-200 bg-white p-3 text-xs whitespace-pre-wrap">
              {result.human_readable}
            </pre>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
