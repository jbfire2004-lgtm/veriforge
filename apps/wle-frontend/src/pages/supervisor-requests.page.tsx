import { useState } from "react";
import { useRespondToRequest, useSupervisorRequests } from "../hooks/use-supervisor";

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}

export function SupervisorRequestsPage() {
  const [supervisorIdInput, setSupervisorIdInput] = useState("");
  const [supervisorId, setSupervisorId] = useState("");

  const { data, isLoading, isError } = useSupervisorRequests(supervisorId);
  const respond = useRespondToRequest(supervisorId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Supervisor Requests</h1>
      <div className="rounded-xl border bg-white p-4 md:p-6">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Supervisor ID</span>
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={supervisorIdInput}
              onChange={(e) => setSupervisorIdInput(e.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="Use companyId for now"
            />
            <button
              onClick={() => setSupervisorId(supervisorIdInput.trim())}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white"
            >
              Load Requests
            </button>
          </div>
        </label>
      </div>

      {isLoading && supervisorId && <p className="rounded border bg-white p-4">Loading requests...</p>}
      {isError && <p className="rounded border bg-white p-4 text-red-600">Failed to load requests.</p>}

      <div className="space-y-3">
        {(data ?? []).map((request) => (
          <div key={request.id} className="rounded-xl border bg-white p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">
                  {request.worker.firstName} {request.worker.lastName}
                </p>
                <p className="text-sm text-slate-600">Company: {request.worker.companyId}</p>
                <p className="text-sm text-slate-500">
                  Last heartbeat: {formatDate(request.worker.lastHeartbeat)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    respond.mutate({
                      id: request.id,
                      status: "confirmed_on_site",
                    })
                  }
                  disabled={respond.isPending}
                  className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  Still on site
                </button>
                <button
                  onClick={() =>
                    respond.mutate({
                      id: request.id,
                      status: "not_on_site",
                    })
                  }
                  disabled={respond.isPending}
                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  Not on site
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {supervisorId && !isLoading && (data?.length ?? 0) === 0 && (
        <p className="rounded border bg-white p-4 text-sm text-slate-600">
          No pending confirmation requests.
        </p>
      )}
    </div>
  );
}
