"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import {
  createPmSafetyWorkflow,
  signPmSafetyWorkflowAsWorker,
} from "@/lib/pm-safety-workflow";
import { unknownToErrorMessage } from "@/lib/core";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PM_CONTROL_OPTIONS,
  PM_ENERGY_WHEEL_CATEGORIES,
  PM_HAZARD_OPTIONS,
  PM_HECA_EXPOSURE_ROUTES,
  type PmAssessmentFormKind,
} from "./pm-safety-assessment.constants";
import {
  defaultAssessmentSteps,
  defaultInspectionItems,
  pmSafetyAssessmentSchema,
  type PmSafetyAssessmentInput,
  type PmSafetyAssessmentValues,
} from "./pm-safety-assessment.schema";
import { SignatureCapture } from "./SignatureCapture";

function optionLabels(
  ids: string[],
  catalog: readonly { id: string; label: string }[]
): string {
  return ids
    .map((id) => catalog.find((o) => o.id === id)?.label ?? id)
    .join(" · ");
}

function buildTaskPayload(values: PmSafetyAssessmentValues) {
  return {
    pmAssessmentVersion: 1 as const,
    kind: values.kind,
    selectedHazards: values.selectedHazards,
    selectedControls: values.selectedControls,
    fieldContext: values.fieldContext ?? null,
    scenarioSummary: values.scenarioSummary ?? null,
    severityRationale: values.severityRationale ?? null,
    hecaExposureRoutes: values.hecaExposureRoutes ?? null,
    hecaExposureNotes: values.hecaExposureNotes ?? null,
    energyCategories: values.energyCategories ?? null,
    energyIsolationPlan: values.energyIsolationPlan ?? null,
    steps: values.steps ?? null,
    inspectionItems: values.inspectionItems ?? null,
    signer: {
      printedName: values.signerPrintedName,
      hasDrawing: Boolean(values.signatureDrawingDataUrl?.length),
      drawingDataUrl: values.signatureDrawingDataUrl ?? null,
    },
  };
}

