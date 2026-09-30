"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import {
  fileToBase64,
  uploadDocument,
  type CategoryRule,
  type DocumentCategory,
} from "@/lib/document-center-api";

export function UploadDocumentModal({
  contractorId,
  rules,
  open,
  onClose,
  onDone,
}: {
  contractorId: string;
  rules: CategoryRule[];
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [category, setCategory] = useState<DocumentCategory>("insurance");
  const [title, setTitle] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const rule = rules.find((r) => r.category === category);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      let payload: Parameters<typeof uploadDocument>[1] = {
        category,
        title: title.trim(),
        expiryDate: expiryDate || null,
      };
      if (file) {
        const encoded = await fileToBase64(file);
        payload = { ...payload, ...encoded };
      } else if (fileUrl.trim()) {
        payload = { ...payload, fileUrl: fileUrl.trim() };
      } else {
        throw new Error("Choose a file or paste a file URL");
      }
      await uploadDocument(contractorId, payload);
      onDone();
      onClose();
      setTitle("");
      setFile(null);
      setFileUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-lg space-y-4 border border-zinc-200 bg-white p-6 shadow-lg"
      >
        <h2 className="text-lg font-semibold">Upload document</h2>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <label className="block space-y-1 text-sm">
          <span>Category</span>
          <select
            className="w-full border border-zinc-300 px-3 py-2"
            value={category}
            onChange={(e) => setCategory(e.target.value as DocumentCategory)}
          >
            {rules.map((r) => (
              <option key={r.category} value={r.category}>
                {r.label}
                {r.required ? " *" : ""}
              </option>
            ))}
          </select>
          {rule ? (
            <span className="text-xs text-zinc-500">{rule.description}</span>
          ) : null}
        </label>
        <label className="block space-y-1 text-sm">
          <span>Title</span>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. GL Certificate 2026"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Expiry date</span>
          <Input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>File</span>
          <input
            type="file"
            className="w-full text-sm"
            accept={rule?.allowedMimes.join(",") || undefined}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Or file URL</span>
          <Input
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://…"
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </form>
    </div>
  );
}
