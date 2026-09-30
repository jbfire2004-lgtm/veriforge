"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CORE_ACTION_PRIORITIES, CORE_ACTION_STATUSES } from "@/src/components/core-action-items/core-action-item.schema";
import {
  ErrorState,
  LoadingState,
  SuccessState,
} from "@/src/components/core/AsyncViewState";
import { useCoreActionItemById } from "@/src/hooks/useCoreActionItemById";
import { useCoreActionItemMutations } from "@/src/hooks/useCoreActionItemMutations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VeraPageLayout } from "@/src/components/navigation";

function toNum(v: string): number | undefined {
  const n = Number(v.trim());
  return Number.isSafeInteger(n) && n > 0 ? n : undefined;
}

export default function EditCoreActionItemPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { item, loading, error } = useCoreActionItemById(id);
  const { update, busy, error: saveError, success, clearMessages } = useCoreActionItemMutations();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [priority, setPriority] = useState("NORMAL");
  useEffect(() => {
    if (!item) return;
    setTitle(item.title);
    setDescription(item.description ?? "");
    setStatus(item.status);
    setPriority(item.priority);
  }, [item]);

  if (loading) {
    return (
      <VeraPageLayout title="Edit action item">
        <LoadingState
          title="Loading action item"
          message="Fetching record details..."
        />
      </VeraPageLayout>
    );
  }
  if (error || !item) {
    return (
      <VeraPageLayout title="Edit action item">
        <ErrorState
          title="Unable to load action item"
          message={error ?? "Not found"}
        />
      </VeraPageLayout>
    );
  }
  return (
    <VeraPageLayout title="Edit action item">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          clearMessages();
          void update(item.id, {
            title: title.trim(),
            description: description.trim() || undefined,
            status,
            priority,
            companyId: toNum(String(item.companyId ?? "")),
            createdById: toNum(String(item.createdById ?? "")),
          });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="e-cai-title">Title</Label>
          <Input id="e-cai-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={busy} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="e-cai-desc">Description</Label>
          <Textarea id="e-cai-desc" value={description} onChange={(e) => setDescription(e.target.value)} disabled={busy} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="e-cai-status">Status</Label>
            <select id="e-cai-status" className="flex h-10 w-full rounded-md border px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)} disabled={busy}>
              {CORE_ACTION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-cai-priority">Priority</Label>
            <select id="e-cai-priority" className="flex h-10 w-full rounded-md border px-3 text-sm" value={priority} onChange={(e) => setPriority(e.target.value)} disabled={busy}>
              {CORE_ACTION_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
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
