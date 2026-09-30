"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetchJson } from "@/lib/api-fetch";

export default function GateLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterWorker, setFilterWorker] = useState("");
  const [filterEquipment, setFilterEquipment] = useState("");
  const [filterResult, setFilterResult] = useState("");
  const [filterStation, setFilterStation] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 25;

  // ---------------------------------------------
  // LOAD LOGS
  // ---------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams();

        if (filterWorker) params.append("worker", filterWorker);
        if (filterEquipment) params.append("equipment", filterEquipment);
        if (filterResult) params.append("result", filterResult);
        if (filterStation) params.append("station", filterStation);
        params.append("page", String(page));
        params.append("limit", String(pageSize));

        const data = await apiFetchJson<any[]>(
          `/gate/logs?${params.toString()}`
        );
        setLogs(data);
      } catch (err) {
        console.error("Failed to load gate logs", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [filterWorker, filterEquipment, filterResult, filterStation, page]);

  // ---------------------------------------------
  // UI
  // ---------------------------------------------
  if (loading) {
    return (
      <div className="p-6 bg-black text-white min-h-screen">
        <p className="text-gray-400">Loading gate logs…</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-black text-white min-h-screen space-y-10 pb-24">

      {/* Header */}
      <h1 className="text-3xl font-bold text-center">Gate Access Logs</h1>

      {/* Filters */}
      <section className="bg-gray-900 p-4 rounded border border-gray-700 space-y-4">
        <h2 className="text-xl font-semibold">Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <input
            type="text"
            placeholder="Worker ID"
            value={filterWorker}
            onChange={(e) => setFilterWorker(e.target.value)}
            className="px-3 py-2 rounded bg-gray-800 border border-gray-700"
          />

          <input
            type="text"
            placeholder="Equipment ID"
            value={filterEquipment}
            onChange={(e) => setFilterEquipment(e.target.value)}
            className="px-3 py-2 rounded bg-gray-800 border border-gray-700"
          />

          <select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
            className="px-3 py-2 rounded bg-gray-800 border border-gray-700"
          >
            <option value="">Result</option>
            <option value="SAFE">PASS</option>
            <option value="UNSAFE">FAIL</option>
          </select>

          <input
            type="text"
            placeholder="Station ID"
            value={filterStation}
            onChange={(e) => setFilterStation(e.target.value)}
            className="px-3 py-2 rounded bg-gray-800 border border-gray-700"
          />
        </div>
      </section>

      {/* Logs */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Recent Entries</h2>

        {logs.length === 0 && (
          <p className="text-gray-500">No logs found.</p>
        )}

        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 bg-gray-900 rounded border border-gray-700"
            >
              {/* PASS / FAIL */}
              <p
                className={`text-xl font-bold ${
                  log.result === "SAFE" ? "text-green-400" : "text-red-400"
                }`}
              >
                {log.result === "SAFE" ? "PASS" : "FAIL"}
              </p>

              {/* Worker */}
              <p className="text-gray-300">
                Worker:{" "}
                <Link
                  href={`/supervisor/worker-lookup/${log.workerId}`}
                  className="text-blue-400 underline"
                >
                  {log.worker?.firstName} {log.worker?.lastName}
                </Link>
              </p>

              {/* Equipment */}
              <p className="text-gray-300">
                Equipment:{" "}
                <Link
                  href={`/supervisor/equipment-lookup/${log.equipmentId}`}
                  className="text-blue-400 underline"
                >
                  {log.equipment?.name}
                </Link>
              </p>

              {/* Station */}
              <p className="text-gray-400 text-sm">
                Station: {log.stationId ?? "Unknown"}
              </p>

              {/* Reasons */}
              {log.reasons?.length > 0 && (
                <p className="text-sm text-gray-400">
                  Reasons: {log.reasons.join(", ")}
                </p>
              )}

              {/* Timestamp */}
              <p className="text-xs text-gray-500 mt-2">
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pagination */}
      <section className="flex justify-between mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-4 py-2 bg-gray-700 rounded disabled:opacity-40"
        >
          Previous
        </button>

        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-700 rounded"
        >
          Next
        </button>
      </section>
    </div>
  );
}
