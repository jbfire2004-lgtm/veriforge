"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CORE_SITE_RISK_CATEGORIES,
  CORE_SITE_RISK_SEVERITIES,
  CORE_SITE_RISK_STATUSES,
} from "@/src/components/core-site-risk/core-site-risk.schema";
import {
  ErrorState,
  LoadingState,
  SuccessState,
} from "@/src/components/core/AsyncViewState";
import { useCoreSiteRiskById } from "@/src/hooks/useCoreSiteRiskById";
import { useCoreSiteRiskMutations } from "@/src/hooks/useCoreSiteRiskMutations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VeraPageLayout } from "@/src/components/navigation";

export default function EditCoreSiteRiskPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const validId = Number.isSafeInteger(id) && id > 0 ? id : undefined;
  const { item, loading, error } = useCoreSiteRiskById(validId);
  const { update, busy, error: saveError, success, clearMessages } =
    useCoreSiteRiskMutations();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [category, setCategory] = useState("OTHER");
  const [severity, setSeverity] = useState("MEDIUM");

  useEffect(() => {
    if (!item) return;
    setTitle(item.title);
    setDescription(item.description ?? "");
    setStatus(item.status);
    setCategory(item.category);
    setSeverity(item.severity);
  }, [item]);

  if (loading) {
    return (
      <VeraPageLayout title="Edit site risk">
        <LoadingState
          title="Loading site risk"
          message="Fetching record details..."
        />
      </VeraPageLayout>
    );
  }
  if (error || !item) {
    return (
      <VeraPageLayout title="Edit site risk">
        <ErrorState title="Unable to load site risk" message={error ?? "Not found"} />
      </VeraPageLayout>
    );
  }

  return (
    <VeraPageLayout title="Edit site risk">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          clearMessages();
          void update(item.id, {
            title: title.trim(),
            description: description.trim() || undefined,
            status: status as (typeof CORE_SITE_RISK_STATUSES)[number],
            category: category as (typeof CORE_SITE_RISK_CATEGORIES)[number],
            severity: severity as (typeof CORE_SITE_RISK_SEVERITIES)[number],
          });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="e-csr-title">Title</Label>
          <Input id="e-csr-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={busy} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="e-csr-desc">Description</Label>
          <Textarea id="e-csr-desc" value={description} onChange={(e) => setDescription(e.target.value)} disabled={busy} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="e-csr-status">Status</Label>
            <select id="e-csr-status" className="flex h-10 w-full rounded-md border px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)} disabled={busy}>
              {CORE_SITE_RISK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-csr-category">Category</Label>
            <select id="e-csr-category" className="flex h-10 w-full rounded-md border px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value)} disabled={busy}>
              {CORE_SITE_RISK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-csr-severity">Severity</Label>
            <select id="e-csr-severity" className="flex h-10 w-full rounded-md border px-3 text-sm" value={severity} onChange={(e) => setSeverity(e.target.value)} disabled={busy}>
              {CORE_SITE_RISK_SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        {saveError && <ErrorState title="Save failed" message={saveError} />}
        {success && <SuccessState title="Saved" message={success} />}
        <button type="submit" disabled={busy} className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60">
          {busy ? "Saving..." : "Save changes"}
        </button>
      </form>
    </VeraPageLayout>
  );
}
