"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import {
  runQuickCheck,
  type QuickCheckResult,
} from "@/lib/quickcheck-api";
import { QuickCheckResultsPanel } from "./QuickCheckResultsPanel";

export function QuickCheckModal({
  contractorId,
  open,
  onClose,
  source = "modal",
}: {
  contractorId: string;
  open: boolean;
  onClose: () => void;
  source?: string;
}) {
  const [result, setResult] = useState<QuickCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  async function run() {
    setBusy(true);
    setError(null);
    try {
      setResult(await runQuickCheck(contractorId, source));
    } catch (err) {
      setError(err instanceof Error ? err.message : "QuickCheck failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto border border-zinc-200 bg-white p-6 shadow-lg">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">QuickCheck</h2>
            <p className="text-sm text-zinc-600">
              Instant compliance from Documents, Audits, PVS, and Insurance.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        {!result ? (
          <div className="space-y-4 py-6 text-center">
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="button" disabled={busy} onClick={() => void run()}>
              {busy ? "Running…" : "Run QuickCheck"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <QuickCheckResultsPanel result={result} />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => void run()}
              >
                {busy ? "Running…" : "Re-run"}
              </Button>
              <Button type="button" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Button that opens the QuickCheck modal. */
export function QuickCheckTrigger({
  contractorId,
  source = "modal",
  label = "QuickCheck",
  variant = "outline" as const,
  size = "sm" as const,
}: {
  contractorId: string;
  source?: string;
  label?: string;
  variant?: "outline" | "default";
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <QuickCheckModal
        contractorId={contractorId}
        open={open}
        onClose={() => setOpen(false)}
        source={source}
      />
    </>
  );
}
