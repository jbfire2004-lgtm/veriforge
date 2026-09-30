"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function EquipmentRequirementsPage({ params }: any) {
  const equipmentId = params.id;
  const router = useRouter();

  const [equipment, setEquipment] = useState<any>(null);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [selectedCert, setSelectedCert] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // LOAD EQUIPMENT + REQUIREMENTS + CERTIFICATIONS
  // ---------------------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const eq = await apiGet(`/equipment/${equipmentId}`);
        setEquipment(eq);

        const req = await apiGet(
          `/equipment-training-requirements/equipment/${equipmentId}`
        );
        setRequirements(req);

        const certs = await apiGet(`/certifications`);
        setCertifications(certs);
      } catch (err) {
        console.error("Failed to load requirements editor", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [equipmentId]);

  // ---------------------------------------------------------
  // ADD REQUIREMENT
  // ---------------------------------------------------------
  async function addRequirement() {
    setError("");

    if (!selectedCert) {
      setError("Select a certification to add.");
      return;
    }

    setSaving(true);

    try {
      const newReq = await apiPost(`/equipment-training-requirements`, {
        equipmentId: Number(equipmentId),
        certificationId: Number(selectedCert),
      });

      setRequirements((prev) => [...prev, newReq]);
      setSelectedCert("");
    } catch (err) {
      console.error(err);
      setError("Failed to add requirement.");
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------
  // REMOVE REQUIREMENT
  // ---------------------------------------------------------
  async function removeRequirement(reqId: number) {
    setSaving(true);

    try {
      await apiDelete(`/equipment-training-requirements/${reqId}`);
      setRequirements((prev) => prev.filter((r) => r.id !== reqId));
    } catch (err) {
      console.error(err);
      setError("Failed to remove requirement.");
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------
  if (loading) {
    return (
      <div className="p-6 bg-black text-white min-h-screen">
        <p className="text-gray-400">Loading requirements…</p>
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
    <div className="p-6 bg-black text-white min-h-screen space-y-10 pb-24">

      <h1 className="text-3xl font-bold text-center">Edit Requirements</h1>

      {/* Equipment Summary */}
      <section className="bg-gray-900 p-4 rounded border border-gray-700 space-y-1">
        <h2 className="text-xl font-semibold mb-1">Equipment</h2>
        <p className="font-bold">{equipment.name}</p>
        <p className="text-gray-400 text-sm">
          Serial: {equipment.serialNumber || "N/A"}
        </p>
      </section>

      {/* Current Requirements */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Current Requirements</h2>

        {requirements.length === 0 && (
          <p className="text-gray-500">No certification requirements.</p>
        )}

        <div className="space-y-3">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="p-3 bg-gray-900 rounded border border-gray-700 flex justify-between items-center"
            >
              <p>{req.certification?.name}</p>

              <button
                onClick={() => removeRequirement(req.id)}
                disabled={saving}
                className="rounded-[3px] border border-[#A8842F] bg-[#C89F3D] px-3 py-1 text-sm font-medium text-[#1C1A10] shadow-none transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-[#B89136] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8] disabled:opacity-50 disabled:translate-y-0"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Add Requirement */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Add Requirement</h2>

        <select
          className="w-full p-3 rounded text-black"
          value={selectedCert}
          onChange={(e) => setSelectedCert(e.target.value)}
        >
          <option value="">Select certification…</option>
          {certifications.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          onClick={addRequirement}
          disabled={saving}
          className="w-full p-4 bg-green-600 rounded text-xl mt-4 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Add Requirement"}
        </button>
      </section>

      {/* Error */}
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
