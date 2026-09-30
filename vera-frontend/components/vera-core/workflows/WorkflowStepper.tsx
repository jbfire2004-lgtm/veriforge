"use client";

import { Check } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { WorkflowStepWireframe } from "@/lib/wireframes/workflows";

export type WorkflowStepperProps = {
  steps: WorkflowStepWireframe[];
  currentStep: number;
  className?: string;
};

export function WorkflowStepper({ steps, currentStep, className }: WorkflowStepperProps) {
  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol className="flex flex-col gap-3 sm:flex-row sm:gap-6">
        {steps.map((step, index) => {
          const done = index < currentStep;
          const active = index === currentStep;
          return (
            <li key={step.id} className="flex items-center gap-3 sm:flex-1">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  done && "bg-[#4FAF6F] text-white",
                  active && !done && "bg-[var(--color-primary)] text-white",
                  !done && !active && "bg-[var(--muted)] text-[var(--muted-foreground)] ring-1 ring-[var(--border)]"
                )}
                aria-hidden
              >
                {done ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-[var(--foreground)]">{step.title}</span>
                <span className="block text-xs text-[var(--muted-foreground)]">{step.description}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
