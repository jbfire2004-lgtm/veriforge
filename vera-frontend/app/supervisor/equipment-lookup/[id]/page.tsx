"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetchJson } from "@/lib/api-fetch";

export default function EquipmentProfile({ params }: any) {
  const { id } = params;

  const [equipment, setEquipment] = useState<any>(null);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    apiFetchJson(`/equipment/${id}`).then((data) => setEquipment(data));
    apiFetchJson<any[]>(
      `/equipment-training-requirements/equipment/${id}`
    ).then((data) => setRequirements(data));
    apiFetchJson<any[]>(`/equipment-assignments/equipment/${id}`).then((data) =>
      setAssignments(data)
    );
    apiFetchJson<any[]>(`/documents/equipment/${id}`).then((data) =>
      setDocuments(data)
    );
    apiFetchJson<any[]>(`/verification/logs/equipment/${id}`).then((data) =>
      setLogs(data.slice(0, 5))
    );
    apiFetchJson<any[]>(`/incident/equipment/${id}`).then((data) =>
      setIncidents(data.slice(0, 5))
    );
  }, [id]);

  if (!equipment) {
    return (
      <div className="p-6 bg-black text-white min-h-screen">
        <p className="text-gray-400">Loading equipment...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-black text-white min-h-screen space-y-10 pb-24">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{equipment.name}</h1>
        <p className="text-gray-400">Serial: {equipment.serialNumber ?? "N/A"}</p>
        <p className={`mt-1 font-semibold ${
          equipment.isSafe ? "text-green-400" : "text-red-400"
        }`}>
          {equipment.isSafe ? "Safe to Use" : "Unsafe — Do Not Operate"}
        </p>
      </div>

      {/* Certification Requirements */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Required Certifications</h2>

        {requirements.length === 0 && (
          <p className="text-gray-500">No certification requirements.</p>
        )}

        <div className="space-y-3">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="p-3 bg-gray-900 rounded border border-gray-700"
            >
              <p className="font-semibold">{req.certification.name}</p>
              <p className="text-sm text-gray-400">{req.certification.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Assigned Workers */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Assigned Workers</h2>

        {assignments.length === 0 && (
          <p className="text-gray-500">No workers assigned.</p>
        )}

        <div className="space-y-3">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="p-3 bg-gray-900 rounded border border-gray-700"
            >
              <p className="font-semibold">
                {a.worker.firstName} {a.worker.lastName}
              </p>
              <p className="text-sm text-gray-400">
                Assigned: {new Date(a.assignedAt).toLocaleDateString()}
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

        <Link
          href={`/supervisor/documents/equipment/${id}`}
          className="block text-center p-4 bg-blue-600 rounded font-semibold mt-4"
        >
          View All Documents
        </Link>
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

      {/* Recent Incidents */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Recent Incidents</h2>

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
    </div>
  );
}
