"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Loader2, Plus, Save, X } from "lucide-react";
import { apiPatch, apiPost } from "@/lib/api";
import { Button, CardContent, Input, Label } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { useAdminMutation } from "@/components/admin/useAdminMutation";

export type CompanyUpsertInitial = {
  id: number;
  name: string;
  logoUrl?: string | null;
};

type Props = {
  mode: "create" | "edit";
  initial?: CompanyUpsertInitial;
  cancelHref: string;
};

const MAX_NAME = 200;

function validate(name: string, logoUrl: string) {
  const errors: Record<string, string> = {};
  const n = name.trim();
  if (!n) errors.name = "Company name is required.";
  else if (n.length > MAX_NAME) errors.name = `Keep under ${MAX_NAME} characters.`;
  const lu = logoUrl.trim();
  if (lu) {
    try {
      // eslint-disable-next-line no-new
      new URL(lu);
    } catch {
      errors.logoUrl = "Enter a valid URL or leave blank.";
    }
  }
  return errors;
}

export function CompanyUpsertForm({ mode, initial, cancelHref }: Props) {
  const { pending, error, setError, run } = useAdminMutation();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const defaults = useMemo(
    () => ({
      name: initial?.name ?? "",
      logoUrl: initial?.logoUrl ?? "",
    }),
    [initial]
  );

  const [name, setName] = useState(defaults.name);
  const [logoUrl, setLogoUrl] = useState(defaults.logoUrl);

  function resetEmpty() {
    setName("");
    setLogoUrl("");
    setFieldErrors({});
    setError(null);
  }

  async function submit() {
    const ve = validate(name, logoUrl);
    setFieldErrors(ve);
    if (Object.keys(ve).length) {
      setError("Fix the highlighted fields.");
      return;
    }
    setError(null);
    const n = name.trim();
    const lu = logoUrl.trim();

    if (mode === "create") {
      await run(
        async () => {
          await apiPost<{ id: number }>("/companies", {
            name: n,
            ...(lu ? { logoUrl: lu } : {}),
          });
        },
        {
          successTitle: "Company created",
          successDescription: n,
          redirectTo: "/admin/companies",
          onSuccess: () => resetEmpty(),
        }
      );
      return;
    }

    if (!initial?.id) throw new Error("Missing company id");
    await run(
      async () => {
        await apiPatch(`/companies/${initial.id}`, {
          name: n,
          logoUrl: lu || null,
        });
      },
      {
        successTitle: "Company updated",
        redirectTo: `/admin/companies/${initial.id}`,
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
          <Label htmlFor="name">Company name</Label>
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
          <Label htmlFor="logoUrl">Logo URL (optional)</Label>
          <Input
            id="logoUrl"
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://…"
            aria-invalid={!!fieldErrors.logoUrl}
          />
          {fieldErrors.logoUrl ? <p className="text-sm text-red-600">{fieldErrors.logoUrl}</p> : null}
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
            {pending ? "Saving…" : mode === "create" ? "Create company" : "Save changes"}
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
