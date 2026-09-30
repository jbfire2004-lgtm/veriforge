import { FormEvent, useState } from "react";
import { PresenceScanResult } from "../types";
import { usePresenceScan } from "../hooks/use-presence";

export function PresenceScanForm() {
  const [workerId, setWorkerId] = useState("");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<PresenceScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scan = usePresenceScan();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    try {
      const response = await scan.mutateAsync({ workerId, code });
      setResult(response);
    } catch {
      setError("Failed to submit scan. Check worker ID and QR code.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-white p-4 md:p-6">
      <h2 className="text-lg font-semibold">Presence Scan Test</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Worker ID</span>
          <input
            value={workerId}
            onChange={(e) => setWorkerId(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="cuid worker id"
            required
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">QR Code</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="e.g. MSTR-POINT-001"
            required
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={scan.isPending}
        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        {scan.isPending ? "Submitting..." : "Submit Scan"}
      </button>
      {result && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <p>
            <span className="font-semibold">Point:</span> {result.pointName}
          </p>
          <p>
            <span className="font-semibold">Scanned At:</span>{" "}
            {new Date(result.scannedAt).toLocaleString()}
          </p>
        </div>
      )}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
    </form>
  );
}
