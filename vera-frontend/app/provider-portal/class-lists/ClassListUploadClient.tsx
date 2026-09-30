"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { buttonStyles } from "@/components/ui/button";

export function ClassListUploadClient({
  providerId,
  courses,
}: {
  providerId: number;
  courses: { id: number; code: string; name: string }[];
}) {
  const [courseId, setCourseId] = useState("");
  const [workerIdsText, setWorkerIdsText] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const workerIds = workerIdsText
      .split(/[\s,]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n));
    setPending(true);
    try {
      const res = await apiPost<{ uploaded: number; total: number }>(
        `/api/v1/training-providers/providers/${providerId}/class-lists/upload`,
        { courseId: Number(courseId), workerIds }
      );
      setResult(`Uploaded ${res.uploaded} of ${res.total} workers.`);
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-3 rounded-lg border p-4">
      <select
        className="w-full rounded border px-3 py-2 text-sm"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        required
      >
        <option value="">Course</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.code} — {c.name}
          </option>
        ))}
      </select>
      <textarea
        className="w-full rounded border px-3 py-2 text-sm font-mono"
        rows={6}
        placeholder="Worker IDs (comma or newline separated)"
        value={workerIdsText}
        onChange={(e) => setWorkerIdsText(e.target.value)}
        required
      />
      <button type="submit" className={buttonStyles({ variant: "teal" })} disabled={pending}>
        {pending ? "Uploading…" : "Upload class list"}
      </button>
      {result && <p className="text-sm text-muted-foreground">{result}</p>}
    </form>
  );
}
