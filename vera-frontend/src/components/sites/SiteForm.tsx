"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  siteCreateSchema,
  type SiteCreateFormInput,
  type SiteCreateInput,
} from "@/src/lib/site.schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface SiteFormProps {
  onSubmit: (values: SiteCreateInput) => Promise<void>;
  disabled?: boolean;
}

export function SiteForm({ onSubmit, disabled }: SiteFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<SiteCreateFormInput, unknown, SiteCreateInput>({
    resolver: zodResolver(siteCreateSchema),
    defaultValues: {
      name: "",
      code: "",
      region: "",
      active: true,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = form;
  const activeChecked = watch("active") ?? true;

  async function internalSubmit(values: SiteCreateInput) {
    setSubmitError(null);
    try {
      await onSubmit(values);
      reset({
        name: "",
        code: "",
        region: "",
        active: true,
      });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : String(e));
    }
  }

  const busy = disabled || isSubmitting;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create site</CardTitle>
        <CardDescription>
          Unique optional <code className="text-xs">code</code> is used in QR and directory
          filters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(internalSubmit)}
          className="space-y-4 max-w-md"
        >
          <div className="space-y-2">
            <Label htmlFor="site-name">Name</Label>
            <Input
              id="site-name"
              placeholder="River Crossing Yard"
              {...register("name")}
              disabled={busy}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-code">Code (optional)</Label>
            <Input
              id="site-code"
              placeholder="RCY-01"
              {...register("code")}
              disabled={busy}
            />
            {errors.code && (
              <p className="text-sm text-red-600">{errors.code.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-region">Region (optional)</Label>
            <Input
              id="site-region"
              placeholder="Northern Division"
              {...register("region")}
              disabled={busy}
            />
            {errors.region && (
              <p className="text-sm text-red-600">{errors.region.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="site-active"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300"
              checked={activeChecked}
              onChange={(e) =>
                setValue("active", e.target.checked, { shouldValidate: true })
              }
              disabled={busy}
            />
            <Label htmlFor="site-active" className="font-normal">
              Active
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
            {isSubmitting ? "Saving…" : "Create site"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
