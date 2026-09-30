"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { exemptDocument } from "@/lib/document-center-api";

export function ExemptionModal({
  contractorId,
  documentId,
  documentTitle,
  open,
  onClose,
  onDone,
}: {
  contractorId: string;
  documentId: string;
  documentTitle: string;
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState("");
  const [exemptionExpiresAt, setExemptionExpiresAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await exemptDocument(contractorId, documentId, {
        reason: reason.trim(),
        exemptionExpiresAt: exemptionExpiresAt || null,
      });
      onDone();
      onClose();
      setReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Exempt failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md space-y-4 border border-zinc-200 bg-white p-6 shadow-lg"
      >
        <h2 className="text-lg font-semibold">Exempt document</h2>
        <p className="text-sm text-zinc-600">{documentTitle}</p>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <label className="block space-y-1 text-sm">
          <span>Reason</span>
          <textarea
            className="min-h-[100px] w-full border border-zinc-300 px-3 py-2"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="Why this document is exempt from normal requirements"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Exemption expires (optional)</span>
          <Input
            type="date"
            value={exemptionExpiresAt}
            onChange={(e) => setExemptionExpiresAt(e.target.value)}
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Apply exemption"}
          </Button>
        </div>
      </form>
    </div>
  );
}
