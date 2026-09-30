"use client";

import { useEffect, useState } from "react";
import { apiFetchJson } from "@/lib/api-fetch";

export default function SupervisorHistory() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    apiFetchJson<{ recent: any[] }>("/logging/stats")
      .then((data) => setLogs(data.recent));
  }, []);

  return (
    <div className="p-6 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Scan History</h1>

      <div className="space-y-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-4 bg-gray-900 rounded border border-gray-700 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">
                {log.worker
                  ? `${log.worker.firstName} ${log.worker.lastName}`
                  : "Unknown Worker"}
              </p>
              <p className="text-sm text-gray-400">
                {log.equipment ? log.equipment.name : "Unknown Equipment"}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded text-white ${
                log.result === "PASS" ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {log.result}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
