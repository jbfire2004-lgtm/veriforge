import Link from "next/link";

export function IncidentCard({ incident }: { incident: any }) {
  const label = incident.title || incident.category || "Incident";

  return (
    <Link
      href={`/supervisor/incidents/${incident.id}`}
      className="block p-4 bg-red-50 border border-red-200 rounded shadow hover:border-red-400 transition"
    >
      <h3 className="font-bold text-red-800">{label}</h3>
      {incident.category && (
        <p className="text-xs text-red-600 mt-0.5">{incident.category}</p>
      )}
      <p className="text-gray-700 text-sm mt-2 line-clamp-3">
        {incident.description || "—"}
      </p>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {incident.status && (
          <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-mono">
            {incident.status}
          </span>
        )}
        {incident.severity && (
          <span
            className={`inline-block px-2 py-0.5 rounded text-white text-xs font-semibold ${
              incident.severity === "CRITICAL"
                ? "bg-red-700"
                : incident.severity === "HIGH"
                  ? "bg-orange-600"
                  : "bg-yellow-500"
            }`}
          >
            {incident.severity}
          </span>
        )}
        <span className="text-xs text-gray-500">
          {incident.createdAt?.slice?.(0, 10) ||
            new Date(incident.createdAt).toLocaleDateString()}
        </span>
      </div>

      <p className="text-xs text-blue-600 mt-2">Open workflow →</p>
    </Link>
  );
}
