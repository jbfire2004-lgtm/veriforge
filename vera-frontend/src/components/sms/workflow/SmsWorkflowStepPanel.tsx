"use client";

import { memo, type ReactNode } from "react";
import type { SmsWorkflowStepId } from "./steps";

type Props = {
  step: SmsWorkflowStepId;
  activeStep: string;
  children: ReactNode;
  className?: string;
};

/** Renders children only when the given workflow step is active. */
export const SmsWorkflowStepPanel = memo(function SmsWorkflowStepPanel({
  step,
  activeStep,
  children,
  className,
}: Props) {
  if (activeStep !== step) return null;

  return (
    <div className={className} data-workflow-step={step}>
      {children}
    </div>
  );
});
