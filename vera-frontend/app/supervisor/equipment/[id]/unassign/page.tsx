"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function EquipmentUnassignPage({ params }: any) {
  const equipmentId = params.id;
  const router = useRouter();

  const [equipment, setEquipment] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // LOAD EQUIPMENT + ASSIGNMENTS
  // ---------------------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const eq = await apiGet(`/equipment/${equipmentId}`);
        setEquipment(eq);

        const asg = await apiGet(
          `/equipment-assignments/equipment/${equipmentId}`
        );
        setAssignments(asg);
      } catch (err) {
        console.error("Failed to load unassignment data", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [equipmentId]);

  // ---------------------------------------------------------
  // SUBMIT UNASSIGNMENT
  // ---------------------------------------------------------
  async function submit() {
    setError("");

    if (!selectedWorker) {
      setError("Select a worker to unassign.");
      return;
    }

    setSubmitting(true);

    try {
      const active = assignments.find(
        (a: { workerId: number; equipmentId: number | null; endedAt: Date | null }) =>
          a.workerId === Number(selectedWorker) &&
          Number(a.equipmentId) === Number(equipmentId) &&
          !a.endedAt
      );
      if (!active) {
        setError("No active assignment for that worker on this equipment.");
        setSubmitting(false);
        return;
      }

      await apiPatch(`/equipment-assignments/${active.id}/return`, {});

      router.push(`/supervisor/equipment/${equipmentId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to unassign worker.");
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
        <p className="text-gray-400">Loading unassignment form…</p>
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

      <h1 className="text-3xl font-bold text-center">Unassign Worker</h1>

      {/* Equipment Summary */}
      <section className="bg-gray-900 p-4 rounded border border-gray-700 space-y-1">
        <h2 className="text-xl font-semibold mb-1">Equipment</h2>
        <p className="font-bold">{equipment.name}</p>
        <p className="text-gray-400 text-sm">
          Serial: {equipment.serialNumber || "N/A"}
        </p>
      </section>

      {/* Assigned Workers */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Currently Assigned</h2>

        {assignments.filter((a) => !a.endedAt).length === 0 && (
          <p className="text-gray-500">
            No active assignments for this equipment.
          </p>
        )}

        <select
          className="w-full p-3 rounded text-black"
          value={selectedWorker}
          onChange={(e) => setSelectedWorker(e.target.value)}
        >
          <option value="">Select worker…</option>
          {assignments
            .filter((a) => !a.endedAt)
            .map((a) => (
              <option key={a.id} value={a.workerId}>
                {a.worker.firstName} {a.worker.lastName} (ID: {a.workerId})
              </option>
            ))}
        </select>
      </section>

      {/* Notes — not sent to API; PATCH …/return has no notes field */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Notes (optional)</h2>
        <p className="mb-2 text-xs text-gray-500">
          For your records only — the API does not store unassignment notes on
          return.
        </p>
        <textarea
          className="w-full p-3 text-black rounded"
          placeholder="Reason for unassignment…"
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
        className="w-full rounded-[3px] border border-[#A8842F] bg-[#C89F3D] p-4 text-xl font-semibold text-[#1C1A10] shadow-none transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-[#B89136] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8] focus-visible:ring-offset-2 disabled:opacity-50 disabled:translate-y-0"
      >
        {submitting ? "Unassigning…" : "Unassign Worker"}
      </button>
    </div>
  );
}
