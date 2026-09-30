"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/components/ui/button";
import type { WorkflowStepWireframe } from "@/lib/wireframes/workflows";

export type MultiStepFormProps = {
  steps: WorkflowStepWireframe[];
  currentStep: number;
  onStepChange?: (index: number) => void;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  isLastStep?: boolean;
  nextLabel?: string;
  backLabel?: string;
  submitLabel?: string;
  className?: string;
};

export function MultiStepForm({
  steps,
  currentStep,
  onStepChange,
  children,
  onBack,
  onNext,
  onSubmit,
  isLastStep,
  nextLabel = "Continue",
  backLabel = "Back",
  submitLabel = "Confirm",
  className,
}: MultiStepFormProps) {
  const last = isLastStep ?? currentStep >= steps.length - 1;

  return (
    <section className={cn("space-y-8", className)} aria-label="Multi-step form">
      <ol className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {steps.map((step, index) => {
          const done = index < currentStep;
          const active = index === currentStep;
          return (
            <li
              key={step.id}
              className={cn(
                "flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:text-center",
                index < steps.length - 1 && "sm:pr-4"
              )}
            >
              <button
                type="button"
                disabled={!onStepChange || index > currentStep}
                onClick={() => onStepChange?.(index)}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition",
                  done && "bg-[#4FAF6F] text-white",
                  active && !done && "bg-[var(--color-primary)] text-white ring-2 ring-[var(--color-primary)]/30",
                  !done && !active && "bg-[var(--muted)] text-[var(--muted-foreground)] ring-1 ring-[var(--border)]"
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
              </button>
              <span className="min-w-0 pt-0.5 sm:pt-2">
                <span
                  className={cn(
                    "block text-sm font-medium",
                    active ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
                  )}
                >
                  {step.title}
                </span>
                <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">{step.description}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        {children}
      </section>

      <footer className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={currentStep === 0 || !onBack}
        >
          {backLabel}
        </Button>
        {last ? (
          <Button type="button" variant="teal" onClick={onSubmit}>
            {submitLabel}
          </Button>
        ) : (
          <Button type="button" variant="teal" onClick={onNext}>
            {nextLabel}
          </Button>
        )}
      </footer>
    </section>
  );
}
