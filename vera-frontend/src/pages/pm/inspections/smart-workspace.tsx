"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, ChevronRight, ClipboardList } from "lucide-react";
import {
  createPmInspection,
  fetchPmInspectionPhotoFindings,
  findPmInspectionTemplateByKind,
  getPmInspection,
  getPmTemplateKind,
  listPmInspections,
  savePmInspectionAnswers,
  submitPmInspection,
  type PmInspection,
  type PmInspectionPhotoFinding,
} from "@/lib/pm-inspections";
import { usePmInspectionCatalog } from "@/hooks/usePmInspectionCatalog";
import {
  InspectionTemplatesEmpty,
  SmartInspectionCategoryGrid,
} from "@/components/inspections";
import { usePmInspectionScope } from "@/hooks/usePmInspectionScope";
import { SmartSitePhotoPanel } from "@/components/inspection/SmartSitePhotoPanel";
import { InspectionPhotoFindingsSmsSection } from "@/components/sms/InspectionFindingSmsTagPanel";
import { SmartInspectionSetupCard } from "@/components/inspection/SmartInspectionSetupCard";
import { InspectionChecklistFields } from "@/components/inspection/InspectionChecklistFields";
import { InspectionSignaturesPanel } from "@/components/inspection/InspectionSignaturesPanel";
import { pruneHiddenInspectionAnswers } from "@/lib/inspection-visible-items";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";
import { PmErrorState, PmLoadingState, PmPageShell } from "@/src/components/pm/layout";
import {
  buildSmsWorkflowSteps,
  SmsWorkflowEmptyHint,
  SmsWorkflowPage,
  SmsWorkflowStepPanel,
  useSmsWorkflowNav,
  type SmsWorkflowToolAction,
} from "@/src/components/sms/workflow";
import { SmsSection } from "@/src/components/sms/design-system";

