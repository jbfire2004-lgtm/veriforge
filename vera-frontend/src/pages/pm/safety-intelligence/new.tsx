"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCailEntry } from "@/lib/safety-intelligence";
import type { CailSourceType } from "@/lib/safety-intelligence-types";
import {
  SfButton,
  SfCard,
  SfFloatingInput,
  SfFloatingTextarea,
} from "@/src/components/safety-forms/ui";

const SOURCES: CailSourceType[] = [
  "general",
  "inspection",
  "bbo",
  "incident",
  "equipment",
];

export default function CailNewPage() {
  const router = useRouter();
  const [projectId, setProjectId] = useState("1");
  const [ownerCompanyId, setOwnerCompanyId] = useState("1");
  const [sourceType, setSourceType] = useState<CailSourceType>("general");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const pid = Number(projectId);
    const cid = Number(ownerCompanyId);
    if (!title.trim() || !Number.isFinite(pid) || !Number.isFinite(cid)) {
      setError("Project ID, company ID, and title are required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const entry = await createCailEntry({
        projectId: pid,
        ownerCompanyId: cid,
        sourceType,
        title: title.trim(),
        description: description.trim() || undefined,
      });
      router.push(`/pm/safety-intelligence/${entry.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-[var(--sf-text)]">New CAIL entry</h1>
      <SfCard className="p-6">
        <form className="space-y-4" onSubmit={(e) => void submit(e)}>
          <SfFloatingInput
            label="Project ID"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
          />
          <SfFloatingInput
            label="Owner company ID"
            value={ownerCompanyId}
            onChange={(e) => setOwnerCompanyId(e.target.value)}
            required
          />
          <label className="block text-sm text-[var(--sf-text-muted)]">
            Source
            <select
              className="mt-1 w-full rounded-lg border border-[var(--sf-border)] bg-white px-3 py-2"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as CailSourceType)}
            >
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <SfFloatingInput
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <SfFloatingTextarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <SfButton type="submit" disabled={busy}>
            Create entry
          </SfButton>
        </form>
      </SfCard>
    </div>
  );
}