export function PmSafetyAssessmentForm() {
  const router = useRouter();
  const previousKind = useRef<PmAssessmentFormKind | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [signWarning, setSignWarning] = useState<string | null>(null);

  const form = useForm<PmSafetyAssessmentInput, unknown, PmSafetyAssessmentValues>({
    resolver: zodResolver(pmSafetyAssessmentSchema),
    defaultValues: {
      kind: "JHA",
      title: "",
      jobLocation: "",
      companyId: "",
      siteId: "",
      selectedHazards: [],
      selectedControls: [],
      workNarrative: "",
      fieldContext: "",
      scenarioSummary: "",
      severityRationale: "",
      hecaExposureRoutes: [] as string[],
      hecaExposureNotes: "",
      energyCategories: [] as string[],
      energyIsolationPlan: "",
      steps: defaultAssessmentSteps("JHA"),
      inspectionItems: defaultInspectionItems(),
      signerPrintedName: "",
      signerAcknowledgement: false,
      signatureDrawingDataUrl: undefined,
    },
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const kind = useWatch({ control, name: "kind" });
  const selectedHazards = useWatch({ control, name: "selectedHazards" }) ?? [];
  const selectedControls = useWatch({ control, name: "selectedControls" }) ?? [];
  const hecaExposureRoutesWatch =
    useWatch({ control, name: "hecaExposureRoutes" }) ?? [];
  const energyCategoriesWatch =
    useWatch({ control, name: "energyCategories" }) ?? [];

  const stepArray = useFieldArray({ control, name: "steps" });
  const inspectionArray = useFieldArray({ control, name: "inspectionItems" });

  useEffect(() => {
    if (previousKind.current === null) {
      previousKind.current = kind;
      return;
    }
    if (previousKind.current === kind) return;
    previousKind.current = kind;

    if (kind === "JHA" || kind === "FLHA") {
      setValue("steps", defaultAssessmentSteps(kind));
    }
    if (kind === "INSPECTION") {
      setValue("inspectionItems", defaultInspectionItems());
    }
  }, [kind, setValue]);

  function toggleId(
    field: "selectedHazards" | "selectedControls",
    id: string,
    checked: boolean
  ) {
    const cur = new Set(form.getValues(field) ?? []);
    if (checked) cur.add(id);
    else cur.delete(id);
    setValue(field, Array.from(cur), { shouldValidate: true });
  }

  async function onValid(values: PmSafetyAssessmentValues) {
    setSubmitError(null);
    setSignWarning(null);
    const hazardSummary = [
      optionLabels(values.selectedHazards, PM_HAZARD_OPTIONS),
      values.workNarrative?.trim(),
    ]
      .filter(Boolean)
      .join("\n\n");

    const controlMeasures = [
      optionLabels(values.selectedControls, PM_CONTROL_OPTIONS),
      values.fieldContext?.trim() ? `Field context:\n${values.fieldContext}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const payload = buildTaskPayload(values);

    const created = await createPmSafetyWorkflow({
      title: values.title.trim(),
      kind: values.kind,
      companyId: values.companyId,
      siteId: values.siteId,
      jobLocation: values.jobLocation?.trim() || undefined,
      workDescription: values.workNarrative?.trim() || undefined,
      hazardSummary: hazardSummary || undefined,
      controlMeasures: controlMeasures || undefined,
      taskStepsJson: JSON.stringify(payload),
    });

    const attestation = [
      `Printed name: ${values.signerPrintedName}`,
      "I acknowledge that I have reviewed the hazards and controls documented in this assessment.",
      values.signatureDrawingDataUrl
        ? "An electronic signature image was captured on canvas."
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await signPmSafetyWorkflowAsWorker(created.id, attestation);
    } catch (e) {
      setSignWarning(
        `Workflow created, but worker sign-off was not recorded automatically. Open the review screen and sign with actor headers. (${unknownToErrorMessage(e)})`,
      );
    }

    router.push(`/pm/safety/${created.id}`);
  }

  return (
    <form
      onSubmit={handleSubmit((vals) =>
        void onValid(vals).catch((e) =>
          setSubmitError(unknownToErrorMessage(e))
        )
      )}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Assessment type</CardTitle>
          <CardDescription>
            Choose JHA, FLHA, SIF, HECA, Energy Wheel, or Inspection — sections
            update automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pm-kind">Form type</Label>
            <select
              id="pm-kind"
              className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
              disabled={isSubmitting}
              {...register("kind")}
            >
              <option value="JHA">JHA — Job Hazard Analysis</option>
              <option value="FLHA">FLHA — Field-Level Hazard Analysis</option>
              <option value="SIF">SIF — Significant / serious incident focus</option>
              <option value="HECA">HECA — Health exposure & controls</option>
              <option value="ENERGY_WHEEL">Energy Wheel — stored energy / LOTO</option>
              <option value="INSPECTION">Inspection checklist</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pm-title">Title</Label>
            <Input id="pm-title" disabled={isSubmitting} {...register("title")} />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pm-loc">Job location</Label>
            <Input
              id="pm-loc"
              placeholder="Area, elevation, grid…"
              disabled={isSubmitting}
              {...register("jobLocation")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="pm-cid">Company ID</Label>
              <Input
                id="pm-cid"
                inputMode="numeric"
                disabled={isSubmitting}
                {...register("companyId")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pm-sid">Site ID</Label>
              <Input
                id="pm-sid"
                inputMode="numeric"
                disabled={isSubmitting}
                {...register("siteId")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hazard selection</CardTitle>
          <CardDescription>
            Select all hazard categories that apply; describe specifics below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {PM_HAZARD_OPTIONS.map((h) => (
              <label
                key={h.id}
                className="flex cursor-pointer items-start gap-2 rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selectedHazards.includes(h.id)}
                  onChange={(e) =>
                    toggleId("selectedHazards", h.id, e.target.checked)
                  }
                  disabled={isSubmitting}
                />
                <span>{h.label}</span>
              </label>
            ))}
          </div>
          {errors.selectedHazards && (
            <p className="text-sm text-red-600">
              {errors.selectedHazards.message as string}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Control selection</CardTitle>
          <CardDescription>
            Select controls in place or planned; expand in the narrative.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {PM_CONTROL_OPTIONS.map((c) => (
              <label
                key={c.id}
                className="flex cursor-pointer items-start gap-2 rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selectedControls.includes(c.id)}
                  onChange={(e) =>
                    toggleId("selectedControls", c.id, e.target.checked)
                  }
                  disabled={isSubmitting}
                />
                <span>{c.label}</span>
              </label>
            ))}
          </div>
          {errors.selectedControls && (
            <p className="text-sm text-red-600">
              {errors.selectedControls.message as string}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Work narrative</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            className="min-h-[100px]"
            placeholder="Scope, crew, equipment, sequence of work…"
            disabled={isSubmitting}
            {...register("workNarrative")}
          />
        </CardContent>
      </Card>

      {(kind === "JHA" || kind === "FLHA") && (
        <Card>
          <CardHeader>
            <CardTitle>
              {kind === "FLHA" ? "Field steps (FLHA)" : "Task steps (JHA)"}
            </CardTitle>
            <CardDescription>
              One row per key task: task, hazard, control.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {kind === "FLHA" && (
              <div className="space-y-1.5">
                <Label>Field context</Label>
                <Textarea
                  className="min-h-[72px]"
                  placeholder="Conditions unique to this site/shift…"
                  disabled={isSubmitting}
                  {...register("fieldContext")}
                />
              </div>
            )}
            {stepArray.fields.map((row, idx) => (
              <div
                key={row.id}
                className="space-y-2 rounded-lg border border-slate-200 p-3"
              >
                <p className="text-xs font-semibold text-slate-500">
                  Row {idx + 1}
                </p>
                <div className="space-y-1.5">
                  <Label>Task</Label>
                  <Input
                    disabled={isSubmitting}
                    {...register(`steps.${idx}.task` as const)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Hazard</Label>
                  <Input
                    disabled={isSubmitting}
                    {...register(`steps.${idx}.hazard` as const)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Control</Label>
                  <Input
                    disabled={isSubmitting}
                    {...register(`steps.${idx}.control` as const)}
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() =>
                stepArray.append({ task: "", hazard: "", control: "" })
              }
            >
              Add row
            </Button>
            {errors.steps && (
              <p className="text-sm text-red-600">{errors.steps.message}</p>
            )}
          </CardContent>
        </Card>
      )}

      {kind === "SIF" && (
        <Card>
          <CardHeader>
            <CardTitle>SIF focus</CardTitle>
            <CardDescription>
              Scenario and why this situation could be significant.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Scenario summary</Label>
              <Textarea
                className="min-h-[88px]"
                disabled={isSubmitting}
                {...register("scenarioSummary")}
              />
              {errors.scenarioSummary && (
                <p className="text-sm text-red-600">
                  {errors.scenarioSummary.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Severity rationale</Label>
              <Textarea
                className="min-h-[88px]"
                disabled={isSubmitting}
                {...register("severityRationale")}
              />
              {errors.severityRationale && (
                <p className="text-sm text-red-600">
                  {errors.severityRationale.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {kind === "HECA" && (
        <Card>
          <CardHeader>
            <CardTitle>HECA — exposure routes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {PM_HECA_EXPOSURE_ROUTES.map((r) => (
                <label
                  key={r.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={hecaExposureRoutesWatch.includes(r.id)}
                    onChange={(e) => {
                      const set = new Set(form.getValues("hecaExposureRoutes") ?? []);
                      if (e.target.checked) set.add(r.id);
                      else set.delete(r.id);
                      setValue("hecaExposureRoutes", Array.from(set), {
                        shouldValidate: true,
                      });
                    }}
                    disabled={isSubmitting}
                  />
                  {r.label}
                </label>
              ))}
            </div>
            {errors.hecaExposureRoutes && (
              <p className="text-sm text-red-600">
                {errors.hecaExposureRoutes.message as string}
              </p>
            )}
            <div className="space-y-1.5">
              <Label>Exposure / health notes</Label>
              <Textarea
                disabled={isSubmitting}
                {...register("hecaExposureNotes")}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {kind === "ENERGY_WHEEL" && (
        <Card>
          <CardHeader>
            <CardTitle>Energy Wheel</CardTitle>
            <CardDescription>
              Select energy forms present; document isolation / verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {PM_ENERGY_WHEEL_CATEGORIES.map((e) => (
                <label
                  key={e.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={energyCategoriesWatch.includes(e.id)}
                    onChange={(ev) => {
                      const set = new Set(form.getValues("energyCategories") ?? []);
                      if (ev.target.checked) set.add(e.id);
                      else set.delete(e.id);
                      setValue("energyCategories", Array.from(set), {
                        shouldValidate: true,
                      });
                    }}
                    disabled={isSubmitting}
                  />
                  {e.label}
                </label>
              ))}
            </div>
            {errors.energyCategories && (
              <p className="text-sm text-red-600">
                {errors.energyCategories.message as string}
              </p>
            )}
            <div className="space-y-1.5">
              <Label>Isolation / verification plan</Label>
              <Textarea
                className="min-h-[100px]"
                disabled={isSubmitting}
                {...register("energyIsolationPlan")}
              />
              {errors.energyIsolationPlan && (
                <p className="text-sm text-red-600">
                  {errors.energyIsolationPlan.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {kind === "INSPECTION" && (
        <Card>
          <CardHeader>
            <CardTitle>Inspection lines</CardTitle>
            <CardDescription>Add rows; set PASS / FAIL / N/A.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {inspectionArray.fields.map((row, idx) => (
              <div
                key={row.id}
                className="grid gap-2 rounded-lg border p-3 sm:grid-cols-12"
              >
                <div className="sm:col-span-6">
                  <Label>Item</Label>
                  <Input
                    disabled={isSubmitting}
                    {...register(`inspectionItems.${idx}.item` as const)}
                  />
                </div>
                <div className="sm:col-span-3">
                  <Label>Status</Label>
                  <select
                    className="flex h-9 w-full rounded-md border px-2 text-sm"
                    disabled={isSubmitting}
                    {...register(`inspectionItems.${idx}.status` as const)}
                  >
                    <option value="PASS">PASS</option>
                    <option value="FAIL">FAIL</option>
                    <option value="NA">N/A</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <Label>Notes</Label>
                  <Input
                    disabled={isSubmitting}
                    {...register(`inspectionItems.${idx}.notes` as const)}
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() =>
                inspectionArray.append({
                  item: "",
                  status: "PASS",
                  notes: "",
                })
              }
            >
              Add line
            </Button>
            {errors.inspectionItems && (
              <p className="text-sm text-red-600">
                {errors.inspectionItems.message}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Attestation & signature</CardTitle>
          <CardDescription>
            Printed name and acknowledgement are required. Draw a signature
            optionally; signing the workflow also uses your session actor (see
            review screen if sign fails).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pm-printed">Printed name</Label>
            <Input
              id="pm-printed"
              disabled={isSubmitting}
              {...register("signerPrintedName")}
            />
            {errors.signerPrintedName && (
              <p className="text-sm text-red-600">
                {errors.signerPrintedName.message}
              </p>
            )}
          </div>

          <label className="flex items-start gap-2 text-sm">
            <Controller
              name="signerAcknowledgement"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={Boolean(field.value)}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={isSubmitting}
                />
              )}
            />
            <span>
              I acknowledge that I have participated in this assessment and that
              the hazards and controls listed reflect our discussion.
            </span>
          </label>
          {errors.signerAcknowledgement && (
            <p className="text-sm text-red-600">
              {errors.signerAcknowledgement.message}
            </p>
          )}

          <Controller
            name="signatureDrawingDataUrl"
            control={control}
            render={({ field }) => (
              <SignatureCapture
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
            )}
          />

          {submitError && (
            <p className="text-sm text-red-600">{submitError}</p>
          )}
          {signWarning && (
            <p className="text-sm text-amber-700">{signWarning}</p>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Create workflow & attempt sign"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