export default function PmSmartSiteWorkspacePage({
  id,
  projectId: queryProjectId = 1,
  companyId: queryCompanyId = 1,
}: {
  id: string;
  projectId?: number;
  companyId?: number;
}) {
  const router = useRouter();
  const { companyId, projectId, query, session, tokenReady, authLoading, authenticated, sessionExpired } = usePmInspectionScope(
    queryCompanyId,
    queryProjectId,
  );
  const [inspection, setInspection] = useState<PmInspection | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [photoFindings, setPhotoFindings] = useState<PmInspectionPhotoFinding[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState("overview");

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
        setLoadError(
          e instanceof Error ? e.message : "Could not load this inspection workspace.",
        );
      });
    void fetchPmInspectionPhotoFindings(id, ctx)
      .then(setPhotoFindings)
      .catch(() => setPhotoFindings([]));
  }, [id, session, tokenReady]);

  useEffect(() => {
    load();
  }, [load]);

  const editable =
    inspection != null && ["draft", "in_progress"].includes(inspection.status);
  const kind = inspection ? getPmTemplateKind(inspection.template) : "checklist";
  const templateItems = inspection?.template.items ?? [];
  const checklistItems = useMemo(
    () =>
      templateItems.filter(
        (item) => item.type !== "photo" || !inspection?.template.scoringRules?.photoFirst,
      ),
    [templateItems, inspection],
  );
  const isPhotoFirst =
    kind === "smart_site" ||
    kind === "focus_audit" ||
    inspection?.template.scoringRules?.photoFirst;

  const isAudit = kind === "focus_audit";
  const steps = useMemo(
    () =>
      buildSmsWorkflowSteps({
        hazards: { label: "Findings", shortLabel: "Findings" },
        controls: { label: "Corrective actions", shortLabel: "Actions" },
      }),
    [],
  );
  const workflowNav = useSmsWorkflowNav(steps, activeStep, setActiveStep);

  async function saveDraft() {
    if (!inspection) return;
    setBusy(true);
    setError(null);
    try {
      const payload = pruneHiddenInspectionAnswers(templateItems, answers);
      const ctx = { session };
      await savePmInspectionAnswers(id, payload, ctx);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function completeInspection() {
    if (!inspection) return;
    setBusy(true);
    setError(null);
    try {
      const payload = pruneHiddenInspectionAnswers(templateItems, answers);
      const ctx = { session };
      await savePmInspectionAnswers(id, payload, ctx);
      await submitPmInspection(id, ctx);
      router.push(`/pm/inspections/${id}/report?projectId=${projectId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  }

  if (!inspection) {
    const loadingSteps = buildSmsWorkflowSteps();
    return (
      <SmsWorkflowPage
        title="Workspace"
        steps={loadingSteps}
        activeStep={activeStep}
        onStepChange={setActiveStep}
        showToolDrawer={false}
        auth={{
          authLoading,
          authenticated,
          tokenReady,
          sessionExpired,
          signInMessage: "Sign in to load this inspection workspace.",
        }}
      >
        {loadError ? (
          <PmErrorState message={loadError} onRetry={() => load()} />
        ) : (
          <PmLoadingState message="Loading inspection workspace…" />
        )}
      </SmsWorkflowPage>
    );
  }

  const title = inspection.title ?? inspection.template.name;
  const pageTitle = isAudit ? "Audit" : title;
  const workspaceDescription =
    inspection.template.description ??
    (isAudit
      ? "Complete the audit checklist and capture photo evidence for AI-assisted findings."
      : "Complete the site checklist, capture photos, and generate a numbered report.");

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
      onClick: () => setActiveStep("controls"),
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

  return (
    <SmsWorkflowPage
      title={pageTitle}
      status={inspection.status}
      assignedTo={inspection.workerId != null ? `Worker #${inspection.workerId}` : null}
      description={workspaceDescription}
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
        inspection.status !== "draft" && inspection.status !== "in_progress" ? (
          <Link
            href={`/pm/inspections/${id}/report?projectId=${projectId}`}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm"
          >
            View report
          </Link>
        ) : undefined
      }
      toolActions={editable ? toolActions : undefined}
      showToolDrawer={editable}
      footer={{
        onBack: workflowNav.isFirst ? undefined : workflowNav.goBack,
        onNext: workflowNav.isLast ? undefined : workflowNav.goNext,
        onSaveDraft: editable ? () => void saveDraft() : undefined,
        onSubmit: editable ? () => void completeInspection() : undefined,
        showBack: !workflowNav.isFirst,
        showNext: !workflowNav.isLast,
        showSaveDraft: editable,
        showSubmit: editable && workflowNav.isLast,
        saveDraftLabel: "Save checklist",
        submitLabel: isAudit ? "Submit audit" : "Generate report",
        saving: busy,
        submitting: busy,
        error,
      }}
    >
      <SmsWorkflowStepPanel step="overview" activeStep={activeStep}>
        {editable ? (
          <SfCard className="p-5">
            <SmsSection
              title={isAudit ? "Audit checklist" : "Inspection checklist"}
              description={`${checklistItems.length} template field${checklistItems.length === 1 ? "" : "s"}`}
            >
              <InspectionChecklistFields
                items={checklistItems}
                answers={answers}
                editable={editable}
                onAnswersChange={setAnswers}
                photoFindings={photoFindings}
                inspectionId={id}
                companyId={inspection.companyId}
                projectId={projectId}
                onPhotoCaptured={load}
              />
            </SmsSection>
          </SfCard>
        ) : (
          <SfCard className="p-5">
            <p className="text-sm text-[var(--sf-text-muted)]">
              This {isAudit ? "audit" : "inspection"} is read-only. View the report for final results.
            </p>
          </SfCard>
        )}
      </SmsWorkflowStepPanel>

      <SmsWorkflowStepPanel step="hazards" activeStep={activeStep}>
        {isPhotoFirst ? (
          <SfCard className="p-5">
            <SmsSection
              title="Photo capture & AI analysis"
              description="Document site conditions and auto-tag findings."
            >
              <SmartSitePhotoPanel
                inspectionId={id}
                companyId={inspection.companyId}
                projectId={projectId}
                editable={editable}
                onUpdated={load}
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
            description="Capture photos to generate AI-assisted findings."
          />
        )}
      </SmsWorkflowStepPanel>

      <SmsWorkflowStepPanel step="controls" activeStep={activeStep}>
        <SfCard className="p-5">
          <SmsSection title="Corrective actions" description="Assign follow-up from tagged findings.">
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
                description="Assign corrective actions from tagged findings."
              />
            )}
          </SmsSection>
        </SfCard>
      </SmsWorkflowStepPanel>

      <SmsWorkflowStepPanel step="signatures" activeStep={activeStep}>
        <InspectionSignaturesPanel
          inspection={inspection}
          editable={editable}
          onSigned={() => load()}
        />
      </SmsWorkflowStepPanel>

      <SmsWorkflowStepPanel step="attachments" activeStep={activeStep}>
        <SfCard className="p-5">
          <SmsSection title="Attachments">
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
                description="Photos appear here after capture on the Findings step."
              />
            )}
          </SmsSection>
        </SfCard>
      </SmsWorkflowStepPanel>

      <SmsWorkflowStepPanel step="review" activeStep={activeStep}>
        <SfCard className="space-y-3 p-5">
          <SmsSection
            title="Review & submit"
            description={
              isAudit
                ? "Confirm checklist and findings before submitting the audit."
                : "Generate the numbered report and assign at-risk items."
            }
          >
            <ul className="space-y-2 text-sm">
              <li>
                Checklist: {Object.keys(answers).length} field
                {Object.keys(answers).length === 1 ? "" : "s"} answered
              </li>
              <li>
                Findings: {photoFindings.length} photo finding
                {photoFindings.length === 1 ? "" : "s"}
              </li>
              <li>
                Attachments: {inspection.attachments?.length ?? 0} file
                {(inspection.attachments?.length ?? 0) === 1 ? "" : "s"}
              </li>
            </ul>
          </SmsSection>
        </SfCard>

        {editable ? (
          <div className="mt-4">
            <Link href={`/pm/inspections/${id}?projectId=${projectId}`}>
              <SfButton type="button" variant="secondary">
                Standard inspection view
              </SfButton>
            </Link>
          </div>
        ) : null}
      </SmsWorkflowStepPanel>
    </SmsWorkflowPage>
  );
}

