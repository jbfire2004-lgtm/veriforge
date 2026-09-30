"use client";

/**
 * VERA Core — Core Action Item form (RHF + Zod + ShadCN).
 * POST /api/v1/core-action-items
 */

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
import { useCoreActionItemMutations } from "@/src/hooks/useCoreActionItemMutations";
import {
  CORE_ACTION_PRIORITIES,
  CORE_ACTION_STATUSES,
  coreActionItemCreateSchema,
  type CoreActionItemFormInput,
  type CoreActionItemFormOutput,
} from "./core-action-item.schema";

function toIsoOrUndefined(dueAtLocal: string | undefined): string | undefined {
  if (!dueAtLocal) return undefined;
  const d = new Date(dueAtLocal);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export function CoreActionItemForm() {
  const { busy, error, success, clearMessages, create } =
    useCoreActionItemMutations();

  const form = useForm<
    CoreActionItemFormInput,
    unknown,
    CoreActionItemFormOutput
  >({
    resolver: zodResolver(coreActionItemCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "OPEN",
      dueAt: "",
      priority: "NORMAL",
      companyId: "",
      createdById: "",
      coreMeetingRecordId: "",
      coreDailyLogId: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  async function onValid(values: CoreActionItemFormOutput) {
    clearMessages();
    try {
      const dueAt = toIsoOrUndefined(values.dueAt);
      const payload = {
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        status: values.status,
        ...(dueAt !== undefined && { dueAt }),
        priority: values.priority,
        ...(values.companyId !== undefined && { companyId: values.companyId }),
        ...(values.createdById !== undefined && {
          createdById: values.createdById,
        }),
        ...(values.coreMeetingRecordId !== undefined && {
          coreMeetingRecordId: values.coreMeetingRecordId,
        }),
        ...(values.coreDailyLogId !== undefined && {
          coreDailyLogId: values.coreDailyLogId,
        }),
      };

      await create(payload);
      reset({
        title: "",
        description: "",
        status: "OPEN",
        dueAt: "",
        priority: "NORMAL",
        companyId: "",
        createdById: "",
        coreMeetingRecordId: "",
        coreDailyLogId: "",
      });
    } catch {}
  }

  const submitting = isSubmitting || busy;

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>New core action item</CardTitle>
        <CardDescription>
          Safety / compliance follow-up. Sends{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">
            POST /api/v1/core-action-items
          </code>
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onValid)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cai-title">Title</Label>
            <Input
              id="cai-title"
              placeholder="Inspect confined space ventilation"
              {...register("title")}
              disabled={submitting}
              autoComplete="off"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cai-desc">Description</Label>
            <Textarea
              id="cai-desc"
              placeholder="Context, location, link to incident…"
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
              <Label htmlFor="cai-status">Status</Label>
              <select
                id="cai-status"
                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
                {...register("status")}
                disabled={submitting}
              >
                {CORE_ACTION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cai-priority">Priority</Label>
              <select
                id="cai-priority"
                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
                {...register("priority")}
                disabled={submitting}
              >
                {CORE_ACTION_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {errors.priority && (
                <p className="text-sm text-red-600">
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cai-due">Due</Label>
            <Input
              id="cai-due"
              type="datetime-local"
              {...register("dueAt")}
              disabled={submitting}
            />
            {errors.dueAt && (
              <p className="text-sm text-red-600">{errors.dueAt.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cai-meeting">Meeting record ID (optional)</Label>
            <Input
              id="cai-meeting"
              type="number"
              min={1}
              placeholder="Link to toolbox / team safety meeting"
              {...register("coreMeetingRecordId")}
              disabled={submitting}
            />
            {errors.coreMeetingRecordId && (
              <p className="text-sm text-red-600">
                {String(errors.coreMeetingRecordId.message)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cai-daily-log">Daily log ID (optional)</Label>
            <Input
              id="cai-daily-log"
              type="number"
              min={1}
              placeholder="Link to a shift / site daily log"
              {...register("coreDailyLogId")}
              disabled={submitting}
            />
            <p className="text-xs text-slate-500">
              Do not set both a meeting record and a daily log on the same item.
            </p>
            {errors.coreDailyLogId && (
              <p className="text-sm text-red-600">
                {String(errors.coreDailyLogId.message)}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cai-company">Company ID (optional)</Label>
              <Input
                id="cai-company"
                type="number"
                min={1}
                placeholder="e.g. 1"
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
              <Label htmlFor="cai-user">Created by user ID (optional)</Label>
              <Input
                id="cai-user"
                type="number"
                min={1}
                placeholder="e.g. 3"
                {...register("createdById")}
                disabled={submitting}
              />
              {errors.createdById && (
                <p className="text-sm text-red-600">
                  {String(errors.createdById.message)}
                </p>
              )}
            </div>
          </div>

          {success && (
            <CoreAlert variant="success" role="status">
              <p>{success}</p>
              <p className="mt-2">
                <Link
                  href="/core/action-items"
                  className="font-medium text-emerald-900 underline underline-offset-2 hover:text-emerald-950"
                >
                  View action items list
                </Link>
              </p>
            </CoreAlert>
          )}

          {error && <CoreAlert>{error}</CoreAlert>}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Create core action item"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
