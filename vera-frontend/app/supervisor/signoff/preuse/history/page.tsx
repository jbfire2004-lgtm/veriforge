"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import Link from "next/link";

export default function SignoffHistoryPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet("/signoff/history");
        setRecords(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-black text-white min-h-screen">
        Loading signoff history…
      </div>
    );
  }

  return (
    <div className="p-6 bg-black text-white min-h-screen space-y-6">
      <h1 className="text-3xl font-bold">Signoff History</h1>

      <div className="space-y-4">
        {records.map((r) => (
          <Link
            key={r.id}
            href={`/supervisor/signoff/view/${r.id}`}
            className="block p-4 bg-gray-900 rounded border border-gray-700 hover:bg-gray-800"
          >
            <div className="flex justify-between">
              <div>
                <p className="font-bold">
                  {r.worker?.firstName} {r.worker?.lastName}
                </p>
                <p className="text-gray-400 text-sm">
                  Equipment: {r.equipment?.name}
                </p>
              </div>

              <div className="text-right">
                <p className="text-gray-300">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-500 text-sm">
                  Supervisor: {r.supervisorName}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
