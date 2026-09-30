import { useState } from "react";
import { useRegisterHeartbeat, useWorkersLive } from "../hooks/use-workers";

function format(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Never";
}

export function PresenceTrackingPage() {
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const { data: workers, isLoading } = useWorkersLive(10_000);
  const heartbeat = useRegisterHeartbeat();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Presence Tracking</h1>

      <div className="rounded-xl border bg-white p-4 md:p-6">
        <p className="mb-3 text-sm text-slate-600">
          Auto-refresh interval is 10 seconds for presence data.
        </p>
        <div className="flex flex-col gap-3 md:flex-row">
          <select
            className="rounded border px-3 py-2"
            value={selectedWorkerId}
            onChange={(e) => setSelectedWorkerId(e.target.value)}
          >
            <option value="">Select worker</option>
            {(workers ?? []).map((w) => (
              <option key={w.id} value={w.id}>
                {w.firstName} {w.lastName}
              </option>
            ))}
          </select>
          <button
            onClick={() => selectedWorkerId && heartbeat.mutate(selectedWorkerId)}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            disabled={!selectedWorkerId || heartbeat.isPending}
          >
            {heartbeat.isPending ? "Sending..." : "Heartbeat"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 md:p-6">
        <h2 className="mb-3 text-lg font-semibold">Last Seen Indicators</h2>
        {isLoading && <p>Loading workers...</p>}
        <div className="space-y-2">
          {(workers ?? []).map((w) => (
            <div key={w.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm">
              <span>
                {w.firstName} {w.lastName}
              </span>
              <span className="font-medium">{format(w.lastHeartbeat)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
