"use client";

import { useCallback, useState } from "react";
import { ScanLine, Loader2 } from "lucide-react";
import { QrScanner } from "@/components/verify/QrScanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CoreAlert } from "@/src/components/core/CoreAlert";
import {
  ingestTrainingQr,
  type QrIngestResult,
} from "@/lib/training-ingestion-v1";
import { unknownToErrorMessage } from "@/lib/core";

export type TrainingQrIngestPanelProps = {
  companyId: number;
  defaultWorkerId?: number;
  disabled?: boolean;
};

export function TrainingQrIngestPanel({
  companyId,
  defaultWorkerId,
  disabled = false,
}: TrainingQrIngestPanelProps) {
  const [workerId, setWorkerId] = useState(
    defaultWorkerId != null ? String(defaultWorkerId) : "",
  );
  const [scanOpen, setScanOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QrIngestResult | null>(null);

  const submitQr = useCallback(
    async (qr: string) => {
      const wid = parseInt(workerId, 10);
      if (!Number.isFinite(wid) || wid < 1) {
        setError("Enter a valid worker ID.");
        return;
      }
      setBusy(true);
      setError(null);
      setResult(null);
      try {
        const res = await ingestTrainingQr(companyId, wid, qr);
        setResult(res);
        setScanOpen(false);
      } catch (e: unknown) {
        setError(unknownToErrorMessage(e));
      } finally {
        setBusy(false);
      }
    },
    [companyId, workerId],
  );

  return (
    <div className="space-y-4 rounded-2xl border border-[#2A2E33]/10 bg-slate-50/50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#2A2E33]">
        <ScanLine className="h-4 w-4" aria-hidden />
        Scan training certificate QR
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="qr-worker-id">Worker ID</Label>
          <Input
            id="qr-worker-id"
            inputMode="numeric"
            value={workerId}
            onChange={(e) => setWorkerId(e.target.value)}
            disabled={disabled || busy}
            placeholder="e.g. 42"
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            className="w-full min-h-[44px]"
            disabled={disabled || busy}
            onClick={() => setScanOpen(true)}
          >
            {busy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <ScanLine className="mr-2 h-4 w-4" aria-hidden />
            )}
            Open camera
          </Button>
        </div>
      </div>

      {error ? <CoreAlert variant="error">{error}</CoreAlert> : null}

      {result ? (
        <CoreAlert
          variant={
            result.status === "linked"
              ? "success"
              : result.status === "needs_review"
                ? "warning"
                : "info"
          }
        >
          <p className="font-medium">{result.message}</p>
          {result.certificate?.certification ? (
            <p className="mt-1 text-sm opacity-90">
              {result.certificate.certification}
              {result.certificate.workerName
                ? ` · ${result.certificate.workerName}`
                : ""}
            </p>
          ) : null}
        </CoreAlert>
      ) : null}

      <QrScanner
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onDecode={(text) => void submitQr(text)}
      />
    </div>
  );
}
