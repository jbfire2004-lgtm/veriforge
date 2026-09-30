"use client";

/**
 * VERA Core — Daily log summary filter form.
 * Fields: companyId, siteId, logDateFrom, logDateTo
 * API: GET /api/v1/core-daily-logs/summary via `getCoreDailyLogSummary`.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  getCoreDailyLogSummary,
  type CoreDailyLogSummary,
} from "@/src/api/core-daily-log";
import { unknownToErrorMessage } from "@/lib/core";
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
import { cn } from "@/src/lib/utils";

function optionalId(val: string): number | undefined {
  if (val.trim() === "") return undefined;
  const n = Number(val);
  return Number.isFinite(n) && n >= 1 ? n : undefined;
}

const coreDailyLogSummaryFilterSchema = z
  .object({
    companyId: z
      .string()
      .transform(optionalId)
      .refine((v) => v === undefined || v >= 1, {
        message: "Company ID must be a positive number",
      }),
    siteId: z
      .string()
      .transform(optionalId)
      .refine((v) => v === undefined || v >= 1, {
        message: "Site ID must be a positive number",
      }),
    logDateFrom: z
      .string()
      .transform((s) => (s.trim() === "" ? undefined : s)),
    logDateTo: z
      .string()
      .transform((s) => (s.trim() === "" ? undefined : s)),
  })
  .superRefine((data, ctx) => {
    if (data.logDateFrom && data.logDateTo) {
      const a = new Date(data.logDateFrom).getTime();
      const b = new Date(data.logDateTo).getTime();
      if (!Number.isNaN(a) && !Number.isNaN(b) && a > b) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Log date from must be on or before log date to",
          path: ["logDateFrom"],
        });
      }
    }
  });

type SummaryFilterInput = z.input<typeof coreDailyLogSummaryFilterSchema>;
type SummaryFilterOutput = z.output<typeof coreDailyLogSummaryFilterSchema>;

export type CoreDailyLogSummaryFormProps = {
  className?: string;
  /** Called after a successful summary fetch with the API response. */
  onSummary?: (summary: CoreDailyLogSummary) => void;
};

export function CoreDailyLogSummaryForm({
  className,
  onSummary,
}: CoreDailyLogSummaryFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<CoreDailyLogSummary | null>(null);

  const form = useForm<SummaryFilterInput, unknown, SummaryFilterOutput>({
    resolver: zodResolver(coreDailyLogSummaryFilterSchema),
    defaultValues: {
      companyId: "",
      siteId: "",
      logDateFrom: "",
      logDateTo: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  async function onValid(values: SummaryFilterOutput) {
    setError(null);
    setSummary(null);
    setLoading(true);
    try {
      const logDateFrom =
        values.logDateFrom != null
          ? new Date(values.logDateFrom).toISOString()
          : undefined;
      const logDateTo =
        values.logDateTo != null
          ? new Date(values.logDateTo).toISOString()
          : undefined;

      const res = await getCoreDailyLogSummary({
        companyId: values.companyId,
        siteId: values.siteId,
        logDateFrom,
        logDateTo,
      });
      setSummary(res);
      onSummary?.(res);
    } catch (e) {
      setSummary(null);
      setError(
        unknownToErrorMessage(
          e,
          "Could not load summary. Check /api/v1/core-daily-logs/summary."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className={cn("max-w-2xl", className)}>
      <CardHeader>
        <CardTitle>Daily log summary</CardTitle>
        <CardDescription>
          Counts by shift for optional company, site, and{" "}
          <code className="font-mono text-xs">logDate</code> range.{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">
            GET /api/v1/core-daily-logs/summary
          </code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <CoreAlert role="alert">{error}</CoreAlert>}

        {summary && (
          <CoreAlert variant="success" role="status">
            <p className="font-medium">Total logs: {summary.total}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                Object.entries(summary.byShift) as [
                  keyof CoreDailyLogSummary["byShift"],
                  number,
                ][]
              ).map(([shift, count]) => (
                <span
                  key={shift}
                  className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-950"
                >
                  {shift}: {count}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Filters applied: company{" "}
              {summary.filters.companyId ?? "—"}, site{" "}
              {summary.filters.siteId ?? "—"}
            </p>
          </CoreAlert>
        )}

        <form
          onSubmit={handleSubmit(onValid)}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="space-y-2">
            <Label htmlFor="cdl-sum-company">Company ID</Label>
            <Input
              id="cdl-sum-company"
              inputMode="numeric"
              placeholder="Any"
              {...register("companyId")}
              disabled={loading}
            />
            {errors.companyId && (
              <p className="text-sm text-red-600">
                {String(errors.companyId.message)}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cdl-sum-site">Site ID</Label>
            <Input
              id="cdl-sum-site"
              inputMode="numeric"
              placeholder="Any"
              {...register("siteId")}
              disabled={loading}
            />
            {errors.siteId && (
              <p className="text-sm text-red-600">
                {String(errors.siteId.message)}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cdl-sum-from">Log date from</Label>
            <Input
              id="cdl-sum-from"
              type="datetime-local"
              {...register("logDateFrom")}
              disabled={loading}
            />
            {errors.logDateFrom && (
              <p className="text-sm text-red-600">
                {errors.logDateFrom.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cdl-sum-to">Log date to</Label>
            <Input
              id="cdl-sum-to"
              type="datetime-local"
              {...register("logDateTo")}
              disabled={loading}
            />
            {errors.logDateTo && (
              <p className="text-sm text-red-600">{errors.logDateTo.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Loading…" : "Run summary"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
