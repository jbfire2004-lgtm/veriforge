"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/api-fetch";

export default function SafetyStationMonitorPage() {
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/safety-station/monitor`, { credentials: "include" });
        const data = await res.json();
        setStations(data);
      } catch (err) {
        console.error("Failed to load station monitor", err);
      } finally {
        setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading station monitor…</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10 max-w-6xl mx-auto">

      <h1 className="text-3xl font-bold">Safety Station Monitor</h1>

      {/* Legend */}
      <div className="flex gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span> Online
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-500 rounded-full"></span> Offline
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-yellow-500 rounded-full"></span> Stale Cache
        </span>
      </div>

      {/* Station Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stations.map((s) => {
          const isOnline = s.isOnline ?? s.online;
          const isStale = s.cacheAge > s.cacheLimit;

          const statusColor = isOnline
            ? isStale
              ? "bg-yellow-500"
              : "bg-green-500"
            : "bg-red-500";

          return (
            <div
              key={s.id}
              className="p-5 bg-white rounded shadow border space-y-4"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{s.name}</h2>
                <span className={`w-4 h-4 rounded-full ${statusColor}`}></span>
              </div>

              {/* Mode */}
              <p className="text-gray-700">
                Mode:{" "}
                <span className="font-semibold">
                  {s.mode === "hardware" ? "Hardware (Offline)" : "Standard"}
                </span>
              </p>

              {/* Heartbeat */}
              <p className="text-gray-700">
                Last Heartbeat:{" "}
                <span className="font-semibold">
                  {s.lastHeartbeat
                    ? new Date(s.lastHeartbeat).toLocaleString()
                    : "Never"}
                </span>
              </p>

              {/* Sync Health */}
              <p className="text-gray-700">
                Last Sync:{" "}
                <span className="font-semibold">
                  {s.lastSync
                    ? new Date(s.lastSync).toLocaleString()
                    : "Never"}
                </span>
              </p>

              {/* Cache Health */}
              <p className="text-gray-700">
                Cache Age:{" "}
                <span
                  className={`font-semibold ${
                    isStale ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {s.cacheAge} records
                </span>{" "}
                / Limit: {s.cacheLimit}
              </p>

              {/* Current Activity */}
              <p className="text-gray-700">
                Current Activity:{" "}
                <span className="font-semibold">
                  {s.currentActivity ?? "Idle"}
                </span>
              </p>

              {/* Actions */}
              <div className="pt-4 border-t flex gap-3">
                <Link
                  href={`/admin/safety-station/config?station=${s.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Configure
                </Link>

                <button
                  onClick={async () => {
                    await fetch(`${API_URL}/safety-station/${s.id}/action/reboot`, {
                      method: "POST",
                      credentials: "include",
                    });
                    alert("Reboot command sent");
                  }}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                  Reboot
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