export function PmSmartSiteStartPage({
  projectId: queryProjectId = 1,
  companyId: queryCompanyId = 1,
  initialTemplates = [],
  libraryError = null,
}: {
  projectId?: number;
  companyId?: number;
  initialTemplates?: import("@/lib/pm-inspections").PmInspectionTemplate[];
  libraryError?: string | null;
}) {
  const router = useRouter();
  const { companyId, projectId, query, authLoading, authenticated, session, tokenReady, sessionExpired } =
    usePmInspectionScope(queryCompanyId, queryProjectId);
  const {
    smartSiteTemplate: smartTemplate,
    smartCategories,
    counts,
    ready,
    error: hookLibraryError,
    reload,
    authenticated: catalogAuth,
    tokenReady: catalogTokenReady,
    sessionExpired: catalogSessionExpired,
    authLoading: catalogAuthLoading,
  } = usePmInspectionCatalog(
    queryCompanyId,
    queryProjectId,
    initialTemplates,
    libraryError,
  );
  const libraryErrorMessage = hookLibraryError ?? libraryError;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inProgress, setInProgress] = useState<PmInspection[]>([]);

  useEffect(() => {
    if (!authenticated || !tokenReady) return;
    const ctx = { session };
    void listPmInspections(projectId, companyId, ctx)
      .then((rows) =>
        setInProgress(
          rows.filter(
            (r) =>
              getPmTemplateKind(r.template) === "smart_site" &&
              (r.status === "draft" || r.status === "in_progress"),
          ),
        ),
      )
      .catch(() => setInProgress([]));
  }, [projectId, companyId, authenticated, tokenReady, session?.accessToken]);

  function openWorkspace(inspectionId: string) {
    router.push(`/pm/inspections/${inspectionId}/smart-workspace${query}`);
  }

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const template =
        smartTemplate ??
        (await findPmInspectionTemplateByKind(companyId, "smart_site", projectId, undefined, {
          session,
        }));
      if (!template) {
        throw new Error("Smart Site template not found. Reload the page to seed your library.");
      }
      const row = await createPmInspection(
        {
          templateId: template.id,
          companyId,
          projectId,
          title: `Smart Site — ${new Date().toLocaleDateString()}`,
        },
        { session },
      );
      openWorkspace(row.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start inspection");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PmPageShell
      title="Smart Site Inspection"
      description="Walk the site with a full inspection template — site area, conditions, notes — then capture photos for AI-assisted numbering and contractor assignment."
      auth={{
        authLoading: catalogAuthLoading || authLoading,
        authenticated: catalogAuth && authenticated,
        tokenReady: catalogTokenReady && tokenReady,
        sessionExpired: catalogSessionExpired || sessionExpired,
        signInMessage: "Sign in to load smart site templates.",
      }}
      actions={
        <button
          type="button"
          disabled={busy || authLoading || !tokenReady}
          onClick={() => void start()}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:opacity-90 disabled:opacity-60"
        >
          <Camera className="h-4 w-4" />
          {busy ? "Starting…" : "Start inspection"}
        </button>
      }
    >
      {libraryErrorMessage || error ? (
        <p className="text-sm text-red-600" role="alert">
          {error ?? libraryErrorMessage}
        </p>
      ) : null}

      {smartTemplate ? (
        <SfCard className="border-2 border-[#2F8F8C]/20 bg-gradient-to-br from-[#E4F3F2] to-white p-6">
          <h2 className="text-lg font-semibold text-[#2A2E33]">{smartTemplate.name}</h2>
          {smartTemplate.description ? (
            <p className="mt-1 text-sm text-[#5a6b7c]">{smartTemplate.description}</p>
          ) : null}
          <ul className="mt-4 space-y-2 text-sm text-[#2A2E33]">
            {(smartTemplate.items ?? []).map((item) => (
              <li key={item.id} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#247A78]" />
                {item.label}
                <span className="text-xs text-[#5a6b7c]">({item.type.replace("_", " ")})</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={busy || !tokenReady}
            onClick={() => void start()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#247A78] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2F8F8C] disabled:opacity-60"
          >
            Start with this template
            <ArrowRight className="h-4 w-4" />
          </button>
        </SfCard>
      ) : ready && authenticated && tokenReady ? (
        <InspectionTemplatesEmpty
          title="Smart Site template not loaded"
          description="Reload to seed your company library from Vera Core."
          onRetry={reload}
        />
      ) : null}

      {smartCategories.length > 0 ? (
        <SmartInspectionCategoryGrid
          categories={smartCategories}
          focusAuditCount={counts?.focus_audit}
        />
      ) : null}

      {inProgress.length > 0 ? (
        <SfCard className="divide-y overflow-hidden p-0">
          <div className="px-5 py-3">
            <h2 className="text-sm font-semibold text-[#2A2E33]">Continue in progress</h2>
          </div>
          <ul>
            {inProgress.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-sm hover:bg-[#E4F3F2]"
                  onClick={() => openWorkspace(row.id)}
                >
                  <span>
                    <span className="font-medium text-[#2A2E33]">
                      {row.title ?? "Smart Site Inspection"}
                    </span>
                    <span className="mt-0.5 block text-xs text-[#5a6b7c]">
                      {row.status.replace("_", " ")} · {row.attachments?.length ?? 0} photo
                      {(row.attachments?.length ?? 0) === 1 ? "" : "s"}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#5a6b7c]" />
                </button>
              </li>
            ))}
          </ul>
        </SfCard>
      ) : null}

      <SmartInspectionSetupCard projectId={projectId} companyId={companyId} />
    </PmPageShell>
  );
}
