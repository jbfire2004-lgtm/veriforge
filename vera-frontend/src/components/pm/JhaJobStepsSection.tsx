"use client";

import { Plus, Trash2 } from "lucide-react";
import type { JobStep } from "@/src/screens/pm/jha-flha/jha-flha-templates";
import { SfButton, SfInput } from "@/src/components/safety-forms/ui";

type Props = {
  steps: JobStep[];
  onChange: (steps: JobStep[]) => void;
  disabled?: boolean;
  selectedStepId: string;
  onSelectStep: (id: string) => void;
};

function newStep(sortOrder: number): JobStep {
  return {
    id: crypto.randomUUID(),
    description: "",
    sortOrder,
  };
}

export function JhaJobStepsSection({
  steps,
  onChange,
  disabled,
  selectedStepId,
  onSelectStep,
}: Props) {
  function addStep() {
    const step = newStep(steps.length);
    onChange([...steps, step]);
    onSelectStep(step.id);
  }

  function updateStep(id: string, description: string) {
    onChange(steps.map((s) => (s.id === id ? { ...s, description } : s)));
  }

  function removeStep(id: string) {
    const next = steps.filter((s) => s.id !== id).map((s, i) => ({ ...s, sortOrder: i }));
    onChange(next);
    if (selectedStepId === id && next.length > 0) onSelectStep(next[0].id);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--sf-text-muted)]">
        Break the job into logical steps (CCOHS recommends fewer than 10). Hazards in the next
        section are linked to the selected step.
      </p>
      {steps.length === 0 ? (
        <p className="text-sm text-[var(--sf-text-muted)]">No steps yet — add the first step.</p>
      ) : (
        <ol className="space-y-2">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className={`flex flex-wrap items-center gap-2 rounded-lg border p-3 ${
                selectedStepId === step.id
                  ? "border-[var(--sf-primary)] bg-[var(--sf-primary-muted)]/40"
                  : "border-[var(--sf-border)]"
              }`}
            >
              <button
                type="button"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--sf-surface-muted)] text-xs font-semibold"
                onClick={() => onSelectStep(step.id)}
                disabled={disabled}
              >
                {index + 1}
              </button>
              <SfInput
                className="min-w-0 flex-1"
                placeholder={`Step ${index + 1} — describe the task action`}
                value={step.description}
                onChange={(e) => updateStep(step.id, e.target.value)}
                disabled={disabled}
              />
              <SfButton
                variant="secondary"
                type="button"
                disabled={disabled}
                onClick={() => removeStep(step.id)}
                aria-label={`Remove step ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </SfButton>
            </li>
          ))}
        </ol>
      )}
      <SfButton type="button" variant="secondary" disabled={disabled} onClick={addStep}>
        <Plus className="mr-1 h-4 w-4" />
        Add step
      </SfButton>
    </div>
  );
}
