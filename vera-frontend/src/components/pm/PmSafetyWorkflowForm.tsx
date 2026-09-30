"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createPmSafetyWorkflow } from "@/lib/pm-safety-workflow";
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
import {
  pmSafetyWorkflowCreateSchema,
  type PmSafetyWorkflowCreateInput,
  type PmSafetyWorkflowCreateOutput,
  PM_SAFETY_WORKFLOW_KINDS,
} from "./pm-safety-workflow.schema";

export function PmSafetyWorkflowForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<
    PmSafetyWorkflowCreateInput,
    unknown,
    PmSafetyWorkflowCreateOutput
  >({
    resolver: zodResolver(pmSafetyWorkflowCreateSchema),
    defaultValues: {
      title: "",
      kind: "PERMIT_TO_WORK",
      companyId: "",
      siteId: "",
      workDescription: "",
      hazardSummary: "",
      controlMeasures: "",
      jobLocation: "",
      taskStepsJson: "",
      validFrom: "",
      validTo: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  async function onValid(values: PmSafetyWorkflowCreateOutput) {
    setSubmitError(null);
    const cid = values.companyId;
    const sid = values.siteId;

    const row = await createPmSafetyWorkflow({
      title: values.title.trim(),
      kind: values.kind,
      companyId: cid,
      siteId: sid,
      workDescription: values.workDescription?.trim() || undefined,
      hazardSummary: values.hazardSummary?.trim() || undefined,
      controlMeasures: values.controlMeasures?.trim() || undefined,
      jobLocation: values.jobLocation?.trim() || undefined,
      taskStepsJson: values.taskStepsJson?.trim() || undefined,
      validFrom: values.validFrom || undefined,
      validTo: values.validTo || undefined,
    });
    router.push(`/pm/safety/${row.id}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow details</CardTitle>
        <CardDescription>
          VERA PM safety workflows: Permit to work, JHA/FLHA, SIF, HECA, Energy
          Wheel, and inspections. Optional company/site IDs must exist in the
          database. JHA-class kinds require a{" "}
          <strong>worker signature</strong> on the review screen before submit.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(
            (v) =>
              void onValid(v).catch((e) =>
                setSubmitError(unknownToErrorMessage(e))
              ),
          )}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="pmw-title">Title</Label>
            <Input
              id="pmw-title"
              placeholder="e.g. Hot work — Tank 3 roof"
              disabled={isSubmitting}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pmw-kind">Workflow type</Label>
            <select
              id="pmw-kind"
              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
              disabled={isSubmitting}
              {...register("kind")}
            >
              {PM_SAFETY_WORKFLOW_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="pmw-cid">Company ID (optional)</Label>
              <Input
                id="pmw-cid"
                inputMode="numeric"
                disabled={isSubmitting}
                {...register("companyId")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pmw-sid">Site ID (optional)</Label>
              <Input
                id="pmw-sid"
                inputMode="numeric"
                disabled={isSubmitting}
                {...register("siteId")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pmw-loc">Job location (optional)</Label>
            <Input
              id="pmw-loc"
              placeholder="Area, grid, elevation…"
              disabled={isSubmitting}
              {...register("jobLocation")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pmw-wd">Work description</Label>
            <textarea
              id="pmw-wd"
              className="border-input bg-background min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
              disabled={isSubmitting}
              {...register("workDescription")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pmw-hz">Hazard summary</Label>
            <textarea
              id="pmw-hz"
              className="border-input bg-background min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
              disabled={isSubmitting}
              {...register("hazardSummary")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pmw-cm">Control measures</Label>
            <textarea
              id="pmw-cm"
              className="border-input bg-background min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
              disabled={isSubmitting}
              {...register("controlMeasures")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pmw-steps">
              Task steps (JSON array, optional)
            </Label>
            <textarea
              id="pmw-steps"
              className="border-input bg-background min-h-[100px] w-full rounded-md border px-3 py-2 font-mono text-xs"
              placeholder='e.g. [{"step":"Verify lockout","hazard":"…","control":"…"}]'
              disabled={isSubmitting}
              {...register("taskStepsJson")}
            />
            {errors.taskStepsJson && (
              <p className="text-sm text-red-600">
                {String(errors.taskStepsJson.message)}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="pmw-vf">Valid from</Label>
              <Input
                id="pmw-vf"
                type="date"
                disabled={isSubmitting}
                {...register("validFrom")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pmw-vt">Valid to</Label>
              <Input
                id="pmw-vt"
                type="date"
                disabled={isSubmitting}
                {...register("validTo")}
              />
            </div>
          </div>

          {submitError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {submitError}
            </div>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Create draft"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
