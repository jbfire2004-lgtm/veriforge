import { Link } from "react-router-dom";
import { Worker } from "../types";
import { StateBadge } from "./state-badge";

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}

export function WorkerTable({ workers }: { workers: Worker[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100 text-left text-xs uppercase tracking-wider text-slate-600">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Lifecycle</th>
            <th className="px-4 py-3">Orientation</th>
            <th className="px-4 py-3">Certifications</th>
            <th className="px-4 py-3">Last Seen</th>
          </tr>
        </thead>
        <tbody>
          {workers.map((worker) => {
            const validCount = worker.certifications.filter((c) => c.status === "valid").length;
            const expiredCount = worker.certifications.length - validCount;
            return (
              <tr key={worker.id} className="border-t">
                <td className="px-4 py-3 font-medium">
                  <Link to={`/workers/${worker.id}`} className="text-blue-600 hover:underline">
                    {worker.firstName} {worker.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3">{worker.companyId}</td>
                <td className="px-4 py-3">
                  <StateBadge state={worker.lifecycleState} />
                </td>
                <td className="px-4 py-3">{worker.orientationStatus}</td>
                <td className="px-4 py-3">
                  {validCount} valid / {expiredCount} expired
                </td>
                <td className="px-4 py-3">{formatDate(worker.lastHeartbeat)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
