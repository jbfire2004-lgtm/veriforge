"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { IncidentList } from "@/app/components/incidents/IncidentList";

export default function IncidentListPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet("/incidents")
      .then(setIncidents)
      .catch((e) => setError(String(e?.message || e)));
  }, []);

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">All incidents</h1>
        <div className="flex gap-3 text-sm">
          <Link
            href="/supervisor/incidents"
            className="text-blue-600 hover:underline"
          >
            Hub
          </Link>
          <Link
            href="/supervisor/incidents/new"
            className="text-blue-600 hover:underline"
          >
            New report
          </Link>
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm">
          {error} — check API is running and CORS.
        </p>
      )}

      <IncidentList incidents={incidents} />
    </main>
  );
}
