import { PresenceLog } from "../types";

export function PresenceHistoryList({ logs }: { logs: PresenceLog[] }) {
  if (logs.length === 0) {
    return <p className="text-sm text-slate-500">No scans found.</p>;
  }

  return (
    <ul className="space-y-2">
      {logs.map((log) => (
        <li key={log.id} className="rounded-lg border bg-white p-3 text-sm">
          <p className="font-medium">{log.presencePoint.name}</p>
          <p className="text-slate-600">{log.presencePoint.location}</p>
          <p className="text-xs text-slate-500">{new Date(log.scannedAt).toLocaleString()}</p>
        </li>
      ))}
    </ul>
  );
}
