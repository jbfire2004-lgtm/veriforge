import { useParams } from "react-router-dom";
import { useWorker } from "../hooks/use-workers";
import { StateBadge } from "../components/state-badge";

function dateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "N/A";
}

export function WorkerDetailPage() {
  const { id = "" } = useParams();
  const { data, isLoading, isError } = useWorker(id);

  if (isLoading) return <p className="rounded border bg-white p-4">Loading worker...</p>;
  if (isError || !data) return <p className="rounded border bg-white p-4 text-red-600">Worker not found.</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-4 md:p-6">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold">
              {data.firstName} {data.lastName}
            </h1>
            <p className="text-sm text-slate-600">Company: {data.companyId}</p>
          </div>
          <StateBadge state={data.lifecycleState} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="font-medium text-slate-600">Orientation</p>
            <p>{data.orientationStatus}</p>
            <p className="text-xs text-slate-500">{dateTime(data.orientationDate)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="font-medium text-slate-600">Last Seen</p>
            <p>{dateTime(data.lastHeartbeat)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="font-medium text-slate-600">Worker ID</p>
            <p className="break-all">{data.id}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 md:p-6">
        <h2 className="mb-3 text-lg font-semibold">Certifications</h2>
        <div className="space-y-2">
          {data.certifications.length === 0 && <p className="text-sm text-slate-500">No certifications found.</p>}
          {data.certifications.map((cert) => (
            <div key={cert.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">{cert.type}</p>
                <p className="text-slate-500">Expiry: {dateTime(cert.expiry)}</p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  cert.status === "valid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {cert.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 md:p-6">
        <h2 className="mb-3 text-lg font-semibold">Heartbeat History</h2>
        <ul className="space-y-2 text-sm">
          {(data.heartbeats ?? []).map((h) => (
            <li key={h.id} className="rounded-lg bg-slate-50 p-3">
              {new Date(h.createdAt).toLocaleString()}
            </li>
          ))}
          {(data.heartbeats ?? []).length === 0 && <li className="text-slate-500">No heartbeat history.</li>}
        </ul>
      </div>
    </div>
  );
}
