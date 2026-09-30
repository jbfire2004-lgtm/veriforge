"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SignoffDetailPage({ params }: any) {
  const router = useRouter();
  const id = params.id;

  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet(`/signoff/${id}`);
        setRecord(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 bg-black text-white min-h-screen">
        Loading signoff…
      </div>
    );
  }

  if (!record) {
    return (
      <div className="p-6 bg-black text-white min-h-screen">
        <p className="text-red-400">Signoff not found.</p>
      </div>
    );
  }

  const { worker, equipment, checklist, workerSignature, supervisorSignature } =
    record;

  return (
    <div className="p-6 bg-black text-white min-h-screen space-y-8 pb-24">
      <button
        onClick={() => router.back()}
        className="text-gray-400 underline mb-4"
      >
        Back
      </button>

      <h1 className="text-3xl font-bold text-center">Signoff Details</h1>

      {/* Worker */}
      <section className="p-4 bg-gray-900 rounded border border-gray-700">
        <h2 className="text-xl font-semibold mb-2">Worker</h2>
        <p className="font-bold">
          {worker.firstName} {worker.lastName}
        </p>
        <p className="text-gray-400 text-sm">ID: {worker.id}</p>
        <p className="text-gray-400 text-sm">
          Company: {worker.company?.name || "N/A"}
        </p>
      </section>

      {/* Equipment */}
      <section className="p-4 bg-gray-900 rounded border border-gray-700">
        <h2 className="text-xl font-semibold mb-2">Equipment</h2>
        <p className="font-bold">{equipment.name}</p>
        <p className="text-gray-400 text-sm">ID: {equipment.id}</p>
        <p className="text-gray-400 text-sm">
          Serial: {equipment.serialNumber || "N/A"}
        </p>
      </section>

      {/* Checklist */}
      <section className="p-4 bg-gray-900 rounded border border-gray-700 space-y-2">
        <h2 className="text-xl font-semibold mb-2">Checklist</h2>

        {Object.entries(checklist).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="capitalize">{key}</span>
            <span className={value ? "text-green-400" : "text-red-400"}>
              {value ? "✔" : "✘"}
            </span>
          </div>
        ))}
      </section>

      {/* Signatures */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Worker Signature</h2>
          {workerSignature ? (
            <img
              src={workerSignature}
              alt="Worker Signature"
              className="bg-white rounded p-2"
            />
          ) : (
            <p className="text-gray-500">No worker signature</p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Supervisor Signature</h2>
          {supervisorSignature ? (
            <img
              src={supervisorSignature}
              alt="Supervisor Signature"
              className="bg-white rounded p-2"
            />
          ) : (
            <p className="text-gray-500">No supervisor signature</p>
          )}
        </div>
      </section>

      {/* Notes */}
      {record.notes && (
        <section className="p-4 bg-gray-900 rounded border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">Notes</h2>
          <p className="text-gray-300 whitespace-pre-wrap">{record.notes}</p>
        </section>
      )}

      {/* Timestamp */}
      <p className="text-gray-500 text-center text-sm">
        Completed: {new Date(record.createdAt).toLocaleString()}
      </p>
    </div>
  );
}
