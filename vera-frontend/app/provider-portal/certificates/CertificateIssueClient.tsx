"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { buttonStyles } from "@/components/ui/button";

export function CertificateIssueClient({ providerId }: { providerId: number }) {
  const [recordId, setRecordId] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onIssue(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    setQrDataUrl(null);
    try {
      const res = await apiPost<{
        digitalCertificate: { verificationUrl: string } | null;
        qrDataUrl: string | null;
      }>(`/api/v1/training-providers/providers/${providerId}/certificates/issue`, {
        trainingRecordId: Number(recordId),
      });
      setQrDataUrl(res.qrDataUrl);
      setVerifyUrl(res.digitalCertificate?.verificationUrl ?? null);
      setMessage("Certificate issued.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Issue failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onIssue} className="max-w-lg space-y-3 rounded-lg border p-4">
        <input
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="Training record ID"
          value={recordId}
          onChange={(e) => setRecordId(e.target.value)}
          required
        />
        <button type="submit" className={buttonStyles({ variant: "teal" })} disabled={pending}>
          {pending ? "Issuing…" : "Issue digital certificate + QR"}
        </button>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
        {verifyUrl && (
          <p className="text-xs break-all text-muted-foreground">
            Verification: {verifyUrl}
          </p>
        )}
      </form>
      {qrDataUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qrDataUrl} alt="Certificate QR" className="h-64 w-64 border" />
      )}
    </div>
  );
}
