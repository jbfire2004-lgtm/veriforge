"use client";

import { Sparkles } from "lucide-react";
import { SfButton } from "@/src/components/safety-forms/ui";
import type { ScoredControlSuggestion, ScoredHazardSuggestion } from "@/lib/hazard-control-catalog";
import type { AiHazardIdentifyResult } from "@/lib/jha-ai-suggestions";

type JhaAutoSuggestPanelProps = {
  taskDescription: string;
  editable: boolean;
  saving?: boolean;
  suggestLoading?: boolean;
  suggestError?: string | null;
  matchedTaskProfiles?: string[];
  taskHazardSuggestions: ScoredHazardSuggestion[];
  hazardControlSuggestions: ScoredControlSuggestion[];
  suggestionLimit?: number;
  aiLoading?: boolean;
  aiError?: string | null;
  aiResult?: AiHazardIdentifyResult | null;
  onRunAiIdentify?: () => void;
  onAddHazard: (h: ScoredHazardSuggestion) => void;
  onAddControl: (c: ScoredControlSuggestion) => void;
  selectedHazardId?: string | null;
};

export function JhaAutoSuggestPanel({
  taskDescription,
  editable,
  saving,
  suggestLoading,
  suggestError,
  matchedTaskProfiles = [],
  taskHazardSuggestions,
  hazardControlSuggestions,
  suggestionLimit = 8,
  aiLoading,
  aiError,
  aiResult,
  onRunAiIdentify,
  onAddHazard,
  onAddControl,
  selectedHazardId,
}: JhaAutoSuggestPanelProps) {
  if (!taskDescription.trim()) return null;

  return (
    <div className="space-y-3 rounded-lg border border-indigo-200 bg-indigo-50/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium text-indigo-950">Smart suggestions</h2>
        <div className="flex items-center gap-2">
          {suggestLoading ? (
            <span className="text-xs text-indigo-700">Analyzing task…</span>
          ) : null}
          {onRunAiIdentify ? (
            <SfButton
              type="button"
              size="sm"
              variant="secondary"
              disabled={!editable || saving || aiLoading}
              onClick={() => void onRunAiIdentify()}
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              {aiLoading ? "AI analyzing…" : "AI identify hazards"}
            </SfButton>
          ) : null}
        </div>
      </div>

      <p className="text-xs text-indigo-900">
        {matchedTaskProfiles.length
          ? `Matched task profiles: ${matchedTaskProfiles.join(", ")}.`
          : "Enter task details (equipment, environment, work type) to match industry hazard profiles."}
      </p>

      {aiResult?.message ? (
        <p className="rounded border border-indigo-200 bg-white px-3 py-2 text-xs text-indigo-800">
          {aiResult.message}
        </p>
      ) : null}

      {suggestError || aiError ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          {aiError ?? suggestError}
        </p>
      ) : null}

      {editable && taskHazardSuggestions.length > 0 ? (
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase text-indigo-800">
            Suggested hazards (from task)
          </p>
          <div className="flex flex-wrap gap-2">
            {taskHazardSuggestions.slice(0, suggestionLimit).map((h) => (
              <button
                key={h.id ?? h.description}
                type="button"
                disabled={saving}
                title={h.reason}
                className="rounded-full border border-indigo-300 bg-white px-3 py-1 text-xs font-medium text-indigo-950 hover:bg-indigo-100 disabled:opacity-50"
                onClick={() => onAddHazard(h)}
              >
                + {h.description.slice(0, 48)}
                {h.description.length > 48 ? "…" : ""}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {editable && hazardControlSuggestions.length > 0 ? (
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase text-indigo-800">
            Suggested controls (from selected hazards)
          </p>
          <div className="flex flex-wrap gap-2">
            {hazardControlSuggestions.slice(0, suggestionLimit).map((c) => (
              <button
                key={c.id ?? c.description}
                type="button"
                disabled={saving || !selectedHazardId}
                title={c.reason}
                className="rounded-full border border-teal-300 bg-white px-3 py-1 text-xs font-medium text-teal-950 hover:bg-teal-100 disabled:opacity-50"
                onClick={() => onAddControl(c)}
              >
                + [{c.controlClass === "direct" ? "Direct" : "Alt"}]{" "}
                {c.description.slice(0, 40)}
                {c.description.length > 40 ? "…" : ""}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {!suggestLoading &&
      !taskHazardSuggestions.length &&
      !hazardControlSuggestions.length &&
      !suggestError ? (
        <p className="text-xs text-indigo-800">
          No suggestions yet — refine the task description or add hazards to unlock control
          recommendations.
        </p>
      ) : null}
    </div>
  );
}
