"use client";

import { PermitChecklist } from "@/src/components/safety-forms/components/PermitChecklist";
import { SfButton, SfCard, SfInput } from "@/src/components/safety-forms/ui";
import { SfFloatingTextarea } from "@/src/components/safety-forms/ui/SfFloatingTextarea";
import { TrainingStatusBadge, WorkerTrainingHydrationPanel } from "@/components/training";
import { useWorkerTrainingHydration } from "@/hooks/useWorkerTrainingHydration";
import { allRequiredTrainingValid } from "@/lib/worker-training";
import type { PermitRequiredField, PermitTypeDefinition, PermitWorkflow } from "@/lib/pm-permits";
import type { Session } from "next-auth";
import { useMemo, useState } from "react";

const STEPS = [
  { id: "scope", label: "Job scope" },
  { id: "hazards", label: "Hazards" },
  { id: "controls", label: "Controls" },
  { id: "training", label: "Worker training" },
  { id: "signoff", label: "Signoff" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

type Props = {
  typeDef: PermitTypeDefinition;
  workflow: PermitWorkflow;
  disabled?: boolean;
  projectId?: number;
  session?: Session | null;
  tokenReady?: boolean;
  onChange: (workflow: PermitWorkflow) => void;
};

function hazardLabel(key: string) {
  return key.replace(/^hz\./, "").replace(/\./g, " · ").replace(/_/g, " ");
}

function controlLabel(key: string) {
  return key.replace(/^ctrl\./, "").replace(/\./g, " · ").replace(/_/g, " ");
}

export function PermitWorkflowForm({
  typeDef,
  workflow,
  disabled,
  projectId,
  session,
  tokenReady = true,
  onChange,
}: Props) {
  const [step, setStep] = useState<StepId>("scope");

  const hazardItems = useMemo(
    () => (typeDef.defaultHazardKeys ?? []).map(hazardLabel),
    [typeDef.defaultHazardKeys],
  );
  const controlItems = useMemo(
    () => (typeDef.defaultControlKeys ?? []).map(controlLabel),
    [typeDef.defaultControlKeys],
  );
  const trainingItems = typeDef.requiredTraining ?? [];
  const workerId = workflow.workerId;

  const { data: trainingData } = useWorkerTrainingHydration({
    workerId,
    projectId,
    requiredTraining: trainingItems,
    session,
    tokenReady,
    enabled: Boolean(workerId),
  });

  const requirementRows = useMemo(() => {
    if (trainingData?.requirements?.length) return trainingData.requirements;
    return trainingItems.map((name) => ({
      code: name,
      name,
      status: "missing" as const,
      matchedRecordId: null,
      expiresAt: null,
    }));
  }, [trainingData, trainingItems]);

  const trainingComplete = allRequiredTrainingValid(requirementRows);

  const hazardChecked = useMemo(() => {
    const keys = typeDef.defaultHazardKeys ?? [];
    return keys.filter((k) => (workflow.hazards ?? []).includes(k)).map(hazardLabel);
  }, [typeDef.defaultHazardKeys, workflow.hazards]);

  const controlChecked = useMemo(() => {
    const keys = typeDef.defaultControlKeys ?? [];
    return keys.filter((k) => (workflow.controls ?? []).includes(k)).map(controlLabel);
  }, [typeDef.defaultControlKeys, workflow.controls]);

  function updateField(key: string, value: unknown) {
    onChange({
      ...workflow,
      fieldValues: { ...(workflow.fieldValues ?? {}), [key]: value },
    });
  }

  function toggleHazard(_label: string, checked: string[]) {
    const keys = typeDef.defaultHazardKeys ?? [];
    const selected = keys.filter((k) => checked.includes(hazardLabel(k)));
    onChange({ ...workflow, hazards: selected });
  }

  function toggleControl(_label: string, checked: string[]) {
    const keys = typeDef.defaultControlKeys ?? [];
    const selected = keys.filter((k) => checked.includes(controlLabel(k)));
    onChange({ ...workflow, controls: selected });
  }

  function addSignoff(name: string, role: string) {
    if (!name.trim()) return;
    const signoffs = workflow.signoffs ?? [];
    onChange({
      ...workflow,
      signoffs: [
        ...signoffs,
        { role, name: name.trim(), signedAt: new Date().toISOString() },
      ],
    });
  }

  const [signerName, setSignerName] = useState("");
  const [signerRole, setSignerRole] = useState("Supervisor");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={disabled}
            onClick={() => setStep(s.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              step === s.id
                ? "bg-[#247A78] text-white"
                : "border border-[var(--sf-border)] text-[var(--sf-text-muted)]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {step === "scope" ? (
        <SfCard className="space-y-4 p-5">
          <SfInput
            label="Worker ID (Core)"
            type="number"
            value={workerId != null ? String(workerId) : ""}
            onChange={(e) =>
              onChange({
                ...workflow,
                workerId: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            disabled={disabled}
          />
          <SfFloatingTextarea
            label="Job scope summary"
            value={workflow.jobScope ?? ""}
            onChange={(e) => onChange({ ...workflow, jobScope: e.target.value })}
            disabled={disabled}
          />
          {(typeDef.requiredFields ?? []).map((field: PermitRequiredField) => (
            <SfInput
              key={field.key}
              label={field.label}
              type={field.type === "number" ? "number" : field.type === "datetime" ? "datetime-local" : "text"}
              value={String(workflow.fieldValues?.[field.key] ?? "")}
              onChange={(e) =>
                updateField(
                  field.key,
                  field.type === "boolean" ? e.target.value === "true" : e.target.value,
                )
              }
              disabled={disabled}
            />
          ))}
        </SfCard>
      ) : null}

      {step === "hazards" ? (
        <SfCard className="p-5">
          <PermitChecklist
            label="Identify hazards for this permit"
            items={hazardItems}
            value={hazardChecked}
            onChange={(checked) => toggleHazard("", checked)}
            disabled={disabled}
            required
          />
        </SfCard>
      ) : null}

      {step === "controls" ? (
        <SfCard className="p-5">
          <PermitChecklist
            label="Required controls"
            items={controlItems}
            value={controlChecked}
            onChange={(checked) => toggleControl("", checked)}
            disabled={disabled}
            required
          />
        </SfCard>
      ) : null}

      {step === "training" ? (
        <div className="space-y-4">
          {!workerId ? (
            <SfCard className="p-5 text-sm text-[var(--sf-text-muted)]">
              Enter a worker ID on the Job scope step to validate training from Vera Core.
            </SfCard>
          ) : (
            <>
              <WorkerTrainingHydrationPanel
                workerId={workerId}
                projectId={projectId}
                requiredTraining={trainingItems}
                session={session}
                tokenReady={tokenReady}
                title="Permit training validation (Core)"
                showRequirementsOnly
              />
              <SfCard className="p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">Required for {typeDef.name}</p>
                  {trainingComplete ? (
                    <TrainingStatusBadge status="valid" />
                  ) : (
                    <TrainingStatusBadge status="missing" />
                  )}
                </div>
                <ul className="space-y-2 text-sm">
                  {requirementRows.map((req) => (
                    <li
                      key={req.code}
                      className="flex flex-wrap items-center justify-between gap-2 border-b py-2 last:border-0"
                    >
                      <span>{req.name}</span>
                      <TrainingStatusBadge status={req.status} />
                    </li>
                  ))}
                </ul>
              </SfCard>
            </>
          )}
        </div>
      ) : null}

      {step === "signoff" ? (
        <SfCard className="space-y-4 p-5">
          <p className="text-sm text-[var(--sf-text-muted)]">
            Capture supervisor or authorized signoff before submitting for approval.
          </p>
          <div className="flex flex-wrap gap-2">
            <SfInput
              label="Signer name"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              disabled={disabled}
            />
            <SfInput
              label="Role"
              value={signerRole}
              onChange={(e) => setSignerRole(e.target.value)}
              disabled={disabled}
            />
            <SfButton
              type="button"
              variant="secondary"
              disabled={disabled || !signerName.trim()}
              onClick={() => {
                addSignoff(signerName, signerRole);
                setSignerName("");
              }}
            >
              Add signoff
            </SfButton>
          </div>
          <ul className="space-y-2 text-sm">
            {(workflow.signoffs ?? []).map((s, i) => (
              <li key={`${s.role}-${s.name}-${i}`} className="rounded border px-3 py-2">
                {s.name} · {s.role} · {new Date(s.signedAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </SfCard>
      ) : null}
    </div>
  );
}
