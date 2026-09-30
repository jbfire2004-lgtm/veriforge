"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CORE_MEETING_RECORD_TYPES } from "@/src/components/core-meeting-record/core-meeting-record.schema";
import { ErrorState, LoadingState, SuccessState } from "@/src/components/core/AsyncViewState";
import { useCoreMeetingRecordById } from "@/src/hooks/useCoreMeetingRecordById";
import { useCoreMeetingRecordMutations } from "@/src/hooks/useCoreMeetingRecordMutations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VeraPageLayout } from "@/src/components/navigation";

function toLocalDateTime(iso: string): string {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function EditCoreMeetingRecordPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const validId = Number.isSafeInteger(id) && id > 0 ? id : undefined;
  const { item, loading, error } = useCoreMeetingRecordById(validId);
  const { update, busy, error: saveError, success, clearMessages } = useCoreMeetingRecordMutations();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [meetingType, setMeetingType] = useState("TOOLBOX");
  const [heldAt, setHeldAt] = useState("");

  useEffect(() => {
    if (!item) return;
    setTitle(item.title);
    setBody(item.body ?? "");
    setMeetingType(item.meetingType);
    setHeldAt(toLocalDateTime(item.heldAt));
  }, [item]);

  if (loading) {
    return (
      <VeraPageLayout title="Edit meeting record">
        <LoadingState title="Loading meeting record" message="Fetching record details..." />
      </VeraPageLayout>
    );
  }
  if (error || !item) {
    return (
      <VeraPageLayout title="Edit meeting record">
        <ErrorState title="Unable to load meeting record" message={error ?? "Not found"} />
      </VeraPageLayout>
    );
  }

  return (
    <VeraPageLayout title="Edit meeting record">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          clearMessages();
          void update(item.id, {
            title: title.trim(),
            body: body.trim() || undefined,
            meetingType: meetingType as (typeof CORE_MEETING_RECORD_TYPES)[number],
            heldAt: new Date(heldAt).toISOString(),
          });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="e-cmr-title">Title</Label>
          <Input id="e-cmr-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={busy} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="e-cmr-body">Body</Label>
          <Textarea id="e-cmr-body" value={body} onChange={(e) => setBody(e.target.value)} disabled={busy} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="e-cmr-type">Type</Label>
            <select id="e-cmr-type" className="flex h-10 w-full rounded-md border px-3 text-sm" value={meetingType} onChange={(e) => setMeetingType(e.target.value)} disabled={busy}>
              {CORE_MEETING_RECORD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-cmr-held">Held at</Label>
            <Input id="e-cmr-held" type="datetime-local" value={heldAt} onChange={(e) => setHeldAt(e.target.value)} disabled={busy} />
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
