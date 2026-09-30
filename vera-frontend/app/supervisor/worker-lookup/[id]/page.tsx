"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetchJson } from "@/lib/api-fetch";

export default function WorkerProfile({ params }: any) {
  const { id } = params;

  const [worker, setWorker] = useState<any>(null);
  const [certs, setCerts] = useState<any[]>([]);
  const [training, setTraining] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [siteAccess, setSiteAccess] = useState<any[]>([]);

  useEffect(() => {
    apiFetchJson(`/workers/${id}`).then((data) => setWorker(data));
    apiFetchJson<any[]>(`/training-records/worker/${id}`).then((data) =>
      setTraining(data)
    );
    apiFetchJson<any[]>(`/equipment-assignments/worker/${id}`).then((data) =>
      setEquipment(data)
    );
    apiFetchJson<any[]>(`/documents/worker/${id}`).then((data) =>
      setDocuments(data)
    );
    apiFetchJson<any[]>(`/verification/logs/worker/${id}`).then((data) =>
      setLogs(data.slice(0, 5))
    );
    apiFetchJson<any[]>(`/site-access/worker/${id}`).then((data) =>
      setSiteAccess(data)
    );
  }, [id]);

  if (!worker) {
    return (
      <div className="p-6 bg-black text-white min-h-screen">
        <p className="text-gray-400">Loading worker...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-black text-white min-h-screen space-y-10 pb-24">

      {/* Header */}
      <div className="flex items-center gap-4">
        {worker.photoUrl && (
          <img
            src={worker.photoUrl}
            alt="Worker"
            className="w-20 h-20 rounded-full object-cover border border-gray-700"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">
            {worker.firstName} {worker.lastName}
          </h1>
          <p className="text-gray-400">Worker ID: {worker.id}</p>
          <p className="text-gray-400">Company: {worker.company?.name}</p>
        </div>
      </div>

      {/* Certifications */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Certifications</h2>

        {training.length === 0 && (
          <p className="text-gray-500">No certifications found.</p>
        )}

        <div className="space-y-3">
          {training.map((rec) => (
            <div
              key={rec.id}
              className="p-3 bg-gray-900 rounded border border-gray-700"
            >
              <p className="font-semibold">{rec.certification.name}</p>
              <p className="text-sm text-gray-400">
                Expires: {new Date(rec.expiresAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Equipment */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Assigned Equipment</h2>

        {equipment.length === 0 && (
          <p className="text-gray-500">No equipment assigned.</p>
        )}

        <div className="space-y-3">
          {equipment.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-gray-900 rounded border border-gray-700"
            >
              <p className="font-semibold">{item.equipment.name}</p>
              <p className="text-sm text-gray-400">
                Assigned: {new Date(item.assignedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Documents */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Documents</h2>

        {documents.length === 0 && (
          <p className="text-gray-500">No documents uploaded.</p>
        )}

        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-3 bg-gray-900 rounded border border-gray-700"
            >
              <p className="font-semibold">{doc.name}</p>
              <p className="text-sm text-gray-400">{doc.type}</p>
              <a
                href={doc.url}
                target="_blank"
                className="text-blue-400 underline text-sm"
              >
                View Document
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Logs */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Recent Verifications</h2>

        {logs.length === 0 && (
          <p className="text-gray-500">No recent logs.</p>
        )}

        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-gray-900 rounded border border-gray-700"
            >
              <p className="font-semibold">{log.result}</p>
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

      {/* Site Access */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Site Access</h2>

        {siteAccess.length === 0 && (
          <p className="text-gray-500">No site access records.</p>
        )}

        <div className="space-y-3">
          {siteAccess.map((access) => (
            <div
              key={access.id}
              className="p-3 bg-gray-900 rounded border border-gray-700"
            >
              <p className="font-semibold">{access.site.name}</p>
              <p
                className={`text-sm ${
                  access.approved ? "text-green-400" : "text-red-400"
                }`}
              >
                {access.approved ? "Approved" : "Denied"}
              </p>
              {access.notes && (
                <p className="text-xs text-gray-400 mt-1">{access.notes}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Link to documents page */}
      <Link
        href={`/supervisor/documents/worker/${id}`}
        className="block text-center p-4 bg-blue-600 rounded font-semibold mt-6"
      >
        View All Documents
      </Link>
    </div>
  );
}
