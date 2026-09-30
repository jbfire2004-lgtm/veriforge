"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { apiGet } from "@/lib/api";
import type { SiteDto } from "@/src/api/sites";
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
  siteContactCreateSchema,
  type SiteContactCreateInputValues,
  type SiteContactCreateValues,
} from "@/src/lib/site-contact.schema";

export interface SiteContactFormProps {
  onSubmit: (values: SiteContactCreateValues) => Promise<void>;
  disabled?: boolean;
  defaultSiteId?: number;
}

export function SiteContactForm({
  onSubmit,
  disabled,
  defaultSiteId,
}: SiteContactFormProps) {
  const [sites, setSites] = useState<SiteDto[]>([]);
  const [sitesError, setSitesError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ data: SiteDto[] }>("/api/v1/sites?limit=100")
      .then((res) => setSites(res.data))
      .catch((e) =>
        setSitesError(e instanceof Error ? e.message : String(e))
      );
  }, []);

  const form = useForm<SiteContactCreateInputValues, unknown, SiteContactCreateValues>({
    resolver: zodResolver(siteContactCreateSchema),
    defaultValues: {
      siteId: defaultSiteId ?? 0,
      fullName: "",
      email: "",
      phone: "",
      role: "",
      isPrimary: false,
    },
  });

  useEffect(() => {
    if (defaultSiteId && defaultSiteId > 0) {
      form.setValue("siteId", defaultSiteId);
    }
  }, [defaultSiteId, form]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  const primary = watch("isPrimary") ?? false;

  async function internalSubmit(values: SiteContactCreateValues) {
    setSubmitError(null);
    try {
      await onSubmit({
        ...values,
        siteId: Number(values.siteId),
        email: values.email?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        role: values.role?.trim() || undefined,
      });
      reset({
        siteId: values.siteId,
        fullName: "",
        email: "",
        phone: "",
        role: "",
        isPrimary: false,
      });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : String(e));
    }
  }

  const busy = disabled || isSubmitting;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add site contact</CardTitle>
        <CardDescription>
          Escalation contacts for a work site. Marking primary clears other
          primaries for that site on the server.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sitesError && (
          <p className="text-sm text-red-600 mb-4" role="alert">
            Could not load sites: {sitesError}
          </p>
        )}
        <form
          onSubmit={handleSubmit(internalSubmit)}
          className="space-y-4 max-w-lg"
        >
          <div className="space-y-2">
            <Label htmlFor="sc-site">Site</Label>
            <select
              id="sc-site"
              className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
              {...register("siteId", { valueAsNumber: true })}
              disabled={busy}
            >
              <option value={0}>Select site…</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.code ? ` (${s.code})` : ""}
                </option>
              ))}
            </select>
            {errors.siteId && (
              <p className="text-sm text-red-600">{errors.siteId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sc-name">Full name</Label>
            <Input id="sc-name" {...register("fullName")} disabled={busy} />
            {errors.fullName && (
              <p className="text-sm text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sc-email">Email</Label>
            <Input
              id="sc-email"
              type="email"
              {...register("email")}
              disabled={busy}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sc-phone">Phone</Label>
            <Input id="sc-phone" {...register("phone")} disabled={busy} />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sc-role">Role</Label>
            <Input id="sc-role" {...register("role")} disabled={busy} />
            {errors.role && (
              <p className="text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="sc-primary"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300"
              checked={primary}
              onChange={(e) =>
                setValue("isPrimary", e.target.checked, { shouldValidate: true })
              }
              disabled={busy}
            />
            <Label htmlFor="sc-primary" className="font-normal">
              Primary contact for this site
            </Label>
          </div>

          {submitError && (
            <div
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {submitError}
            </div>
          )}

          <Button type="submit" disabled={busy}>
            {isSubmitting ? "Saving…" : "Save contact"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
