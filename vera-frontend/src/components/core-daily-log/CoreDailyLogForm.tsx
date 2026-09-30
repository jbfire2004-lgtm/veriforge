"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { createCoreDailyLog } from "@/src/api/core-daily-log";
import { unknownToErrorMessage } from "@/lib/core";
import {
  isMissingAuthTokenError,
  missingAuthTokenMessage,
} from "@/lib/core/auth-token-errors";
import { useVeraAuthOrHook } from "@/contexts/VeraAuthContext";
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
import {
  CORE_DAILY_LOG_SHIFTS,
  coreDailyLogCreateSchema,
  type CoreDailyLogFormInput,
  type CoreDailyLogFormOutput,
} from "./core-daily-log.schema";

export type DailyLogCompanyOption = { id: number; name: string };
export type DailyLogSiteOption = {
  id: number;
  name: string;
  code?: string | null;
};

export type CoreDailyLogFormProps = {
  companies?: DailyLogCompanyOption[];
  sites?: DailyLogSiteOption[];
  defaultCompanyId?: number;
  defaultSiteId?: number;
  lockCompany?: boolean;
  defaultCreatedByUserId?: number;
  /** Prefill supervisor (defaults to current user). */
  defaultSupervisorUserId?: number;
};

function defaultLogDateLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function CoreDailyLogForm({
  companies = [],
  sites = [],
  defaultCompanyId,
  defaultSiteId,
  lockCompany = false,
  defaultCreatedByUserId,
  defaultSupervisorUserId,
}: CoreDailyLogFormProps) {
  const router = useRouter();
  const { tokenReady, sessionExpired, sessionRefreshing } = useVeraAuthOrHook();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resolvedDefaultSiteId = useMemo(() => {
    if (defaultSiteId != null) return defaultSiteId;
    if (sites.length === 1) return sites[0]!.id;
    return undefined;
  }, [defaultSiteId, sites]);

  const supervisorDefault =
    defaultSupervisorUserId ?? defaultCreatedByUserId;

  const form = useForm<CoreDailyLogFormInput, unknown, CoreDailyLogFormOutput>({
    resolver: zodResolver(coreDailyLogCreateSchema),
    defaultValues: {
      title: "",
      activities: "",
      safetyNotes: "",
      logDate: defaultLogDateLocal(),
      shift: "DAY",
      companyId: defaultCompanyId != null ? String(defaultCompanyId) : "",
      siteId: resolvedDefaultSiteId != null ? String(resolvedDefaultSiteId) : "",
      supervisorUserId:
        supervisorDefault != null ? String(supervisorDefault) : "",
      createdByUserId:
        defaultCreatedByUserId != null ? String(defaultCreatedByUserId) : "",
      attachmentFileIds: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const companyIdWatch = watch("companyId");

  useEffect(() => {
    if (defaultCompanyId != null) {
      setValue("companyId", String(defaultCompanyId));
    }
  }, [defaultCompanyId, setValue]);

  useEffect(() => {
    if (resolvedDefaultSiteId != null) {
      setValue("siteId", String(resolvedDefaultSiteId));
    }
  }, [resolvedDefaultSiteId, setValue]);

  useEffect(() => {
    if (defaultCreatedByUserId != null) {
      setValue("createdByUserId", String(defaultCreatedByUserId));
    }
  }, [defaultCreatedByUserId, setValue]);

  useEffect(() => {
    if (supervisorDefault != null) {
      setValue("supervisorUserId", String(supervisorDefault));
    }
  }, [supervisorDefault, setValue]);

  async function onValid(values: CoreDailyLogFormOutput) {
    setSubmitError(null);
    setSuccess(null);

    if (!tokenReady) {
      setSubmitError(missingAuthTokenMessage("create a daily log"));
      return;
    }

    try {
      const logDateIso = new Date(values.logDate).toISOString();
      const title =
        values.title?.trim() ||
        values.activities.split(/\r?\n/)[0]!.trim().slice(0, 500);
      const payload = {
        title,
        activities: values.activities,
        body: values.activities,
        safetyNotes: values.safetyNotes,
        logDate: logDateIso,
        date: logDateIso,
        shift: values.shift,
        ...(values.companyId !== undefined && {
          companyId: values.companyId,
          company_id: values.companyId,
        }),
        ...(values.siteId !== undefined && {
          siteId: values.siteId,
          site_id: values.siteId,
        }),
        ...(values.createdByUserId !== undefined && {
          createdByUserId: values.createdByUserId,
        }),
        ...(values.supervisorUserId !== undefined && {
          supervisorUserId: values.supervisorUserId,
          supervisor: values.supervisorUserId,
        }),
        ...(values.attachmentFileIds !== undefined && {
          attachmentFileIds: values.attachmentFileIds,
          attachments: values.attachmentFileIds,
        }),
      };

      const created = await createCoreDailyLog(payload);
      setSuccess(
        `Saved daily log #${created.log_id ?? created.id} — ${created.title}.`,
      );
      reset({
        title: "",
        activities: "",
        safetyNotes: "",
        logDate: defaultLogDateLocal(),
        shift: "DAY",
        companyId: defaultCompanyId != null ? String(defaultCompanyId) : "",
        siteId:
          resolvedDefaultSiteId != null ? String(resolvedDefaultSiteId) : "",
        supervisorUserId:
          supervisorDefault != null ? String(supervisorDefault) : "",
        createdByUserId:
          defaultCreatedByUserId != null
            ? String(defaultCreatedByUserId)
            : "",
        attachmentFileIds: "",
      });
      router.push("/core/daily-logs");
      router.refresh();
    } catch (e) {
      setSuccess(null);
      setSubmitError(
        isMissingAuthTokenError(e)
          ? missingAuthTokenMessage("create a daily log")
          : unknownToErrorMessage(
              e,
              "Request failed. Ensure POST /api/v1/core-daily-logs is available.",
            ),
      );
    }
  }

  const busy = isSubmitting;
  const authBlocked = !tokenReady || sessionExpired || sessionRefreshing;

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>New daily log</CardTitle>
        <CardDescription>
          Schema: log_id, site_id, company_id, supervisor, date, activities,
          safety_notes, attachments (CoreFile ids).{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">
            POST /api/v1/core-daily-logs
          </code>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sessionRefreshing ? (
          <CoreAlert variant="info" className="mb-4" role="status">
            Preparing auth token…
          </CoreAlert>
        ) : null}
        {sessionExpired || (!tokenReady && !sessionRefreshing) ? (
          <CoreAlert className="mb-4" role="alert">
            {missingAuthTokenMessage("create a daily log")}{" "}
            <Link
              href="/login?callbackUrl=/core/daily-logs/new"
              className="underline"
            >
              Sign in
            </Link>
          </CoreAlert>
        ) : null}

        <form onSubmit={handleSubmit(onValid)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cdl-title">Title (optional)</Label>
            <Input
              id="cdl-title"
              placeholder="Defaults from first line of activities"
              {...register("title")}
              disabled={busy || authBlocked}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cdl-activities">Activities</Label>
            <Textarea
              id="cdl-activities"
              placeholder="Work performed, headcount, equipment used…"
              {...register("activities")}
              disabled={busy || authBlocked}
              rows={5}
            />
            {errors.activities && (
              <p className="text-sm text-red-600">
                {errors.activities.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cdl-safety">Safety notes</Label>
            <Textarea
              id="cdl-safety"
              placeholder="Observations, near-misses, PPE notes…"
              {...register("safetyNotes")}
              disabled={busy || authBlocked}
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cdl-logdate">Date</Label>
              <Input
                id="cdl-logdate"
                type="datetime-local"
                {...register("logDate")}
                disabled={busy || authBlocked}
              />
              {errors.logDate && (
                <p className="text-sm text-red-600">
                  {errors.logDate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cdl-shift">Shift</Label>
              <select
                id="cdl-shift"
                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
                {...register("shift")}
                disabled={busy || authBlocked}
              >
                {CORE_DAILY_LOG_SHIFTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cdl-company">Company</Label>
              {companies.length > 0 && !lockCompany ? (
                <select
                  id="cdl-company"
                  className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                  {...register("companyId")}
                  disabled={busy || authBlocked}
                >
                  <option value="">Select company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name} (#{c.id})
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="cdl-company"
                  inputMode="numeric"
                  readOnly={lockCompany}
                  placeholder="Auto from account"
                  {...register("companyId")}
                  disabled={busy || authBlocked || lockCompany}
                />
              )}
              {lockCompany ? (
                <p className="text-[10px] text-slate-500">
                  Locked to your company
                  {companyIdWatch ? ` (#${companyIdWatch})` : ""}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cdl-site">Site</Label>
              {sites.length > 0 ? (
                <select
                  id="cdl-site"
                  className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                  {...register("siteId")}
                  disabled={busy || authBlocked}
                >
                  <option value="">Select site</option>
                  {sites.map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {s.name}
                      {s.code ? ` (${s.code})` : ""} #{s.id}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="cdl-site"
                  inputMode="numeric"
                  placeholder="Optional site ID"
                  {...register("siteId")}
                  disabled={busy || authBlocked}
                />
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cdl-supervisor">Supervisor user ID</Label>
              <Input
                id="cdl-supervisor"
                inputMode="numeric"
                placeholder="Defaults to you"
                {...register("supervisorUserId")}
                disabled={busy || authBlocked}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cdl-attachments">Attachments (CoreFile ids)</Label>
              <Input
                id="cdl-attachments"
                placeholder="e.g. 12, 15"
                {...register("attachmentFileIds")}
                disabled={busy || authBlocked}
              />
              <p className="text-[10px] text-slate-500">
                Upload in{" "}
                <Link href="/pm/documents" className="underline">
                  Document Archive
                </Link>{" "}
                then paste file ids
              </p>
            </div>
          </div>

          {success && (
            <CoreAlert variant="success" role="status">
              {success}
            </CoreAlert>
          )}

          {submitError && <CoreAlert role="alert">{submitError}</CoreAlert>}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={busy || authBlocked}>
              {busy ? "Saving…" : "Create daily log"}
            </Button>
            <Link href="/core/daily-logs">
              <Button type="button" variant="outline" disabled={busy}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
