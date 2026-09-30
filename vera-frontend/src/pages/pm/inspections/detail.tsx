"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  draftPmInspectionSafetyMeeting,
  escalatePmInspectionToIncident,
  fetchPmInspectionPhotoFindings,
  getPmInspection,
  getPmTemplateKind,
  reviewPmInspection,
  savePmInspectionAnswers,
  submitPmInspection,
  type PmInspection,
  type PmInspectionPhotoFinding,
} from "@/lib/pm-inspections";
import { usePmInspectionScope } from "@/hooks/usePmInspectionScope";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";
import { PmErrorState, PmLoadingState } from "@/src/components/pm/layout";
import { apiLoadErrorMessage } from "@/lib/network-error-message";
import { InspectionPhotoCapture } from "@/components/inspection/InspectionPhotoCapture";
import { InspectionChecklistFields } from "@/components/inspection/InspectionChecklistFields";
import { InspectionSignaturesPanel } from "@/components/inspection/InspectionSignaturesPanel";
import { InspectionSignatureStatusBanner } from "@/components/inspection/InspectionSignatureStatusBanner";
import { pruneHiddenInspectionAnswers } from "@/lib/inspection-visible-items";
import { InspectionPhotoFindingsSmsSection } from "@/components/sms/InspectionFindingSmsTagPanel";
import {
  buildSmsWorkflowSteps,
  SmsWorkflowEmptyHint,
  SmsWorkflowPage,
  SmsWorkflowStepPanel,
  useSmsWorkflowNav,
  type SmsWorkflowToolAction,
} from "@/src/components/sms/workflow";
import { SmsSection } from "@/src/components/sms/design-system";

