"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  SAFETY_OBSERVATION_SEVERITIES,
  SAFETY_OBSERVATION_STATUSES,
} from "@/src/components/safety-observation/safety-observation.schema";
import {
  ErrorState,
  LoadingState,
  SuccessState,
} from "@/src/components/core/AsyncViewState";
import { useSafetyObservationById } from "@/src/hooks/useSafetyObservationById";
import { useSafetyObservationMutations } from "@/src/hooks/useSafetyObservationMutations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VeraPageLayout } from "@/src/components/navigation";

export default function EditSafetyObservationPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const validId = Number.isSafeInteger(id) && id > 0 ? id : undefined;
  const { item, loading, error } = useSafetyObservationById(validId);
  const { update, busy, error: saveError, success, clearMessages } =
    useSafetyObservationMutations();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [severity, setSeverity] = useState("MEDIUM");

  useEffect(() => {
    if (!item) return;
    setTitle(item.title);
    setDescription(item.description ?? "");
    setStatus(item.status);
    setSeverity(item.severity);
  }, [item]);

  if (loading) {
    return (
      <VeraPageLayout title="Edit safety observation">
        <LoadingState
          title="Loading safety observation"
          message="Fetching record details..."
        />
      </VeraPageLayout>
    );
  }
  if (error || !item) {
    return (
      <VeraPageLayout title="Edit safety observation">
        <ErrorState
          title="Unable to load safety observation"
          message={error ?? "Not found"}
        />
      </VeraPageLayout>
    );
  }

  return (
    <VeraPageLayout title="Edit safety observation">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          clearMessages();
          void update(item.id, {
            title: title.trim(),
            description: description.trim() || undefined,
            status: status as (typeof SAFETY_OBSERVATION_STATUSES)[number],
            severity: severity as (typeof SAFETY_OBSERVATION_SEVERITIES)[number],
          });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="e-so-title">Title</Label>
          <Input id="e-so-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={busy} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="e-so-desc">Description</Label>
          <Textarea id="e-so-desc" value={description} onChange={(e) => setDescription(e.target.value)} disabled={busy} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="e-so-status">Status</Label>
            <select id="e-so-status" className="flex h-10 w-full rounded-md border px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)} disabled={busy}>
              {SAFETY_OBSERVATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-so-severity">Severity</Label>
            <select id="e-so-severity" className="flex h-10 w-full rounded-md border px-3 text-sm" value={severity} onChange={(e) => setSeverity(e.target.value)} disabled={busy}>
              {SAFETY_OBSERVATION_SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
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
