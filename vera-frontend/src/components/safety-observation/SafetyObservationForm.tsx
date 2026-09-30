"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { CoreAlert } from "@/src/components/core/CoreAlert";
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
import { useSafetyObservationMutations } from "@/src/hooks/useSafetyObservationMutations";
import {
  SAFETY_OBSERVATION_SEVERITIES,
  SAFETY_OBSERVATION_STATUSES,
  safetyObservationCreateSchema,
  type SafetyObservationFormInput,
  type SafetyObservationFormOutput,
} from "./safety-observation.schema";

function defaultObservedAtLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function SafetyObservationForm() {
  const { busy, error, success, clearMessages, create } =
    useSafetyObservationMutations();

  const form = useForm<
    SafetyObservationFormInput,
    unknown,
    SafetyObservationFormOutput
  >({
    resolver: zodResolver(safetyObservationCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      severity: "MEDIUM",
      status: "OPEN",
      observedAt: defaultObservedAtLocal(),
      locationNote: "",
      companyId: "",
      siteId: "",
      reportedByUserId: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  async function onValid(values: SafetyObservationFormOutput) {
    clearMessages();
    try {
      const observedIso = new Date(values.observedAt).toISOString();
      const payload = {
        title: values.title.trim(),
        description: values.description,
        severity: values.severity,
        status: values.status,
        observedAt: observedIso,
        locationNote: values.locationNote,
        ...(values.companyId !== undefined && { companyId: values.companyId }),
        ...(values.siteId !== undefined && { siteId: values.siteId }),
        ...(values.reportedByUserId !== undefined && {
          reportedByUserId: values.reportedByUserId,
        }),
      };

      await create(payload);
      reset({
        title: "",
        description: "",
        severity: "MEDIUM",
        status: "OPEN",
        observedAt: defaultObservedAtLocal(),
        locationNote: "",
        companyId: "",
        siteId: "",
        reportedByUserId: "",
      });
    } catch {}
  }

  const submitting = isSubmitting || busy;

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>New safety observation</CardTitle>
        <CardDescription>
          Field hazard, near miss, or positive safety note.{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">
            POST /api/v1/safety-observations
          </code>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onValid)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="so-title">Title</Label>
            <Input
              id="so-title"
              placeholder="Unmarked trip hazard on mezzanine"
              {...register("title")}
              disabled={submitting}
              autoComplete="off"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="so-desc">Description</Label>
            <Textarea
              id="so-desc"
              placeholder="What you saw, immediate risk, who was notified…"
              {...register("description")}
              disabled={submitting}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="so-severity">Severity</Label>
              <select
                id="so-severity"
                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
                {...register("severity")}
                disabled={submitting}
              >
                {SAFETY_OBSERVATION_SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.severity && (
                <p className="text-sm text-red-600">
                  {errors.severity.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="so-status">Status</Label>
              <select
                id="so-status"
                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
                {...register("status")}
                disabled={submitting}
              >
                {SAFETY_OBSERVATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="so-observed">Observed at</Label>
            <Input
              id="so-observed"
              type="datetime-local"
              {...register("observedAt")}
              disabled={submitting}
            />
            {errors.observedAt && (
              <p className="text-sm text-red-600">
                {errors.observedAt.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="so-loc">Location note (optional)</Label>
            <Input
              id="so-loc"
              placeholder="Building C — north stair"
              {...register("locationNote")}
              disabled={submitting}
            />
            {errors.locationNote && (
              <p className="text-sm text-red-600">
                {errors.locationNote.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="so-company">Company ID</Label>
              <Input
                id="so-company"
                type="number"
                min={1}
                placeholder="Optional"
                {...register("companyId")}
                disabled={submitting}
              />
              {errors.companyId && (
                <p className="text-sm text-red-600">
                  {String(errors.companyId.message)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="so-site">Site ID</Label>
              <Input
                id="so-site"
                type="number"
                min={1}
                placeholder="Optional"
                {...register("siteId")}
                disabled={submitting}
              />
              {errors.siteId && (
                <p className="text-sm text-red-600">
                  {String(errors.siteId.message)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="so-user">Reporter user ID</Label>
              <Input
                id="so-user"
                type="number"
                min={1}
                placeholder="Optional"
                {...register("reportedByUserId")}
                disabled={submitting}
              />
              {errors.reportedByUserId && (
                <p className="text-sm text-red-600">
                  {String(errors.reportedByUserId.message)}
                </p>
              )}
            </div>
          </div>

          {success && (
            <CoreAlert variant="success" role="status">
              <p>{success}</p>
              <p className="mt-2">
                <Link
                  href="/core/safety-observations"
                  className="font-medium text-emerald-900 underline underline-offset-2 hover:text-emerald-950"
                >
                  View safety observations list
                </Link>
              </p>
            </CoreAlert>
          )}

          {error && <CoreAlert>{error}</CoreAlert>}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit observation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