export default function PmInspectionDetailPage({
  id,
  projectId = 1,
  companyId = 1,
}: {
  id: string;
  projectId?: number;
  companyId?: number;
}) {
  const { session, tokenReady, authLoading, authenticated, sessionExpired } =
    usePmInspectionScope(companyId, projectId);
  const [inspection, setInspection] = useState<PmInspection | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [photoFindings, setPhotoFindings] = useState<PmInspectionPhotoFinding[]>([]);
  const [saving, setSaving] = useState(false);
  const [workflowBusy, setWorkflowBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState("overview");

  const steps = useMemo(
    () =>
      buildSmsWorkflowSteps({
        hazards: { label: "Findings", shortLabel: "Findings" },
        controls: { label: "Corrective actions", shortLabel: "Actions" },
      }),
    [],
  );
  const workflowNav = useSmsWorkflowNav(steps, activeStep, setActiveStep);

  const load = useCallback(() => {
    if (!tokenReady) return;
    const ctx = { session };
    setLoadError(null);
    void getPmInspection(id, ctx)
      .then((row) => {
        const templateItems = row.template.items ?? [];
        const raw = (row.answers as Record<string, unknown>) ?? {};
        setInspection(row);
        setAnswers(pruneHiddenInspectionAnswers(templateItems, raw));
      })
      .catch((e) => {
        setLoadError(apiLoadErrorMessage(e, "Could not load this inspection."));
      });
    void fetchPmInspectionPhotoFindings(id, ctx)
      .then(setPhotoFindings)
      .catch(() => setPhotoFindings([]));
  }, [id, session, tokenReady]);

  useEffect(() => {
    load();
  }, [load]);

  const requiredRoles = useMemo(() => {
    const req = inspection?.template.requiredSignatures ?? [];
    return new Set(req.map((r) => r.role));
  }, [inspection]);

  const signedRoles = useMemo(
    () => new Set((inspection?.signatures ?? []).map((s) => s.role)),
    [inspection],
  );

  const signaturesComplete = useMemo(() => {
    for (const role of requiredRoles) {
      if (!signedRoles.has(role)) return false;
    }
    return true;
  }, [requiredRoles, signedRoles]);

  if (!inspection) {
    return (
      <SmsWorkflowPage
        title="Inspection"
        steps={steps}
        activeStep={activeStep}
        onStepChange={setActiveStep}
        showToolDrawer={false}
        auth={{
          authLoading,
          authenticated,
          tokenReady,
          sessionExpired,
          signInMessage: "Sign in to load this inspection.",
        }}
      >
        {loadError ? (
          <PmErrorState message={loadError} onRetry={() => load()} />
        ) : tokenReady ? (
          <PmLoadingState message="Loading inspection…" />
        ) : null}
      </SmsWorkflowPage>
    );
  }

  const items = inspection.template.items ?? [];
  const editable = ["draft", "in_progress"].includes(inspection.status);
  const kind = getPmTemplateKind(inspection.template);
  const photoFirst =
    kind === "smart_site" ||
    kind === "focus_audit" ||
    inspection.template.scoringRules?.photoFirst;

  async function save() {
    setSaving(true);
    setSubmitError(null);
    try {
      const payload = pruneHiddenInspectionAnswers(items, answers);
      const ctx = { session };
      await savePmInspectionAnswers(id, payload, ctx);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function submit() {
    if (!signaturesComplete) {
      setSubmitError("Save all required signatures before submitting.");
      setActiveStep("signatures");
      return;
    }
    setSaving(true);
    setSubmitError(null);
    try {
      const payload = pruneHiddenInspectionAnswers(items, answers);
      const ctx = { session };
      await savePmInspectionAnswers(id, payload, ctx);
      await submitPmInspection(id, ctx);
      load();
      setActiveStep("review");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setSaving(false);
    }
  }

  async function review(action: "approve" | "reject" | "request_changes") {
    await reviewPmInspection(id, action, undefined, { session });
    load();
  }

  const toolActions: SmsWorkflowToolAction[] = [
    {
      id: "photo",
      label: "Add photo",
      onClick: () => setActiveStep("hazards"),
      disabled: !editable,
    },
    {
      id: "hazard",
      label: "Add finding",
      onClick: () => setActiveStep("hazards"),
      disabled: !editable,
    },
    {
      id: "corrective_action",
      label: "Add corrective action",
      onClick: () => {
        // TODO: wire inline CAPA creation from inspection context
        setActiveStep("controls");
      },
      disabled: !editable,
    },
    {
      id: "note",
      label: "Add note",
      onClick: () => setActiveStep("overview"),
      disabled: !editable,
    },
    {
      id: "signature",
      label: "Add signature",
      onClick: () => setActiveStep("signatures"),
      disabled: !editable,
    },
  ];

  const assignedTo = inspection.workerId != null ? `Worker #${inspection.workerId}` : null;

  return (
    <SmsWorkflowPage
      title={inspection.title ?? inspection.template.name}
      status={inspection.status}
      assignedTo={assignedTo}
      description={
        <>
          {inspection.scorePercent != null ? `Score ${inspection.scorePercent}%` : null}
          {inspection.passed === false ? " · Failed" : ""}
        </>
      }
      steps={steps}
      activeStep={activeStep}
      onStepChange={setActiveStep}
      auth={{
        authLoading,
        authenticated,
        tokenReady,
        sessionExpired,
      }}
      actions={
        photoFirst ? (
          <Link
            href={`/pm/inspections/${id}/smart-workspace?projectId=${projectId}`}
            className="inline-flex items-center text-sm font-medium text-[var(--sf-primary)] hover:underline"
          >
            Photo-first workspace →
          </Link>
        ) : undefined
      }
      toolActions={editable ? toolActions : undefined}
      showToolDrawer={editable}
      footer={{
        onBack: workflowNav.isFirst ? undefined : workflowNav.goBack,
        onNext: workflowNav.isLast ? undefined : workflowNav.goNext,
        onSaveDraft: editable ? () => void save() : undefined,
        onSubmit: editable ? () => void submit() : undefined,
        showBack: !workflowNav.isFirst,
        showNext: !workflowNav.isLast,
        showSaveDraft: editable,
        showSubmit: editable && workflowNav.isLast,
        saving,
        submitting: saving,
        error: submitError,
      }}
    >
      <SmsWorkflowStepPanel step="overview" activeStep={activeStep}>
        <InspectionSignatureStatusBanner inspection={inspection} />
        <SfCard className="space-y-4 p-5">
          <SmsSection title="Inspection checklist" description="Complete each field for this template.">
            <InspectionChecklistFields
              items={items}
              answers={answers}
              editable={editable}
              onAnswersChange={setAnswers}
              photoFindings={photoFindings}
              inspectionId={id}
              companyId={inspection.companyId}
              projectId={projectId}
              onPhotoCaptured={() => load()}
            />
          </SmsSection>
        </SfCard>
      </SmsWorkflowStepPanel>

      <SmsWorkflowStepPanel step="hazards" activeStep={activeStep}>
        <div className="space-y-4">
          {editable ? (
            <SfCard className="p-5">
              <SmsSection
                title="Photo evidence"
                description="Capture photos to document findings on site."
              >
                <InspectionPhotoCapture
                  inspectionId={id}
                  companyId={inspection.companyId}
                  projectId={projectId}
                  onComplete={() => load()}
                />
              </SmsSection>
            </SfCard>
          ) : null}

          {photoFindings.length > 0 ? (
            <InspectionPhotoFindingsSmsSection
              findings={photoFindings}
              companyId={inspection.companyId}
              projectId={projectId}
              onUpdated={() => load()}
            />
          ) : (
            <SmsWorkflowEmptyHint
              title="No findings yet"
              description="Use Tools to capture photos or document findings on site."
            />
          )}

          {inspection.deficiencies?.length ? (
            <SfCard className="p-5">
              <h2 className="mb-2 font-medium">Deficiencies</h2>
              <ul className="divide-y text-sm">
                {inspection.deficiencies.map((d) => (
                  <li key={d.id} className="flex justify-between py-2">
                    <span>{d.title}</span>
                    <span className="text-[var(--sf-text-muted)]">
                      {d.severity} · {d.status}
                    </span>
                  </li>
                ))}
              </ul>
            </SfCard>
          ) : null}
        </div>
      </SmsWorkflowStepPanel>

      <SmsWorkflowStepPanel step="controls" activeStep={activeStep}>
        <SfCard className="space-y-3 p-5">
          <SmsSection
            title="Corrective actions"
            description="Follow-up actions linked to this inspection."
          >
            {photoFindings.length > 0 ? (
              <InspectionPhotoFindingsSmsSection
                findings={photoFindings}
                companyId={inspection.companyId}
                projectId={projectId}
                onUpdated={() => load()}
              />
            ) : (
              <SmsWorkflowEmptyHint
                title="Add findings first"
                description="Tag findings from the Findings step, then assign corrective actions here."
              />
            )}
            {editable ? (
              <p className="text-xs text-[var(--sf-text-muted)]">
                {/* TODO: open CAPA wizard pre-filled from inspection id */}
                Full CAPA creation from inspections is coming soon. Use findings tagging for now.
              </p>
            ) : null}
          </SmsSection>
        </SfCard>
      </SmsWorkflowStepPanel>

      <SmsWorkflowStepPanel step="signatures" activeStep={activeStep}>
        <InspectionSignaturesPanel
          inspection={inspection}
          editable={editable}
          onSigned={() => load()}
        />
        {!signaturesComplete && editable ? (
          <p className="mt-3 text-sm text-amber-700" role="status">
            All required signatures must be collected before submit.
          </p>
        ) : null}
      </SmsWorkflowStepPanel>

      <SmsWorkflowStepPanel step="attachments" activeStep={activeStep}>
        <SfCard className="p-5">
          <SmsSection title="Attachments" description="Photos and files linked to this inspection.">
            {(inspection.attachments?.length ?? 0) > 0 ? (
              <ul className="divide-y text-sm">
                {inspection.attachments!.map((a) => (
                  <li key={a.id} className="py-2">
                    {a.fileName ?? a.id}
                  </li>
                ))}
              </ul>
            ) : (
              <SmsWorkflowEmptyHint
                title="No attachments"
                description="Add photos from the Findings step."
              />
            )}
          </SmsSection>
        </SfCard>
      </SmsWorkflowStepPanel>

      <SmsWorkflowStepPanel step="review" activeStep={activeStep}>
        <SfCard className="space-y-4 p-5">
          <SmsSection title="Review & submit" description="Confirm checklist and signatures, then submit.">
            <ul className="space-y-2 text-sm">
              <li>
                Checklist: {Object.keys(answers).length} field
                {Object.keys(answers).length === 1 ? "" : "s"} answered
              </li>
              <li>
                Signatures:{" "}
                {signaturesComplete ? (
                  <span className="text-green-700">Complete</span>
                ) : (
                  <span className="text-amber-700">Incomplete</span>
                )}
              </li>
              <li>
                Findings: {photoFindings.length} photo finding
                {photoFindings.length === 1 ? "" : "s"}
              </li>
            </ul>
          </SmsSection>
        </SfCard>

        {!editable && inspection.status !== "draft" ? (
          <SfCard className="mt-4 flex flex-wrap gap-2 p-4">
            {photoFirst ? (
              <Link href={`/pm/inspections/${id}/report?projectId=${projectId}`}>
                <SfButton type="button">View report</SfButton>
              </Link>
            ) : null}
            <SfButton
              type="button"
              variant="secondary"
              disabled={workflowBusy}
              onClick={() => {
                setWorkflowBusy(true);
                void escalatePmInspectionToIncident(id, undefined, { session })
                  .then((res) => {
                    const href = `/pm/incidents/${res.eventId}`;
                    if (typeof window !== "undefined") {
                      window.location.href = href;
                    }
                  })
                  .finally(() => setWorkflowBusy(false));
              }}
            >
              Escalate to incident
            </SfButton>
            <SfButton
              type="button"
              variant="secondary"
              disabled={workflowBusy}
              onClick={() => {
                setWorkflowBusy(true);
                void draftPmInspectionSafetyMeeting(id, { session })
                  .then((meeting) => {
                    const mid = (meeting as { id?: string })?.id;
                    if (mid && typeof window !== "undefined") {
                      window.location.href = `/pm/safety-meetings/${mid}`;
                    }
                  })
                  .finally(() => setWorkflowBusy(false));
              }}
            >
              Draft safety meeting
            </SfButton>
          </SfCard>
        ) : null}

        {inspection.status === "review_required" ? (
          <SfCard className="mt-4 flex gap-2 p-4">
            <SfButton type="button" onClick={() => void review("approve")}>
              Approve
            </SfButton>
            <SfButton type="button" variant="secondary" onClick={() => void review("reject")}>
              Reject
            </SfButton>
            <SfButton
              type="button"
              variant="secondary"
              onClick={() => void review("request_changes")}
            >
              Request changes
            </SfButton>
          </SfCard>
        ) : null}
      </SmsWorkflowStepPanel>
    </SmsWorkflowPage>
  );
}
