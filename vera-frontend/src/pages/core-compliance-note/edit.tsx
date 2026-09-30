"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CORE_COMPLIANCE_NOTE_CATEGORIES,
  CORE_COMPLIANCE_NOTE_PRIORITIES,
  CORE_COMPLIANCE_NOTE_STATUSES,
} from "@/src/components/core-compliance-note/core-compliance-note.schema";
import {
  ErrorState,
  LoadingState,
  SuccessState,
} from "@/src/components/core/AsyncViewState";
import { useCoreComplianceNoteById } from "@/src/hooks/useCoreComplianceNoteById";
import { useCoreComplianceNoteMutations } from "@/src/hooks/useCoreComplianceNoteMutations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VeraPageLayout } from "@/src/components/navigation";

export default function EditCoreComplianceNotePage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const validId = Number.isSafeInteger(id) && id > 0 ? id : undefined;
  const { item, loading, error } = useCoreComplianceNoteById(validId);
  const { update, busy, error: saveError, success, clearMessages } =
    useCoreComplianceNoteMutations();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [category, setCategory] = useState("INTERNAL");
  const [priority, setPriority] = useState("NORMAL");

  useEffect(() => {
    if (!item) return;
    setTitle(item.title);
    setBody(item.body ?? "");
    setStatus(item.status);
    setCategory(item.category);
    setPriority(item.priority);
  }, [item]);

  if (loading) {
    return (
      <VeraPageLayout title="Edit compliance note">
        <LoadingState
          title="Loading compliance note"
          message="Fetching record details..."
        />
      </VeraPageLayout>
    );
  }
  if (error || !item) {
    return (
      <VeraPageLayout title="Edit compliance note">
        <ErrorState
          title="Unable to load compliance note"
          message={error ?? "Not found"}
        />
      </VeraPageLayout>
    );
  }

  return (
    <VeraPageLayout title="Edit compliance note">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          clearMessages();
          void update(item.id, {
            title: title.trim(),
            body: body.trim() || undefined,
            status: status as (typeof CORE_COMPLIANCE_NOTE_STATUSES)[number],
            category: category as (typeof CORE_COMPLIANCE_NOTE_CATEGORIES)[number],
            priority: priority as (typeof CORE_COMPLIANCE_NOTE_PRIORITIES)[number],
          });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="e-ccn-title">Title</Label>
          <Input id="e-ccn-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={busy} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="e-ccn-body">Body</Label>
          <Textarea id="e-ccn-body" value={body} onChange={(e) => setBody(e.target.value)} disabled={busy} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="e-ccn-status">Status</Label>
            <select id="e-ccn-status" className="flex h-10 w-full rounded-md border px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)} disabled={busy}>
              {CORE_COMPLIANCE_NOTE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-ccn-category">Category</Label>
            <select id="e-ccn-category" className="flex h-10 w-full rounded-md border px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value)} disabled={busy}>
              {CORE_COMPLIANCE_NOTE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-ccn-priority">Priority</Label>
            <select id="e-ccn-priority" className="flex h-10 w-full rounded-md border px-3 text-sm" value={priority} onChange={(e) => setPriority(e.target.value)} disabled={busy}>
              {CORE_COMPLIANCE_NOTE_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
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
