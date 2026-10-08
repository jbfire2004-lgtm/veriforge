"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { createSafetyInspection } from "@/lib/safety-intelligence";
import { SfButton, SfCard, SfFloatingInput } from "@/src/components/safety-forms/ui";

export default function NewWalkAroundPage() {
  const router = useRouter();
  const [projectId, setProjectId] = useState("1");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const pid = Number(projectId);
    if (!Number.isFinite(pid)) {
      setError("Valid project ID required");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const row = await createSafetyInspection({
        projectId: pid,
        title: title.trim() || undefined,
      });
      router.push(`/pm/safety-intelligence/inspections/${row.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Start walk-around</h1>
      <SfCard className="p-6">
        <form className="space-y-4" onSubmit={(e) => void submit(e)}>
          <SfFloatingInput
            label="Project ID"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
          />
          <SfFloatingInput
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <SfButton type="submit" disabled={busy}>
            Start
          </SfButton>
        </form>
      </SfCard>
    </div>
  );
}
