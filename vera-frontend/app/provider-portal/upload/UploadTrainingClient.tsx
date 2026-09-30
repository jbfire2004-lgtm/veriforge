"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { buttonStyles } from "@/components/ui/button";

export function UploadTrainingClient({
  providerId,
  courses,
}: {
  providerId: number;
  courses: { id: number; code: string; name: string }[];
}) {
  const [workerId, setWorkerId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const result = await apiPost<{ verificationPath: string }>(
        `/api/v1/training-providers/providers/${providerId}/training/upload`,
        {
          workerId: Number(workerId),
          courseId: Number(courseId),
          companyId: companyId ? Number(companyId) : undefined,
          equipmentId: equipmentId ? Number(equipmentId) : undefined,
        }
      );
      setMessage(`Training recorded. Verify: ${result.verificationPath}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-3 rounded-lg border p-4">
      <input
        className="w-full rounded border px-3 py-2 text-sm"
        placeholder="Worker ID"
        value={workerId}
        onChange={(e) => setWorkerId(e.target.value)}
        required
      />
      <select
        className="w-full rounded border px-3 py-2 text-sm"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        required
      >
        <option value="">Select course</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.code} — {c.name}
          </option>
        ))}
      </select>
      <input
        className="w-full rounded border px-3 py-2 text-sm"
        placeholder="Company ID (optional)"
        value={companyId}
        onChange={(e) => setCompanyId(e.target.value)}
      />
      <input
        className="w-full rounded border px-3 py-2 text-sm"
        placeholder="Equipment ID (optional — equipment wallet)"
        value={equipmentId}
        onChange={(e) => setEquipmentId(e.target.value)}
      />
      <button type="submit" className={buttonStyles({ variant: "teal" })} disabled={pending}>
        {pending ? "Uploading…" : "Record training"}
      </button>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </form>
  );
}
