"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Loader2, Plus, Save, X } from "lucide-react";
import { apiPatch, apiPost } from "@/lib/api";
import { Button, CardContent, Input, Label, Textarea } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { useAdminMutation } from "@/components/admin/useAdminMutation";

export type CertificationUpsertInitial = {
  id: number;
  name: string;
  description: string;
  expiryDays: number;
};

type Props = {
  mode: "create" | "edit";
  initial?: CertificationUpsertInitial;
  cancelHref: string;
};

function validate(name: string, description: string, expiryDays: number) {
  const errors: Record<string, string> = {};
  if (!name.trim()) errors.name = "Name is required.";
  if (!description.trim()) errors.description = "Description is required.";
  if (!Number.isFinite(expiryDays) || expiryDays < 1) {
    errors.expiryDays = "Enter a positive number of days.";
  }
  return errors;
}

export function CertificationUpsertForm({ mode, initial, cancelHref }: Props) {
  const { pending, error, setError, run } = useAdminMutation();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const defaults = useMemo(
    () => ({
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      expiryDays: initial?.expiryDays ?? 365,
    }),
    [initial]
  );

  const [name, setName] = useState(defaults.name);
  const [description, setDescription] = useState(defaults.description);
  const [expiryDays, setExpiryDays] = useState(String(defaults.expiryDays));

  function resetEmpty() {
    setName("");
    setDescription("");
    setExpiryDays("365");
    setFieldErrors({});
    setError(null);
  }

  async function submit() {
    const days = Number(expiryDays);
    const ve = validate(name, description, days);
    setFieldErrors(ve);
    if (Object.keys(ve).length) {
      setError("Fix the highlighted fields.");
      return;
    }
    setError(null);

    if (mode === "create") {
      await run(
        async () => {
          await apiPost("/certifications", {
            name: name.trim(),
            description: description.trim(),
            expiryDays: days,
          });
        },
        {
          successTitle: "Certification created",
          redirectTo: "/admin/certifications",
          onSuccess: () => resetEmpty(),
        }
      );
      return;
    }

    if (!initial?.id) throw new Error("Missing certification id");
    await run(
      async () => {
        await apiPatch(`/certifications/${initial.id}`, {
          name: name.trim(),
          description: description.trim(),
          expiryDays: days,
        });
      },
      {
        successTitle: "Certification updated",
        redirectTo: `/admin/certifications/${initial.id}`,
      }
    );
  }

  return (
    <CardContent className="space-y-vera-6 p-vera-8">
      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-vera-4 py-vera-3 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      ) : null}
      <form
        className="space-y-vera-6"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="space-y-vera-2">
          <Label htmlFor="name">Certification name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            aria-invalid={!!fieldErrors.name}
          />
          {fieldErrors.name ? <p className="text-sm text-red-600">{fieldErrors.name}</p> : null}
        </div>
        <div className="space-y-vera-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            aria-invalid={!!fieldErrors.description}
          />
          {fieldErrors.description ? (
            <p className="text-sm text-red-600">{fieldErrors.description}</p>
          ) : null}
        </div>
        <div className="space-y-vera-2">
          <Label htmlFor="expiryDays">Expiry (days)</Label>
          <Input
            id="expiryDays"
            type="number"
            min={1}
            value={expiryDays}
            onChange={(e) => setExpiryDays(e.target.value)}
            required
            aria-invalid={!!fieldErrors.expiryDays}
          />
          {fieldErrors.expiryDays ? (
            <p className="text-sm text-red-600">{fieldErrors.expiryDays}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-vera-3">
          <Button type="submit" variant="teal" disabled={pending}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : mode === "create" ? (
              <Plus className="h-4 w-4" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            {pending ? "Saving…" : mode === "create" ? "Create certification" : "Save changes"}
          </Button>
          <Link href={cancelHref} className={buttonStyles({ variant: "outline" })}>
            <X className="h-4 w-4" aria-hidden />
            Cancel
          </Link>
        </div>
      </form>
    </CardContent>
  );
}
