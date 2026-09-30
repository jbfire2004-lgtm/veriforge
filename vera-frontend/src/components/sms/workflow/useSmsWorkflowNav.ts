"use client";

import { useCallback, useMemo } from "react";
import type { SmsWorkflowStep } from "./steps";

export function useSmsWorkflowNav(
  steps: SmsWorkflowStep[],
  activeStep: string,
  setActiveStep: (step: string) => void,
) {
  const visibleIds = useMemo(() => steps.map((s) => s.id), [steps]);

  const index = useMemo(
    () => visibleIds.indexOf(activeStep as (typeof visibleIds)[number]),
    [visibleIds, activeStep],
  );

  const isFirst = index <= 0;
  const isLast = index < 0 || index >= visibleIds.length - 1;

  const goTo = useCallback(
    (stepId: string) => {
      if (visibleIds.includes(stepId)) setActiveStep(stepId);
    },
    [visibleIds, setActiveStep],
  );

  const goNext = useCallback(() => {
    if (isLast || index < 0) return;
    setActiveStep(visibleIds[index + 1]!);
  }, [index, isLast, setActiveStep, visibleIds]);

  const goBack = useCallback(() => {
    if (isFirst || index <= 0) return;
    setActiveStep(visibleIds[index - 1]!);
  }, [index, isFirst, setActiveStep, visibleIds]);

  return {
    steps,
    activeStep,
    setActiveStep: goTo,
    index,
    isFirst,
    isLast,
    goNext,
    goBack,
  };
}
