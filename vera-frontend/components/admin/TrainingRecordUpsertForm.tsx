"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Save, X } from "lucide-react";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { unknownToErrorMessage } from "@/lib/core";
import { Button, CardContent, Input, Label, Select, Skeleton } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { useAdminMutation } from "@/components/admin/useAdminMutation";

type WorkerRow = { id: number; firstName: string; lastName: string; company?: { name: string } | null };
type CertRow = { id: number; name: string };
type ProviderRow = { id: number; name: string };

export type TrainingRecordUpsertInitial = {
  id: number;
  workerId: number;
  certificationId: number;
  issuedAt: string | null;
  expiresAt: string | null;
  certificateNumber?: string | null;
  providerId?: number | null;
};

type Props = {
  mode: "create" | "edit";
  initial?: TrainingRecordUpsertInitial;
  cancelHref: string;
};

function toDateInput(iso: string | null | undefined) {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function validate(
  workerIdStr: string,
  certificationIdStr: string,
  issuedAt: string,
  expiresAt: string
) {
  const errors: Record<string, string> = {};
  const wid = Number(workerIdStr);
  const cid = Number(certificationIdStr);
  if (!Number.isFinite(wid) || wid < 1) errors.workerId = "Select a worker.";
  if (!Number.isFinite(cid) || cid < 1) errors.certificationId = "Select a certification.";
  if (!issuedAt) errors.issuedAt = "Issued date is required.";
  if (!expiresAt) errors.expiresAt = "Expiry date is required.";
  if (issuedAt && expiresAt && expiresAt < issuedAt) {
    errors.expiresAt = "Expiry must be on or after the issued date.";
  }
  return errors;
}

function toIsoDateStart(dateYmd: string) {
  return new Date(`${dateYmd}T00:00:00.000Z`).toISOString();
}

export function TrainingRecordUpsertForm({ mode, initial, cancelHref }: Props) {
  const { pending, error, setError, run } = useAdminMutation();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [listsError, setListsError] = useState<string | null>(null);
  const [listsLoading, setListsLoading] = useState(true);
  const [workers, setWorkers] = useState<WorkerRow[]>([]);
  const [certs, setCerts] = useState<CertRow[]>([]);
  const [providers, setProviders] = useState<ProviderRow[]>([]);

  const defaults = useMemo(
    () => ({
      workerId: initial?.workerId != null ? String(initial.workerId) : "",
      certificationId: initial?.certificationId != null ? String(initial.certificationId) : "",
      issuedAt: toDateInput(initial?.issuedAt ?? null),
      expiresAt: toDateInput(initial?.expiresAt ?? null),
      certificateNumber: initial?.certificateNumber ?? "",
      providerId: initial?.providerId != null ? String(initial.providerId) : "",
    }),
    [initial]
  );

  const [workerId, setWorkerId] = useState(defaults.workerId);
  const [certificationId, setCertificationId] = useState(defaults.certificationId);
  const [issuedAt, setIssuedAt] = useState(defaults.issuedAt);
  const [expiresAt, setExpiresAt] = useState(defaults.expiresAt);
  const [certificateNumber, setCertificateNumber] = useState(defaults.certificateNumber);
  const [providerId, setProviderId] = useState(defaults.providerId);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setListsLoading(true);
      setListsError(null);
      try {
        const [w, c, p] = await Promise.all([
          apiGet<WorkerRow[]>("/workers"),
          apiGet<CertRow[]>("/certifications"),
          apiGet<ProviderRow[]>("/providers"),
        ]);
        if (!cancelled) {
          setWorkers(Array.isArray(w) ? w : []);
          setCerts(Array.isArray(c) ? c : []);
          setProviders(Array.isArray(p) ? p : []);
        }
      } catch (e) {
        if (!cancelled) {
          setListsError(unknownToErrorMessage(e, "Could not load workers, certifications, or providers."));
        }
      } finally {
        if (!cancelled) setListsLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  function resetEmpty() {
    setWorkerId("");
    setCertificationId("");
    setIssuedAt("");
    setExpiresAt("");
    setCertificateNumber("");
    setProviderId("");
    setFieldErrors({});
    setError(null);
  }

  async function submit() {
    const ve = validate(workerId, certificationId, issuedAt, expiresAt);
    setFieldErrors(ve);
    if (Object.keys(ve).length) {
      setError("Fix the highlighted fields.");
      return;
    }
    setError(null);
    const wid = Number(workerId);
    const cid = Number(certificationId);
    const issuedIso = toIsoDateStart(issuedAt);
    const expiresIso = toIsoDateStart(expiresAt);
    const certNum = certificateNumber.trim();
    const pid = providerId.trim();
    const providerIdNum = pid ? Number(pid) : undefined;

    if (mode === "create") {
      await run(
        async () => {
          await apiPost("/training-records", {
            workerId: wid,
            certificationId: cid,
            issuedAt: issuedIso,
            expiresAt: expiresIso,
            ...(certNum ? { certificateNumber: certNum } : {}),
            ...(providerIdNum != null && Number.isFinite(providerIdNum) && providerIdNum > 0
              ? { providerId: providerIdNum }
              : {}),
          });
        },
        {
          successTitle: "Training record created",
          redirectTo: "/admin/training",
          onSuccess: () => resetEmpty(),
        }
      );
      return;
    }

    if (!initial?.id) throw new Error("Missing record id");
    await run(
      async () => {
        const body: Record<string, unknown> = {
          workerId: wid,
          certificationId: cid,
          issuedAt: issuedIso,
          expiresAt: expiresIso,
          certificateNumber: certNum || null,
        };
        if (pid === "") {
          body.providerId = null;
        } else if (providerIdNum != null && Number.isFinite(providerIdNum) && providerIdNum > 0) {
          body.providerId = providerIdNum;
        }
        await apiPatch(`/training-records/${initial.id}`, body);
      },
      {
        successTitle: "Training record updated",
        redirectTo: `/admin/training/${initial.id}`,
      }
    );
  }

  return (
    <CardContent className="space-y-vera-6 p-vera-8">
      {listsError ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-vera-4 py-vera-3 text-sm font-medium text-red-700"
        >
          {listsError}
        </p>
      ) : null}
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
          <Label htmlFor="workerId">Worker</Label>
          {listsLoading ? (
            <Skeleton className="h-10 w-full rounded-lg" />
          ) : (
            <Select id="workerId" value={workerId} onChange={(e) => setWorkerId(e.target.value)} required>
              <option value="">Select worker</option>
              {workers.map((w) => (
                <option key={w.id} value={String(w.id)}>
                  {w.firstName} {w.lastName}
                  {w.company?.name ? ` — ${w.company.name}` : ""}
                </option>
              ))}
            </Select>
          )}
          {fieldErrors.workerId ? <p className="text-sm text-red-600">{fieldErrors.workerId}</p> : null}
        </div>
        <div className="space-y-vera-2">
          <Label htmlFor="certificationId">Certification</Label>
          {listsLoading ? (
            <Skeleton className="h-10 w-full rounded-lg" />
          ) : (
            <Select
              id="certificationId"
              value={certificationId}
              onChange={(e) => setCertificationId(e.target.value)}
              required
            >
              <option value="">Select certification</option>
              {certs.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}
          {fieldErrors.certificationId ? (
            <p className="text-sm text-red-600">{fieldErrors.certificationId}</p>
          ) : null}
        </div>
        <div className="space-y-vera-2">
          <Label htmlFor="providerId">Issuing training provider</Label>
          <p className="text-xs text-vera-muted">
            School or program that delivered this training (certificate source). The worker&apos;s employer is set on
            the worker profile under <strong>Employer (company)</strong>.
          </p>
          {listsLoading ? (
            <Skeleton className="h-10 w-full rounded-lg" />
          ) : (
            <Select id="providerId" value={providerId} onChange={(e) => setProviderId(e.target.value)}>
              <option value="">None</option>
              {providers.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.name}
                </option>
              ))}
            </Select>
          )}
        </div>
        <div className="space-y-vera-2">
          <Label htmlFor="issuedAt">Issued at</Label>
          <Input id="issuedAt" type="date" value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} required />
          {fieldErrors.issuedAt ? <p className="text-sm text-red-600">{fieldErrors.issuedAt}</p> : null}
        </div>
        <div className="space-y-vera-2">
          <Label htmlFor="expiresAt">Expires at</Label>
          <Input
            id="expiresAt"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            required
          />
          {fieldErrors.expiresAt ? <p className="text-sm text-red-600">{fieldErrors.expiresAt}</p> : null}
        </div>
        <div className="space-y-vera-2">
          <Label htmlFor="certificateNumber">Certificate # (optional)</Label>
          <Input
            id="certificateNumber"
            value={certificateNumber}
            onChange={(e) => setCertificateNumber(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-vera-3">
          <Button type="submit" variant="teal" disabled={pending || listsLoading}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : mode === "create" ? (
              <Plus className="h-4 w-4" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            {pending ? "Saving…" : mode === "create" ? "Save record" : "Save changes"}
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
