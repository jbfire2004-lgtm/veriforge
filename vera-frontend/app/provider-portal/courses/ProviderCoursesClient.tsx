"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui";

export function ProviderCoursesClient({
  providerId,
  initialCourses,
}: {
  providerId: number;
  initialCourses: unknown[];
}) {
  const [courses, setCourses] = useState(initialCourses);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [certificationId, setCertificationId] = useState("");
  const [contentText, setContentText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const created = await apiPost<unknown>(
        `/api/v1/training-providers/providers/${providerId}/courses`,
        {
          code,
          name,
          certificationId: certificationId ? Number(certificationId) : undefined,
          contentText: contentText || undefined,
        }
      );
      setCourses((prev) => [...prev, created]);
      setCode("");
      setName("");
      setCertificationId("");
      setContentText("");
      setMessage("Course created.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to create course");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="max-w-lg space-y-3 rounded-lg border p-4">
        <h2 className="font-medium">Add course</h2>
        <input
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="Course code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <input
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="Course name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="Certification ID"
          value={certificationId}
          onChange={(e) => setCertificationId(e.target.value)}
        />
        <textarea
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="Program content (standards compliance check)"
          rows={4}
          value={contentText}
          onChange={(e) => setContentText(e.target.value)}
        />
        <button type="submit" className={buttonStyles({ variant: "teal" })} disabled={pending}>
          {pending ? "Saving…" : "Create course"}
        </button>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </form>

      <Card className="mt-8">
        <CardContent className="pt-6">
          <h2 className="mb-3 font-medium">Courses</h2>
          <ul className="divide-y text-sm">
            {(courses as { id: number; code: string; name: string }[]).map((c) => (
              <li key={c.id} className="py-2">
                <span className="font-mono text-xs text-muted-foreground">{c.code}</span> — {c.name}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
