"use client";

import { useCallback, useEffect, useState } from "react";
import type { FeedbackRequest } from "@vera/api-contract";
import { fetchAdminFeedback, updateFeedbackStatus } from "@/lib/adoption/api";
import {
  Button,
  Card,
  CardContent,
  ErrorState,
  Label,
  Select,
  Skeleton,
  Textarea,
} from "@/components/ui";

const STATUSES = [
  "NEW",
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
  "DECLINED",
] as const;

export function FeedbackManagerPanel() {
  const [items, setItems] = useState<FeedbackRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number | null>(null);

  const load = useCallback(() => {
    void fetchAdminFeedback()
      .then((d) => {
        setItems(d);
        setError(null);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load feedback");
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveStatus(id: number, status: string) {
    setSaving(id);
    try {
      await updateFeedbackStatus(id, {
        status,
        internalNotes: notes[id],
      });
      load();
    } finally {
      setSaving(null);
    }
  }

  if (error) return <ErrorState title="Feedback" message={error} />;
  if (!items) return <Skeleton className="h-48 w-full rounded-2xl" />;

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="border-[#2A2E33]/10">
          <CardContent className="space-y-3 pt-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[#2A2E33]">{item.title}</p>
                <p className="mt-1 text-sm text-[#5a6b7c]">{item.description}</p>
                <p className="mt-2 text-xs text-[#64748b]">
                  {item.category} · {item.upvotes} upvotes · {item.status}
                </p>
              </div>
              <span className="rounded-full bg-[#E4F3F2] px-3 py-1 text-xs font-bold text-[#2F8F8C]">
                ▲ {item.upvotes}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`status-${item.id}`}>Status</Label>
                <Select
                  id={`status-${item.id}`}
                  value={item.status}
                  onChange={(e) => void saveStatus(item.id, e.target.value)}
                  disabled={saving === item.id}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`notes-${item.id}`}>Internal notes</Label>
                <Textarea
                  id={`notes-${item.id}`}
                  rows={2}
                  defaultValue={item.internalNotes ?? ""}
                  onChange={(e) =>
                    setNotes((n) => ({ ...n, [item.id]: e.target.value }))
                  }
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={saving === item.id}
                  onClick={() => void saveStatus(item.id, item.status)}
                >
                  Save notes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {items.length === 0 ? (
        <p className="text-center text-sm text-[#64748b]">No feedback requests yet.</p>
      ) : null}
    </div>
  );
}
