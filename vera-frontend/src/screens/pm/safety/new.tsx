"use client";

import { PmSafetyWorkflowForm } from "@/src/components/pm/PmSafetyWorkflowForm";

export default function NewPmSafetyWorkflowPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          New PM safety workflow
        </h1>
        <p className="text-sm text-slate-600">
          Creates a draft workflow (Permit to Work, JHA/FLHA, SIF, HECA, Energy
          Wheel, or Inspection). Use the review screen for worker sign-off,
          supervisor approval, and PDF stub export.
        </p>
      </header>
      <PmSafetyWorkflowForm />
    </div>
  );
}

