"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AssignEquipmentPage({ params }: any) {
  const equipmentId = params.id;
  const router = useRouter();

  const [equipment, setEquipment] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // LOAD EQUIPMENT + WORKERS (same company)
  // ---------------------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const eq = await apiGet(`/equipment/${equipmentId}`);
        setEquipment(eq);

        if (eq.companyId) {
          const w = await apiGet(`/workers/company/${eq.companyId}`);
          setWorkers(w);
        }
      } catch (err) {
        console.error("Failed to load assignment data", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [equipmentId]);

  // ---------------------------------------------------------
  // SUBMIT ASSIGNMENT
  // ---------------------------------------------------------
  async function submit() {
    setError("");

    if (!selectedWorker) {
      setError("Select a worker to assign this equipment.");
      return;
    }

    setSubmitting(true);

    try {
      await apiPost(`/equipment-assignments`, {
        workerId: Number(selectedWorker),
        equipmentId: Number(equipmentId),
      });

      router.push(`/supervisor/equipment/${equipmentId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to assign equipment.");
    } finally {
      setSubmitting(false);
    }
  }

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------
  if (loading) {
    return (
      <div className="p-6 bg-black text-white min-h-screen">
        <p className="text-gray-400">Loading assignment form…</p>
      </div>
    );
  }

  // ---------------------------------------------------------
  // INVALID
  // ---------------------------------------------------------
  if (!equipment) {
    return (
      <div className="p-6 bg-black text-white min-h-screen">
        <p className="text-red-500">Equipment not found.</p>
      </div>
    );
  }

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="p-6 bg-black text-white min-h-screen space-y-8 pb-24">

      <h1 className="text-3xl font-bold text-center">Assign Equipment</h1>

      {/* Equipment Summary */}
      <section className="bg-gray-900 p-4 rounded border border-gray-700 space-y-1">
        <h2 className="text-xl font-semibold mb-1">Equipment</h2>
        <p className="font-bold">{equipment.name}</p>
        <p className="text-gray-400 text-sm">
          Serial: {equipment.serialNumber || "N/A"}
        </p>
        <p className="text-gray-400 text-sm">
          Company: {equipment.company?.name || "N/A"}
        </p>
      </section>

      {/* Worker Selection */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Assign To Worker</h2>

        {workers.length === 0 && (
          <p className="text-gray-500">No workers available in this company.</p>
        )}

        <select
          className="w-full p-3 rounded text-black"
          value={selectedWorker}
          onChange={(e) => setSelectedWorker(e.target.value)}
        >
          <option value="">Select worker…</option>
          {workers.map((w) => (
            <option key={w.id} value={w.id}>
              {w.firstName} {w.lastName} (ID: {w.id})
            </option>
          ))}
        </select>
      </section>

      {/* Notes */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Notes (optional)</h2>
        <textarea
          className="w-full p-3 text-black rounded"
          placeholder="Assignment notes…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </section>

      {/* Error */}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Submit */}
      <button
        onClick={submit}
        disabled={submitting}
        className="w-full p-4 bg-green-600 rounded text-xl disabled:opacity-50"
      >
        {submitting ? "Assigning…" : "Assign Equipment"}
      </button>
    </div>
  );
}
