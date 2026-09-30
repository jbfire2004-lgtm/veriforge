"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { requestPvsExemption } from "@/lib/pvs-api";

export function PvsExemptionModal({
  contractorId,
  pvsId,
  title,
  open,
  onClose,
  onDone,
}: {
  contractorId: string;
  pvsId: string;
  title: string;
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await requestPvsExemption(contractorId, pvsId, reason.trim());
      onDone();
      onClose();
      setReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
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
        <h2 className="text-lg font-semibold">Request program exemption</h2>
        <p className="text-sm text-zinc-600">{title}</p>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <label className="block space-y-1 text-sm">
          <span>Reason</span>
          <textarea
            className="min-h-[100px] w-full border border-zinc-300 px-3 py-2"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="Why this written program does not apply"
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Submitting…" : "Submit for approval"}
          </Button>
        </div>
      </form>
    </div>
  );
}
