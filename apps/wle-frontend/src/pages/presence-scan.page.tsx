import { PresenceScanForm } from "../components/presence-scan-form";

export function PresenceScanPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">QR Presence Scan</h1>
      <p className="text-sm text-slate-600">
        Simulate worker QR scans at muster points or safety stations.
      </p>
      <PresenceScanForm />
    </div>
  );
}
