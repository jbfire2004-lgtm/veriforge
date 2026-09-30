"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Loader2, Plus, Save, X } from "lucide-react";
import { apiPatch, apiPost } from "@/lib/api";
import { Button, CardContent, Input, Label, Select } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { useAdminMutation } from "@/components/admin/useAdminMutation";

export type EquipmentCompanyOption = { id: number; name: string };

export type EquipmentSafetyOption = "OK" | "NEEDS_INSPECTION" | "UNSAFE";

export type EquipmentUpsertInitial = {
  id: number;
  name: string;
  companyId: number | null;
  serialNumber: string | null;
  safetyStatus?: string;
  photoUrl?: string | null;
};

type Props = {
  mode: "create" | "edit";
  companies: EquipmentCompanyOption[];
  initial?: EquipmentUpsertInitial;
  cancelHref: string;
};

function parseSafety(v: string | undefined): EquipmentSafetyOption {
  if (v === "NEEDS_INSPECTION" || v === "UNSAFE") return v;
  return "OK";
}

function validate(name: string, companyIdStr: string, serialNumber: string, photoUrl: string) {
  const errors: Record<string, string> = {};
  if (!name.trim()) errors.name = "Equipment name is required.";
  const cid = companyIdStr ? Number(companyIdStr) : NaN;
  if (!Number.isFinite(cid) || cid < 1) errors.companyId = "Select a valid company.";
  const pu = photoUrl.trim();
  if (pu) {
    try {
      // eslint-disable-next-line no-new
      new URL(pu);
    } catch {
      errors.photoUrl = "Enter a valid URL or leave blank.";
    }
  }
  return errors;
}

export function EquipmentUpsertForm({ mode, companies, initial, cancelHref }: Props) {
  const { pending, error, setError, run } = useAdminMutation();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const defaults = useMemo(
    () => ({
      name: initial?.name ?? "",
      companyId: initial?.companyId != null ? String(initial.companyId) : "",
      serialNumber: initial?.serialNumber ?? "",
      safetyStatus: parseSafety(initial?.safetyStatus),
      photoUrl: initial?.photoUrl ?? "",
    }),
    [initial]
  );

  const [name, setName] = useState(defaults.name);
  const [companyId, setCompanyId] = useState(defaults.companyId);
  const [serialNumber, setSerialNumber] = useState(defaults.serialNumber);
  const [safetyStatus, setSafetyStatus] = useState<EquipmentSafetyOption>(defaults.safetyStatus);
  const [photoUrl, setPhotoUrl] = useState(defaults.photoUrl);

  function resetEmpty() {
    setName("");
    setCompanyId("");
    setSerialNumber("");
    setSafetyStatus("OK");
    setPhotoUrl("");
    setFieldErrors({});
    setError(null);
  }

  async function submit() {
    const ve = validate(name, companyId, serialNumber, photoUrl);
    setFieldErrors(ve);
    if (Object.keys(ve).length) {
      setError("Fix the highlighted fields.");
      return;
    }
    setError(null);
    const cid = Number(companyId);
    const sn = serialNumber.trim();
    const pu = photoUrl.trim();

    const payload = {
      name: name.trim(),
      companyId: cid,
      serialNumber: sn || undefined,
      safetyStatus,
      ...(pu ? { photoUrl: pu } : {}),
    };

    if (mode === "create") {
      await run(
        async () => {
          await apiPost("/api/v1/equipment", payload);
        },
        {
          successTitle: "Equipment created",
          redirectTo: "/admin/equipment",
          onSuccess: () => resetEmpty(),
        }
      );
      return;
    }

    if (!initial?.id) throw new Error("Missing equipment id");
    await run(
      async () => {
        await apiPatch(`/api/v1/equipment/${initial.id}`, {
          ...payload,
          photoUrl: pu || null,
          serialNumber: sn || null,
        });
      },
      {
        successTitle: "Equipment updated",
        redirectTo: `/admin/equipment/${initial.id}`,
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
          <Label htmlFor="name">Equipment name</Label>
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
          <Label htmlFor="companyId">Company</Label>
          <Select
            id="companyId"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            required
            aria-invalid={!!fieldErrors.companyId}
          >
            <option value="">Select company</option>
            {companies.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </Select>
          {fieldErrors.companyId ? <p className="text-sm text-red-600">{fieldErrors.companyId}</p> : null}
        </div>
        <div className="space-y-vera-2">
          <Label htmlFor="serialNumber">Serial number</Label>
          <Input id="serialNumber" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
        </div>
        <div className="space-y-vera-2">
          <Label htmlFor="safetyStatus">Safety status</Label>
          <Select
            id="safetyStatus"
            value={safetyStatus}
            onChange={(e) => setSafetyStatus(e.target.value as EquipmentSafetyOption)}
          >
            <option value="OK">OK</option>
            <option value="NEEDS_INSPECTION">Needs inspection</option>
            <option value="UNSAFE">Unsafe</option>
          </Select>
        </div>
        <div className="space-y-vera-2">
          <Label htmlFor="photoUrl">Photo URL (optional)</Label>
          <Input
            id="photoUrl"
            type="url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://…"
            aria-invalid={!!fieldErrors.photoUrl}
          />
          {fieldErrors.photoUrl ? <p className="text-sm text-red-600">{fieldErrors.photoUrl}</p> : null}
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
            {pending ? "Saving…" : mode === "create" ? "Create equipment" : "Save changes"}
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
