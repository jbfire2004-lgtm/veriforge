"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import Signature from "@/app/components/SignaturePad";
import { apiPost, apiGet } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import {
  parseRequiredPositiveIntParam,
  preUseSignoffRedirectPath,
} from "@/lib/core/field-scan";
import { unknownToErrorMessage } from "@/lib/core";

type LoadedWorker = {
  id: number;
  firstName?: string;
  lastName?: string;
  company?: { name?: string } | null;
};

type LoadedEquipment = {
  id: number;
  name?: string;
  serialNumber?: string | null;
};

function PreUseSignoffContent() {
  const params = useSearchParams();
  const router = useRouter();

  const workerParsed = useMemo(
    () => parseRequiredPositiveIntParam(params?.get("worker") ?? null),
    [params]
  );
  const equipParsed = useMemo(
    () => parseRequiredPositiveIntParam(params?.get("equipment") ?? null),
    [params]
  );

  const workerId = workerParsed.ok ? workerParsed.value : null;
  const equipmentId = equipParsed.ok ? equipParsed.value : null;

  const [worker, setWorker] = useState<LoadedWorker | null>(null);
  const [equipment, setEquipment] = useState<LoadedEquipment | null>(null);

  const [checklist, setChecklist] = useState({
    damage: false,
    leaks: false,
    controls: false,
    tires: false,
  });

  const [workerSig, setWorkerSig] = useState("");
  const [superSig, setSuperSig] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [queryError, setQueryError] = useState("");

  useEffect(() => {
    const rawW = params?.get("worker");
    const rawE = params?.get("equipment");
    const parts: string[] = [];
    if (rawW != null && rawW !== "" && !workerParsed.ok) {
      parts.push(`worker: ${workerParsed.reason}`);
    }
    if (rawE != null && rawE !== "" && !equipParsed.ok) {
      parts.push(`equipment: ${equipParsed.reason}`);
    }
    setQueryError(parts.join(" · "));
  }, [params, workerParsed, equipParsed]);

  useEffect(() => {
    async function load() {
      if (
        workerId === null &&
        equipmentId === null &&
        params?.get("worker") === null &&
        params?.get("equipment") === null
      ) {
        setWorker(null);
        setEquipment(null);
        setLoading(false);
        return;
      }

      try {
        if (workerId !== null) {
          const w = await apiGet<LoadedWorker>(`/workers/${workerId}`);
          setWorker(w);
        } else setWorker(null);

        if (equipmentId !== null) {
          const e = await apiGet<LoadedEquipment>(`/equipment/${equipmentId}`);
          setEquipment(e);
        } else setEquipment(null);
      } catch (err) {
        setError(
          unknownToErrorMessage(err, "Failed to load worker or equipment")
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [workerId, equipmentId, params]);

  async function submit() {
    setError("");

    const allChecked = Object.values(checklist).every((v) => v === true);
    if (!allChecked) {
      setError("All checklist items must be completed.");
      return;
    }

    if (!superSig) {
      setError("Supervisor signature is required.");
      return;
    }

    if (workerId === null && equipmentId === null) {
      setError(
        "Select a worker or equipment — add ?worker=&equipment= query params."
      );
      return;
    }

    setSubmitting(true);

    try {
      await apiPost("/signoff/preuse", {
        workerId: workerId ?? null,
        equipmentId: equipmentId ?? null,
        checklist,
        workerSignature: workerSig || null,
        supervisorSignature: superSig,
        notes,
      });

      router.push(
        preUseSignoffRedirectPath({ workerId, equipmentId })
      );
    } catch (err) {
      setError(unknownToErrorMessage(err, "Failed to submit sign‑off."));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-black text-white min-h-screen">
        <p className="text-gray-400">Loading sign‑off form…</p>
      </div>
    );
  }

  const showContextWarning =
    (workerId !== null && !worker) || (equipmentId !== null && !equipment);

  return (
    <div className="p-6 bg-black text-white min-h-screen space-y-8 pb-24">
      <h1 className="text-3xl font-bold text-center">Pre‑Use Inspection</h1>

      {queryError && (
        <p className="text-amber-400 text-center text-sm">{queryError}</p>
      )}

      {showContextWarning && (
        <p className="text-amber-400 text-center">
          Could not resolve worker or equipment from the URL — you can still
          fill out the form once records exist.
        </p>
      )}

      <div className="space-y-4">
        {worker && (
          <div className="bg-gray-900 p-4 rounded border border-gray-700">
            <h2 className="text-xl font-semibold mb-1">Worker</h2>
            <p className="font-bold">
              {worker.firstName} {worker.lastName}
            </p>
            <p className="text-gray-400 text-sm">ID: {worker.id}</p>
            <p className="text-gray-400 text-sm">
              Company: {worker.company?.name || "N/A"}
            </p>
          </div>
        )}

        {equipment && (
          <div className="bg-gray-900 p-4 rounded border border-gray-700">
            <h2 className="text-xl font-semibold mb-1">Equipment</h2>
            <p className="font-bold">{equipment.name}</p>
            <p className="text-gray-400 text-sm">ID: {equipment.id}</p>
            <p className="text-gray-400 text-sm">
              Serial: {equipment.serialNumber || "N/A"}
            </p>
          </div>
        )}
      </div>

      <section className="p-4 bg-gray-900 rounded border border-gray-700 space-y-4">
        <h2 className="text-xl font-semibold">Checklist</h2>

        {Object.entries(checklist).map(([key, value]) => (
          <label key={key} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) =>
                setChecklist({ ...checklist, [key]: e.target.checked })
              }
              className="w-5 h-5"
            />
            <span className="capitalize">{key}</span>
          </label>
        ))}
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Worker Signature</h2>
          <Signature onChange={setWorkerSig} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Supervisor Signature</h2>
          <Signature onChange={setSuperSig} />
        </div>
      </section>

      <textarea
        className="w-full p-3 text-black rounded"
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {error && <p className="text-red-400">{error}</p>}

      <button
        disabled={submitting}
        onClick={() => void submit()}
        className="w-full p-4 bg-green-600 rounded text-xl"
      >
        {submitting ? "Submitting…" : "Submit Sign‑Off"}
      </button>
    </div>
  );
}

export default function PreUseSignoff() {
  return (
    <Suspense
      fallback={
        <div className="p-6 bg-black text-white min-h-screen">
          <p className="text-gray-400">Loading sign-off form…</p>
        </div>
      }
    >
      <PreUseSignoffContent />
    </Suspense>
  );
}
