"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import Link from "next/link";

export default function WorkerDetailPage({ params }: any) {
  const workerId = params.id;

  const [worker, setWorker] = useState<any>(null);
  const [training, setTraining] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------
  // LOAD WORKER + TRAINING + INCIDENTS + LOGS
  // ---------------------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const [w, t, i, l] = await Promise.all([
          apiGet(`/workers/${workerId}`),
          apiGet(`/training-records/worker/${workerId}`),
          apiGet(`/incidents?workerId=${workerId}`),
          apiGet(`/verification/logs/worker/${workerId}`),
        ]);

        setWorker(w);
        setTraining(t);
        setIncidents(i);
        setLogs(l.slice(0, 10));
      } catch (err) {
        console.error("Failed to load worker detail", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [workerId]);

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------
  if (loading) {
    return (
      <div className="p-6 bg-black text-white min-h-screen">
        <p className="text-gray-400">Loading worker profile…</p>
      </div>
    );
  }

  // ---------------------------------------------------------
  // INVALID
  // ---------------------------------------------------------
  if (!worker) {
    return (
      <div className="p-6 bg-black text-white min-h-screen">
        <p className="text-red-500">Worker not found.</p>
      </div>
    );
  }

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="p-6 bg-black text-white min-h-screen space-y-10 pb-24">

      {/* Header */}
      <h1 className="text-3xl font-bold text-center">Worker Profile</h1>

      {/* Worker Summary */}
      <section className="p-4 bg-gray-900 rounded border border-gray-700 space-y-2">
        <h2 className="text-xl font-semibold mb-2">Worker Information</h2>

        <p className="text-lg font-bold">
          {worker.firstName} {worker.lastName}
        </p>

        <p className="text-gray-400">ID: {worker.id}</p>
        <p className="text-gray-400">
          Company: {worker.company?.name || "N/A"}
        </p>

        <p
          className={`font-semibold ${
            worker.isSuspended ? "text-red-400" : "text-green-400"
          }`}
        >
          {worker.isSuspended ? "Suspended" : "Active"}
        </p>

        <Link
          href={`/supervisor/scan?mode=worker`}
          className="inline-block mt-3 text-blue-400 underline"
        >
          Scan Worker Again
        </Link>
      </section>

      {/* Training Records */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Training Records</h2>

        {training.length === 0 && (
          <p className="text-gray-500">No training records found.</p>
        )}

        <div className="space-y-3">
          {training.map((t) => (
            <div
              key={t.id}
              className="p-3 bg-gray-900 rounded border border-gray-700 flex justify-between"
            >
              <div>
                <p className="font-semibold">{t.certification?.name}</p>
                <p className="text-xs text-gray-400">
                  Completed: {new Date(t.completedAt).toLocaleDateString()}
                </p>
              </div>

              <p
                className={`font-semibold ${
                  t.isValid ? "text-green-400" : "text-red-400"
                }`}
              >
                {t.isValid ? "Valid" : "Expired"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Incident History */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Incident History</h2>

        {incidents.length === 0 && (
          <p className="text-gray-500">No incidents reported.</p>
        )}

        <div className="space-y-3">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className="p-3 bg-gray-900 rounded border border-gray-700"
            >
              <p className="font-semibold">{inc.type}</p>
              <p className="text-sm text-gray-400">{inc.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(inc.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Verification Logs */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Recent Verification Logs</h2>

        {logs.length === 0 && (
          <p className="text-gray-500">No verification logs.</p>
        )}

        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-gray-900 rounded border border-gray-700"
            >
              <p
                className={`font-semibold ${
                  log.result === "SAFE" ? "text-green-400" : "text-red-400"
                }`}
              >
                {log.result}
              </p>

              <p className="text-sm text-gray-400">
                {log.reasons?.join(", ")}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Actions */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Actions</h2>

        <div className="grid grid-cols-2 gap-4">
          <Link
            href={`/supervisor/signoff/preuse?worker=${worker.id}`}
            className="rounded-[3px] border border-[#3D8F58] bg-[#4FAF6F] p-4 text-center font-semibold text-[#0F1A12] shadow-none transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-[#45A064]"
          >
            Pre‑Use Signoff
          </Link>

          <Link
            href="/supervisor/incidents/new"
            className="rounded-[3px] border border-[#174F86] bg-[#1E6FB8] p-4 text-center font-semibold text-[#F4F6F8] shadow-none transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-[#1A63A6]"
          >
            Report Incident
          </Link>
        </div>
      </section>
    </div>
  );
}
