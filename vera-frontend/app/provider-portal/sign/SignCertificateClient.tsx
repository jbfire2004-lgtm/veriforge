"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { buttonStyles } from "@/components/ui/button";

export function SignCertificateClient() {
  const [recordId, setRecordId] = useState("");
  const [signatureName, setSignatureName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const res = await apiPost<{ signature: { signedAt: string } }>(
        `/api/v1/training-providers/records/${recordId}/sign`,
        { signatureName }
      );
      setMessage(`Signed at ${new Date(res.signature.signedAt).toLocaleString()}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Sign failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-3 rounded-lg border p-4">
      <input
        className="w-full rounded border px-3 py-2 text-sm"
        placeholder="Training record ID"
        value={recordId}
        onChange={(e) => setRecordId(e.target.value)}
        required
      />
      <input
        className="w-full rounded border px-3 py-2 text-sm"
        placeholder="Signature name (as printed on certificate)"
        value={signatureName}
        onChange={(e) => setSignatureName(e.target.value)}
        required
      />
      <button type="submit" className={buttonStyles({ variant: "teal" })} disabled={pending}>
        {pending ? "Signing…" : "Sign digital certificate"}
      </button>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </form>
  );
}
