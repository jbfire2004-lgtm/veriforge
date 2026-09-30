"use client";

/**
 * VERA Core — Meeting record summary filter form.
 * Calls GET /api/v1/core-meeting-records/summary via `getCoreMeetingRecordSummary`.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  getCoreMeetingRecordSummary,
  type CoreMeetingRecordSummary,
} from "@/src/api/core-meeting-record";
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

function optionalId(val: string): number | undefined {
  if (val.trim() === "") return undefined;
  const n = Number(val);
  return Number.isFinite(n) && n >= 1 ? n : undefined;
}

const coreMeetingRecordSummaryFilterSchema = z
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
    heldFrom: z
      .string()
      .transform((s) => (s.trim() === "" ? undefined : s)),
    heldTo: z
      .string()
      .transform((s) => (s.trim() === "" ? undefined : s)),
  })
  .superRefine((data, ctx) => {
    if (data.heldFrom && data.heldTo) {
      const a = new Date(data.heldFrom).getTime();
      const b = new Date(data.heldTo).getTime();
      if (!Number.isNaN(a) && !Number.isNaN(b) && a > b) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Held from must be on or before held to",
          path: ["heldFrom"],
        });
      }
    }
  });

type SummaryFilterInput = z.input<typeof coreMeetingRecordSummaryFilterSchema>;
type SummaryFilterOutput = z.output<typeof coreMeetingRecordSummaryFilterSchema>;

export type CoreMeetingRecordSummaryFormProps = {
  className?: string;
  /** Called after a successful summary fetch with the API response. */
  onSummary?: (summary: CoreMeetingRecordSummary) => void;
};

export function CoreMeetingRecordSummaryForm({
  className,
  onSummary,
}: CoreMeetingRecordSummaryFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<CoreMeetingRecordSummary | null>(
    null
  );

  const form = useForm<SummaryFilterInput, unknown, SummaryFilterOutput>({
    resolver: zodResolver(coreMeetingRecordSummaryFilterSchema),
    defaultValues: {
      companyId: "",
      siteId: "",
      heldFrom: "",
      heldTo: "",
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
      const heldFrom =
        values.heldFrom != null
          ? new Date(values.heldFrom).toISOString()
          : undefined;
      const heldTo =
        values.heldTo != null
          ? new Date(values.heldTo).toISOString()
          : undefined;

      const res = await getCoreMeetingRecordSummary({
        companyId: values.companyId,
        siteId: values.siteId,
        heldFrom,
        heldTo,
      });
      setSummary(res);
      onSummary?.(res);
    } catch (e) {
      setSummary(null);
      setError(
        unknownToErrorMessage(
          e,
          "Could not load summary. Check /api/v1/core-meeting-records/summary."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Meeting record summary</CardTitle>
        <CardDescription>
          Filter by company, site, and when meetings were held. Uses{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">
            GET /api/v1/core-meeting-records/summary
          </code>
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <CoreAlert>{error}</CoreAlert>}

        {summary && (
          <CoreAlert variant="success" role="status">
            <p className="font-medium">Total records: {summary.total}</p>
            <ul className="mt-2 list-inside list-disc text-sm">
              {(
                Object.entries(summary.byType) as [
                  keyof CoreMeetingRecordSummary["byType"],
                  number,
                ][]
              ).map(([type, count]) => (
                <li key={type}>
                  {type.replace(/_/g, " ")}: {count}
                </li>
              ))}
            </ul>
          </CoreAlert>
        )}

        <form
          onSubmit={handleSubmit(onValid)}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="space-y-2">
            <Label htmlFor="sum-company">Company ID</Label>
            <Input
              id="sum-company"
              type="number"
              min={1}
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
            <Label htmlFor="sum-site">Site ID</Label>
            <Input
              id="sum-site"
              type="number"
              min={1}
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
            <Label htmlFor="sum-from">Held from</Label>
            <Input
              id="sum-from"
              type="datetime-local"
              {...register("heldFrom")}
              disabled={loading}
            />
            {errors.heldFrom && (
              <p className="text-sm text-red-600">
                {errors.heldFrom.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="sum-to">Held to</Label>
            <Input
              id="sum-to"
              type="datetime-local"
              {...register("heldTo")}
              disabled={loading}
            />
            {errors.heldTo && (
              <p className="text-sm text-red-600">{errors.heldTo.message}</p>
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
