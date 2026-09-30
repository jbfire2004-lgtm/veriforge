"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CORE_DAILY_LOG_SHIFTS } from "@/src/components/core-daily-log/core-daily-log.schema";
import { ErrorState, LoadingState, SuccessState } from "@/src/components/core/AsyncViewState";
import { useCoreDailyLogById } from "@/src/hooks/useCoreDailyLogById";
import { useCoreDailyLogMutations } from "@/src/hooks/useCoreDailyLogMutations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VeraPageLayout } from "@/src/components/navigation";

function toLocalDateTime(iso: string): string {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function EditCoreDailyLogPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const validId = Number.isSafeInteger(id) && id > 0 ? id : undefined;
  const { item, loading, error } = useCoreDailyLogById(validId);
  const { update, busy, error: saveError, success, clearMessages } = useCoreDailyLogMutations();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [logDate, setLogDate] = useState("");
  const [shift, setShift] = useState("DAY");

  useEffect(() => {
    if (!item) return;
    setTitle(item.title);
    setBody(item.body ?? "");
    setLogDate(toLocalDateTime(item.logDate));
    setShift(item.shift);
  }, [item]);

  if (loading) {
    return (
      <VeraPageLayout title="Edit daily log">
        <LoadingState title="Loading daily log" message="Fetching record details..." />
      </VeraPageLayout>
    );
  }
  if (error || !item) {
    return (
      <VeraPageLayout title="Edit daily log">
        <ErrorState title="Unable to load daily log" message={error ?? "Not found"} />
      </VeraPageLayout>
    );
  }

  return (
    <VeraPageLayout title="Edit daily log">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          clearMessages();
          void update(item.id, {
            title: title.trim(),
            body: body.trim() || undefined,
            logDate: new Date(logDate).toISOString(),
            shift: shift as (typeof CORE_DAILY_LOG_SHIFTS)[number],
          });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="e-cdl-title">Title</Label>
          <Input id="e-cdl-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={busy} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="e-cdl-body">Body</Label>
          <Textarea id="e-cdl-body" value={body} onChange={(e) => setBody(e.target.value)} disabled={busy} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="e-cdl-logdate">Log date</Label>
            <Input id="e-cdl-logdate" type="datetime-local" value={logDate} onChange={(e) => setLogDate(e.target.value)} disabled={busy} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-cdl-shift">Shift</Label>
            <select id="e-cdl-shift" className="flex h-10 w-full rounded-md border px-3 text-sm" value={shift} onChange={(e) => setShift(e.target.value)} disabled={busy}>
              {CORE_DAILY_LOG_SHIFTS.map((s) => <option key={s} value={s}>{s}</option>)}
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
