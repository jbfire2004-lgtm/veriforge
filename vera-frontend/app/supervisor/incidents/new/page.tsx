"use client";

import { useState, useEffect } from "react";
import Signature from "@/app/components/SignaturePad";
import { apiPost } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function NewIncidentReport() {
  const router = useRouter();

  const [type, setType] = useState("NEAR_MISS");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("LOW");
  const [notes, setNotes] = useState("");

  const [workerId, setWorkerId] = useState("");
  const [equipmentId, setEquipmentId] = useState("");

  const [workerSig, setWorkerSig] = useState("");
  const [superSig, setSuperSig] = useState("");

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // GET GPS LOCATION
  // ---------------------------------------------------------
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      () => {
        console.warn("GPS unavailable");
      }
    );
  }, []);

  // ---------------------------------------------------------
  // SUBMIT INCIDENT
  // ---------------------------------------------------------
  async function submit() {
    setError("");

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    if (!superSig) {
      setError("Supervisor signature is required");
      return;
    }

    setLoading(true);

    try {
      const created = await apiPost<{ id: number }>("/incidents", {
        description,
        severity,
        category: type,
        workerId: workerId ? Number(workerId) : undefined,
        equipmentId: equipmentId ? Number(equipmentId) : undefined,
        latitude: lat ?? undefined,
        longitude: lng ?? undefined,
        metadata: {
          notes: notes || undefined,
          workerSignature: workerSig || undefined,
          supervisorSignature: superSig,
        },
      });

      router.push(`/supervisor/incidents/${created.id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to submit incident");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-black text-white min-h-screen space-y-6 pb-24">
      <h1 className="text-3xl font-bold text-center">New Incident Report</h1>

      {/* Incident Type */}
      <select
        className="w-full p-3 text-black rounded"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="INJURY">Injury</option>
        <option value="NEAR_MISS">Near Miss</option>
        <option value="UNSAFE_CONDITION">Unsafe Condition</option>
        <option value="EQUIPMENT_FAILURE">Equipment Failure</option>
        <option value="PROPERTY_DAMAGE">Property Damage</option>
      </select>

      {/* Description */}
      <textarea
        className="w-full p-3 text-black rounded"
        placeholder="Describe what happened..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Severity */}
      <select
        className="w-full p-3 text-black rounded"
        value={severity}
        onChange={(e) => setSeverity(e.target.value)}
      >
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="CRITICAL">Critical</option>
      </select>

      {/* Notes */}
      <textarea
        className="w-full p-3 text-black rounded"
        placeholder="Additional notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {/* Optional Worker ID */}
      <input
        type="text"
        className="w-full p-3 text-black rounded"
        placeholder="Worker ID (optional)"
        value={workerId}
        onChange={(e) => setWorkerId(e.target.value)}
      />

      {/* Optional Equipment ID */}
      <input
        type="text"
        className="w-full p-3 text-black rounded"
        placeholder="Equipment ID (optional)"
        value={equipmentId}
        onChange={(e) => setEquipmentId(e.target.value)}
      />

      {/* GPS */}
      <p className="text-gray-400 text-sm">
        GPS: {lat && lng ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : "Locating…"}
      </p>

      {/* Worker Signature */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Worker Signature (optional)</h2>
        <Signature onChange={setWorkerSig} />
      </div>

      {/* Supervisor Signature */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Supervisor Signature</h2>
        <Signature onChange={setSuperSig} />
      </div>

      {/* Error */}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Submit */}
      <button
        onClick={submit}
        disabled={loading}
        className="w-full rounded-[3px] border border-[#174F86] bg-[#1E6FB8] p-4 text-xl font-semibold text-[#F4F6F8] shadow-none transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-[#1A63A6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8] focus-visible:ring-offset-2 disabled:opacity-50 disabled:translate-y-0"
      >
        {loading ? "Submitting…" : "Submit Incident Report"}
      </button>
    </div>
  );
}
