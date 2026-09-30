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
import { useCoreSiteRiskMutations } from "@/src/hooks/useCoreSiteRiskMutations";
import {
  CORE_SITE_RISK_CATEGORIES,
  CORE_SITE_RISK_SEVERITIES,
  CORE_SITE_RISK_STATUSES,
  coreSiteRiskCreateSchema,
  type CoreSiteRiskFormInput,
  type CoreSiteRiskFormOutput,
} from "./core-site-risk.schema";

function defaultIdentifiedAtLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function CoreSiteRiskForm() {
  const { busy, error, success, clearMessages, create } =
    useCoreSiteRiskMutations();

  const form = useForm<
    CoreSiteRiskFormInput,
    unknown,
    CoreSiteRiskFormOutput
  >({
    resolver: zodResolver(coreSiteRiskCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "OTHER",
      severity: "MEDIUM",
      status: "OPEN",
      identifiedAt: defaultIdentifiedAtLocal(),
      mitigatedAt: "",
      locationNote: "",
      companyId: "",
      siteId: "",
      ownerUserId: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  async function onValid(values: CoreSiteRiskFormOutput) {
    clearMessages();
    try {
      const identifiedIso = new Date(values.identifiedAt).toISOString();
      let mitigatedIso: string | undefined;
      if (values.mitigatedAt) {
        mitigatedIso = new Date(values.mitigatedAt).toISOString();
      }

      const payload = {
        title: values.title.trim(),
        description: values.description,
        category: values.category,
        severity: values.severity,
        status: values.status,
        identifiedAt: identifiedIso,
        ...(mitigatedIso !== undefined && { mitigatedAt: mitigatedIso }),
        locationNote: values.locationNote,
        ...(values.companyId !== undefined && { companyId: values.companyId }),
        ...(values.siteId !== undefined && { siteId: values.siteId }),
        ...(values.ownerUserId !== undefined && {
          ownerUserId: values.ownerUserId,
        }),
      };

      await create(payload);
      reset({
        title: "",
        description: "",
        category: "OTHER",
        severity: "MEDIUM",
        status: "OPEN",
        identifiedAt: defaultIdentifiedAtLocal(),
        mitigatedAt: "",
        locationNote: "",
        companyId: "",
        siteId: "",
        ownerUserId: "",
      });
    } catch {}
  }

  const submitting = isSubmitting || busy;

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>New site risk</CardTitle>
        <CardDescription>
          Track a site hazard or mitigation in the VERA Core risk register.{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">
            POST /api/v1/core-site-risks
          </code>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onValid)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csr-title">Title</Label>
            <Input
              id="csr-title"
              placeholder="Unprotected leading edge — level 3"
              {...register("title")}
              disabled={submitting}
              autoComplete="off"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="csr-desc">Description</Label>
            <Textarea
              id="csr-desc"
              placeholder="Context, exposure, existing controls…"
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
              <Label htmlFor="csr-category">Category</Label>
              <select
                id="csr-category"
                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
                {...register("category")}
                disabled={submitting}
              >
                {CORE_SITE_RISK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="csr-severity">Severity</Label>
              <select
                id="csr-severity"
                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
                {...register("severity")}
                disabled={submitting}
              >
                {CORE_SITE_RISK_SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csr-status">Status</Label>
            <select
              id="csr-status"
              className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
              {...register("status")}
              disabled={submitting}
            >
              {CORE_SITE_RISK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="csr-identified">Identified</Label>
              <Input
                id="csr-identified"
                type="datetime-local"
                {...register("identifiedAt")}
                disabled={submitting}
              />
              {errors.identifiedAt && (
                <p className="text-sm text-red-600">
                  {String(errors.identifiedAt.message)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="csr-mitigated">Mitigated (optional)</Label>
              <Input
                id="csr-mitigated"
                type="datetime-local"
                {...register("mitigatedAt")}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csr-loc">Location note</Label>
            <Input
              id="csr-loc"
              placeholder="Building, grid, area…"
              {...register("locationNote")}
              disabled={submitting}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="csr-company">Company ID</Label>
              <Input
                id="csr-company"
                type="number"
                min={1}
                placeholder="Optional"
                {...register("companyId")}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="csr-site">Site ID</Label>
              <Input
                id="csr-site"
                type="number"
                min={1}
                placeholder="Optional"
                {...register("siteId")}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="csr-owner">Owner user ID</Label>
              <Input
                id="csr-owner"
                type="number"
                min={1}
                placeholder="Optional"
                {...register("ownerUserId")}
                disabled={submitting}
              />
            </div>
          </div>

          {success && (
            <CoreAlert variant="success" role="status">
              <p>{success}</p>
              <p className="mt-2">
                <Link
                  href="/core/site-risks"
                  className="font-medium text-emerald-900 underline underline-offset-2 hover:text-emerald-950"
                >
                  View site risks list
                </Link>
              </p>
            </CoreAlert>
          )}
          {error && <CoreAlert>{error}</CoreAlert>}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Create site risk"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
