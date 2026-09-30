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
import { useCoreComplianceNoteMutations } from "@/src/hooks/useCoreComplianceNoteMutations";
import {
  CORE_COMPLIANCE_NOTE_CATEGORIES,
  CORE_COMPLIANCE_NOTE_PRIORITIES,
  CORE_COMPLIANCE_NOTE_STATUSES,
  coreComplianceNoteCreateSchema,
  type CoreComplianceNoteFormInput,
  type CoreComplianceNoteFormOutput,
} from "./core-compliance-note.schema";

function toIsoOrUndefined(dueAtLocal: string | undefined): string | undefined {
  if (!dueAtLocal) return undefined;
  const d = new Date(dueAtLocal);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export function CoreComplianceNoteForm() {
  const { busy, error, success, clearMessages, create } =
    useCoreComplianceNoteMutations();

  const form = useForm<
    CoreComplianceNoteFormInput,
    unknown,
    CoreComplianceNoteFormOutput
  >({
    resolver: zodResolver(coreComplianceNoteCreateSchema),
    defaultValues: {
      title: "",
      body: "",
      category: "INTERNAL",
      status: "DRAFT",
      priority: "NORMAL",
      dueAt: "",
      companyId: "",
      siteId: "",
      createdByUserId: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  async function onValid(values: CoreComplianceNoteFormOutput) {
    clearMessages();
    try {
      const dueAt = toIsoOrUndefined(values.dueAt);
      const payload = {
        title: values.title.trim(),
        body: values.body,
        category: values.category,
        status: values.status,
        priority: values.priority,
        ...(dueAt !== undefined && { dueAt }),
        ...(values.companyId !== undefined && { companyId: values.companyId }),
        ...(values.siteId !== undefined && { siteId: values.siteId }),
        ...(values.createdByUserId !== undefined && {
          createdByUserId: values.createdByUserId,
        }),
      };

      await create(payload);
      reset({
        title: "",
        body: "",
        category: "INTERNAL",
        status: "DRAFT",
        priority: "NORMAL",
        dueAt: "",
        companyId: "",
        siteId: "",
        createdByUserId: "",
      });
    } catch {}
  }

  const submitting = isSubmitting || busy;

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>New compliance note</CardTitle>
        <CardDescription>
          Regulatory / audit tracking.{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">
            POST /api/v1/core-compliance-notes
          </code>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onValid)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ccn-title">Title</Label>
            <Input
              id="ccn-title"
              placeholder="Quarterly audit follow-up"
              {...register("title")}
              disabled={submitting}
              autoComplete="off"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ccn-body">Body</Label>
            <Textarea
              id="ccn-body"
              placeholder="Details, citations, next steps…"
              {...register("body")}
              disabled={submitting}
            />
            {errors.body && (
              <p className="text-sm text-red-600">{errors.body.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="ccn-category">Category</Label>
              <select
                id="ccn-category"
                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
                {...register("category")}
                disabled={submitting}
              >
                {CORE_COMPLIANCE_NOTE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ccn-status">Status</Label>
              <select
                id="ccn-status"
                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
                {...register("status")}
                disabled={submitting}
              >
                {CORE_COMPLIANCE_NOTE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ccn-priority">Priority</Label>
              <select
                id="ccn-priority"
                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
                {...register("priority")}
                disabled={submitting}
              >
                {CORE_COMPLIANCE_NOTE_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ccn-due">Due (optional)</Label>
            <Input
              id="ccn-due"
              type="datetime-local"
              {...register("dueAt")}
              disabled={submitting}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="ccn-company">Company ID</Label>
              <Input
                id="ccn-company"
                inputMode="numeric"
                placeholder="Optional"
                {...register("companyId")}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ccn-site">Site ID</Label>
              <Input
                id="ccn-site"
                inputMode="numeric"
                placeholder="Optional"
                {...register("siteId")}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ccn-user">Created by user ID</Label>
              <Input
                id="ccn-user"
                inputMode="numeric"
                placeholder="Optional"
                {...register("createdByUserId")}
                disabled={submitting}
              />
            </div>
          </div>

          {success && (
            <CoreAlert variant="success" role="status">
              <p>{success}</p>
              <p className="mt-2">
                <Link
                  href="/core/compliance-notes"
                  className="font-medium text-emerald-900 underline underline-offset-2 hover:text-emerald-950"
                >
                  View compliance notes list
                </Link>
              </p>
            </CoreAlert>
          )}

          {error && <CoreAlert>{error}</CoreAlert>}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Create note"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
