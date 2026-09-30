"use client";

import { useEffect, useState } from "react";
import { apiFetchJson } from "@/lib/api-fetch";

export default function EquipmentDocuments({ params }: any) {
  const { id } = params;
  const [docs, setDocs] = useState<any[]>([]);

  useEffect(() => {
    apiFetchJson<any[]>(`/documents/equipment/${id}`).then((data) => setDocs(data));
  }, [id]);

  return (
    <div className="p-6 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Equipment Documents</h1>

      {docs.length === 0 && (
        <p className="text-gray-400">No documents found.</p>
      )}

      <div className="space-y-4">
        {docs.map((doc: any) => (
          <div key={doc.id} className="p-4 bg-gray-900 rounded border border-gray-700">
            <p className="text-xl font-semibold">{doc.name}</p>
            <p className="text-sm text-gray-400">{doc.type}</p>
            <p className="text-sm text-gray-500">{doc.description}</p>

            <a
              href={doc.url}
              target="_blank"
              className="mt-2 inline-block px-4 py-2 bg-blue-600 rounded"
            >
              View Document
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
