"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createCoreMeetingRecord } from "@/src/api/core-meeting-record";
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
import { Textarea } from "@/components/ui/textarea";
import {
  CORE_MEETING_RECORD_TYPES,
  coreMeetingRecordCreateSchema,
  type CoreMeetingRecordFormInput,
  type CoreMeetingRecordFormOutput,
} from "./core-meeting-record.schema";

function defaultHeldAtLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function CoreMeetingRecordForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<
    CoreMeetingRecordFormInput,
    unknown,
    CoreMeetingRecordFormOutput
  >({
    resolver: zodResolver(coreMeetingRecordCreateSchema),
    defaultValues: {
      title: "",
      body: "",
      meetingType: "TOOLBOX",
      heldAt: defaultHeldAtLocal(),
      companyId: "",
      siteId: "",
      recordedByUserId: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const busy = isSubmitting;

  async function onValid(values: CoreMeetingRecordFormOutput) {
    setSubmitError(null);
    setSuccess(null);
    try {
      const heldIso = new Date(values.heldAt).toISOString();
      const payload = {
        title: values.title.trim(),
        body: values.body,
        meetingType: values.meetingType,
        heldAt: heldIso,
        ...(values.companyId !== undefined && { companyId: values.companyId }),
        ...(values.siteId !== undefined && { siteId: values.siteId }),
        ...(values.recordedByUserId !== undefined && {
          recordedByUserId: values.recordedByUserId,
        }),
      };

      const created = await createCoreMeetingRecord(payload);
      setSuccess(
        `Saved meeting record #${created.id} — ${created.title} (${created.meetingType}).`
      );
      reset({
        title: "",
        body: "",
        meetingType: "TOOLBOX",
        heldAt: defaultHeldAtLocal(),
        companyId: "",
        siteId: "",
        recordedByUserId: "",
      });
    } catch (e) {
      setSuccess(null);
      setSubmitError(
        unknownToErrorMessage(
          e,
          "Could not save. Check API and POST /api/v1/core-meeting-records."
        )
      );
    }
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>New meeting record</CardTitle>
        <CardDescription>
          Toolbox, team safety, or management review minutes.{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">
            POST /api/v1/core-meeting-records
          </code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success && (
          <CoreAlert variant="success" role="status">
            {success}
          </CoreAlert>
        )}
        {submitError && <CoreAlert>{submitError}</CoreAlert>}

        <form onSubmit={handleSubmit(onValid)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cmr-title">Title</Label>
            <Input
              id="cmr-title"
              placeholder="Toolbox — crane operations"
              {...register("title")}
              disabled={busy}
              autoComplete="off"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cmr-body">Minutes / notes</Label>
            <Textarea
              id="cmr-body"
              placeholder="Topics discussed, actions, attendees…"
              rows={5}
              {...register("body")}
              disabled={busy}
            />
            {errors.body && (
              <p className="text-sm text-red-600">{errors.body.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cmr-type">Meeting type</Label>
              <select
                id="cmr-type"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none disabled:opacity-50"
                {...register("meetingType")}
                disabled={busy}
              >
                {CORE_MEETING_RECORD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              {errors.meetingType && (
                <p className="text-sm text-red-600">
                  {errors.meetingType.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cmr-held">Held at</Label>
              <Input
                id="cmr-held"
                type="datetime-local"
                {...register("heldAt")}
                disabled={busy}
              />
              {errors.heldAt && (
                <p className="text-sm text-red-600">{errors.heldAt.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="cmr-company">Company ID</Label>
              <Input
                id="cmr-company"
                type="number"
                min={1}
                placeholder="Optional"
                {...register("companyId")}
                disabled={busy}
              />
              {errors.companyId && (
                <p className="text-sm text-red-600">
                  {String(errors.companyId.message)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cmr-site">Site ID</Label>
              <Input
                id="cmr-site"
                type="number"
                min={1}
                placeholder="Optional"
                {...register("siteId")}
                disabled={busy}
              />
              {errors.siteId && (
                <p className="text-sm text-red-600">
                  {String(errors.siteId.message)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cmr-user">Recorder user ID</Label>
              <Input
                id="cmr-user"
                type="number"
                min={1}
                placeholder="Optional"
                {...register("recordedByUserId")}
                disabled={busy}
              />
              {errors.recordedByUserId && (
                <p className="text-sm text-red-600">
                  {String(errors.recordedByUserId.message)}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save meeting record"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
