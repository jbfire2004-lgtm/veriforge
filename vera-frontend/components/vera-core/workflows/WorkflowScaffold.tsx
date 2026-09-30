import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { buttonStyles } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  WORKFLOW_WIREFRAMES,
  type WorkflowWireframeId,
} from "@/lib/wireframes/workflows";
import { MultiStepForm } from "../forms/MultiStepForm";

export type WorkflowScaffoldProps = {
  workflowId: WorkflowWireframeId;
  currentStep: number;
  backHref?: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
};

export function WorkflowScaffold({
  workflowId,
  currentStep,
  backHref,
  children,
  onBack,
  onNext,
  onSubmit,
  submitLabel,
}: WorkflowScaffoldProps) {
  const wf = WORKFLOW_WIREFRAMES[workflowId];
  const Icon = wf.icon;

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title={wf.title}
        description={`Step ${currentStep + 1} of ${wf.steps.length}`}
        actions={
          backHref ? (
            <Link href={backHref} className={buttonStyles({ variant: "ghost", size: "sm" })}>
              <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
              Back
            </Link>
          ) : null
        }
      />
      <p className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Icon className="h-4 w-4 text-[var(--color-primary)]" aria-hidden />
        Guided workflow
      </p>
      <MultiStepForm
        steps={wf.steps}
        currentStep={currentStep}
        onBack={onBack}
        onNext={onNext}
        onSubmit={onSubmit}
        submitLabel={submitLabel}
      >
        {children}
      </MultiStepForm>
    </article>
  );
}
