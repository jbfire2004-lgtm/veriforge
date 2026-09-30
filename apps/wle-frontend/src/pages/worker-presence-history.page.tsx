import { useState } from "react";
import { PresenceHistoryList } from "../components/presence-history-list";
import { useWorkerPresence } from "../hooks/use-presence";

export function WorkerPresenceHistoryPage() {
  const [workerIdInput, setWorkerIdInput] = useState("");
  const [workerId, setWorkerId] = useState("");
  const { data, isLoading, isError } = useWorkerPresence(workerId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Worker Presence History</h1>
      <div className="rounded-xl border bg-white p-4 md:p-6">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Worker ID</span>
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={workerIdInput}
              onChange={(e) => setWorkerIdInput(e.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="Enter worker cuid"
            />
            <button
              onClick={() => setWorkerId(workerIdInput.trim())}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white"
            >
              Load History
            </button>
          </div>
        </label>
      </div>

      {isLoading && workerId && <p className="rounded border bg-white p-4">Loading presence logs...</p>}
      {isError && <p className="rounded border bg-white p-4 text-red-600">Failed to load presence logs.</p>}
      {data && (
        <div className="rounded-xl border bg-slate-50 p-4">
          <PresenceHistoryList logs={data} />
        </div>
      )}
    </div>
  );
}
