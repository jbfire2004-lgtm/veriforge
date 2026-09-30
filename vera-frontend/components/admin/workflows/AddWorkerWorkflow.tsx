"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { WorkflowScaffold } from "@/components/vera-core/workflows/WorkflowScaffold";
import {
  WorkerUpsertForm,
  type WorkerCompanyOption,
  type WorkerUpsertFormHandle,
} from "@/components/admin/WorkerUpsertForm";
import { buttonStyles } from "@/components/ui/button";

type Props = {
  companies: WorkerCompanyOption[];
};

export function AddWorkerWorkflow({ companies }: Props) {
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const formRef = useRef<WorkerUpsertFormHandle>(null);

  function tryAdvance() {
    const message = formRef.current?.validateWorkflowStep(step);
    if (message) {
      setStepError(message);
      return;
    }
    setStepError(null);
    setStep((s) => Math.min(3, s + 1));
  }

  return (
    <WorkflowScaffold
      workflowId="addWorker"
      currentStep={step}
      backHref="/admin/workers"
      onBack={() => {
        setStepError(null);
        setStep((s) => Math.max(0, s - 1));
      }}
      onNext={tryAdvance}
      onSubmit={() => {
        setStepError(null);
        const message = formRef.current?.validateWorkflowStep(0);
        if (message) {
          setStepError(message);
          setStep(0);
          return;
        }
        formRef.current?.submit();
      }}
      submitLabel="Create worker"
    >
      {stepError ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {stepError}
        </p>
      ) : null}
      {step === 2 ? (
        <section className="space-y-4 text-sm text-[#6B7280]">
          <p>
            You can attach training certificates after the worker is created from the worker
            profile or the training module.
          </p>
          <Link href="/admin/training/new" className={buttonStyles({ variant: "outline", size: "sm" })}>
            Open training upload
          </Link>
        </section>
      ) : null}
      <WorkerUpsertForm
        ref={formRef}
        mode="create"
        companies={companies}
        cancelHref="/admin/workers"
        workflowStep={step}
        submitButtonId="worker-workflow-submit"
      />
    </WorkflowScaffold>
  );
}
