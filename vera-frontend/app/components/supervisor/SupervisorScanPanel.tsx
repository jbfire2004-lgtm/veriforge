"use client";

import { useState } from "react";
import { fetchJson } from "@/lib/core/fetch-json";
import { unknownToErrorMessage } from "@/lib/core";

export type SupervisorScanPasteTarget = "worker" | "equipment";

/** Response from POST /qr/scan (verification payload shapes vary). */
export type QrVerifyResult = Record<string, unknown>;

export function SupervisorScanPanel(props: {
  onResult: (data: QrVerifyResult) => void;
}) {
  const { onResult } = props;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [assumedTarget, setAssumedTarget] =
    useState<SupervisorScanPasteTarget>("worker");

  async function scanPayload(qr: string) {
    const trimmed = qr.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");

    try {
      const data = await fetchJson<QrVerifyResult>(`/qr/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr: trimmed, assumedTarget }),
      });
      onResult(data);
    } catch (e) {
      setError(unknownToErrorMessage(e, "Verification request failed."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold">Scan QR Code</h2>

      <label className="block text-sm text-gray-600">
        If the pasted code is <strong>only digits</strong>, treat as:
        <select
          className="ml-2 border rounded px-2 py-1"
          value={assumedTarget}
          onChange={(e) =>
            setAssumedTarget(e.target.value as SupervisorScanPasteTarget)
          }
        >
          <option value="worker">Worker ID</option>
          <option value="equipment">Equipment ID</option>
        </select>
      </label>

      <input
        type="text"
        placeholder="Paste or scan QR code"
        onChange={(e) => void scanPayload(e.target.value)}
        className="w-full p-3 border rounded"
      />

      {loading && <p className="text-gray-600">Processing…</p>}
      {error && (
        <p className="text-red-600 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
