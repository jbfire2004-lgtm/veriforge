"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetchJson } from "@/lib/api-fetch";

export default function CompanyProfile({ params }: any) {
  const { id } = params;

  const [company, setCompany] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    apiFetchJson(`/companies/${id}`).then((data) => setCompany(data));
    apiFetchJson<any[]>(`/workers/company/${id}`).then((data) => setWorkers(data));
    apiFetchJson<any[]>(`/equipment/company/${id}`).then((data) => setEquipment(data));
    apiFetchJson<any[]>(`/documents/company/${id}`).then((data) => setDocuments(data));
    apiFetchJson<any[]>(`/incident/company/${id}`).then((data) =>
      setIncidents(data.slice(0, 5))
    );
  }, [id]);

  if (!company) {
    return (
      <div className="p-6 bg-black text-white min-h-screen">
        <p className="text-gray-400">Loading company...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-black text-white min-h-screen space-y-10 pb-24">

      {/* Header */}
      <div className="flex items-center gap-4">
        {company.logoUrl && (
          <img
            src={company.logoUrl}
            alt="Company Logo"
            className="w-20 h-20 rounded object-cover border border-gray-700"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">{company.name}</h1>
          <p className="text-gray-400">Company ID: {company.id}</p>
        </div>
      </div>

      {/* Workers */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Workers</h2>

        {workers.length === 0 && (
          <p className="text-gray-500">No workers found.</p>
        )}

        <div className="space-y-3">
          {workers.map((w) => (
            <Link
              key={w.id}
              href={`/supervisor/worker-lookup/${w.id}`}
              className="block p-3 bg-gray-900 rounded border border-gray-700"
            >
              <p className="font-semibold">
                {w.firstName} {w.lastName}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Equipment */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Equipment</h2>

        {equipment.length === 0 && (
          <p className="text-gray-500">No equipment found.</p>
        )}

        <div className="space-y-3">
          {equipment.map((e) => (
            <Link
              key={e.id}
              href={`/supervisor/equipment-lookup/${e.id}`}
              className="block p-3 bg-gray-900 rounded border border-gray-700"
            >
              <p className="font-semibold">{e.name}</p>
              <p className="text-sm text-gray-400">
                Serial: {e.serialNumber ?? "N/A"}
              </p>
            </Link>
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
          href={`/supervisor/documents/company/${id}`}
          className="block text-center p-4 bg-blue-600 rounded font-semibold mt-4"
        >
          View All Documents
        </Link>
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
