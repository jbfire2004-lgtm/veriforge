"use client";

import { Check } from "lucide-react";
import { sfCn } from "@/src/components/safety-forms/theme/cn";
import type { SmsWorkflowStep } from "./steps";

type Props = {
  steps: SmsWorkflowStep[];
  activeStep: string;
  onStepChange: (step: string) => void;
  className?: string;
};

/**
 * Workflow step navigation — vertical grid on mobile (no horizontal scroll),
 * compact grid on larger screens. Minimum 44px tap targets.
 */
export function SmsWorkflowStepNav({
  steps,
  activeStep,
  onStepChange,
  className,
}: Props) {
  const activeIndex = steps.findIndex((s) => s.id === activeStep);

  return (
    <nav aria-label="Workflow steps" className={className}>
      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => {
          const selected = step.id === activeStep;
          const completed = activeIndex >= 0 && index < activeIndex;
          const label = step.shortLabel ?? step.label;

          return (
            <li key={step.id}>
              <button
                type="button"
                role="tab"
                aria-selected={selected}
                aria-current={selected ? "step" : undefined}
                onClick={() => onStepChange(step.id)}
                className={sfCn(
                  "sms-tap-target flex w-full items-center gap-3 rounded-[var(--sf-radius-lg)] border px-3 py-2.5 text-left transition-colors",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sms-secondary)]",
                  selected
                    ? "border-[var(--sms-secondary)] bg-[var(--sms-secondary-muted)] shadow-[var(--sf-shadow-sm)]"
                    : "border-[var(--sf-border)] bg-[var(--sf-surface)] hover:bg-[var(--sf-surface-hover)]",
                )}
              >
                <span
                  className={sfCn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    selected
                      ? "bg-[var(--sms-secondary)] text-white"
                      : completed
                        ? "bg-[var(--sf-success)]/15 text-[var(--sf-success)]"
                        : "bg-[var(--sf-surface-hover)] text-[var(--sf-text-muted)]",
                  )}
                  aria-hidden
                >
                  {completed ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={sfCn(
                      "block truncate text-sm font-medium",
                      selected ? "text-[var(--sf-text)]" : "text-[var(--sf-text-muted)]",
                    )}
                  >
                    <span className="sm:hidden">{label}</span>
                    <span className="hidden sm:inline">{step.label}</span>
                  </span>
                  {selected && step.description ? (
                    <span className="mt-0.5 block truncate text-xs text-[var(--sf-text-muted)]">
                      {step.description}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
