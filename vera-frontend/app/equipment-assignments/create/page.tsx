"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

type EquipmentOption = {
  id: number;
  name?: string | null;
  serialNumber?: string | null;
};

type WorkerOption = {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
};

type CompanyOption = {
  id: number;
  name?: string | null;
};

export default function CreateAssignmentPage() {
  const router = useRouter();
  const toast = useToast();

  const [equipment, setEquipment] = useState<EquipmentOption[]>([]);
  const [workers, setWorkers] = useState<WorkerOption[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);

  const [equipmentId, setEquipmentId] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [eq, wr, co] = await Promise.all([
          apiGet<EquipmentOption[]>("/equipment"),
          apiGet<WorkerOption[]>("/workers"),
          apiGet<CompanyOption[]>("/companies"),
        ]);
        if (!cancelled) {
          setEquipment(eq);
          setWorkers(wr);
          setCompanies(co);
          setLoadError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Could not load options.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit() {
    if (!equipmentId) {
      toast.toast({ title: "Pick an equipment item first.", variant: "warning" });
      return;
    }
    setSubmitting(true);
    try {
      await apiPost("/equipment-assignments", {
        equipmentId: Number(equipmentId),
        workerId: workerId ? Number(workerId) : undefined,
        companyId: companyId ? Number(companyId) : undefined,
      });
      toast.toast({ title: "Equipment assigned.", variant: "success" });
      router.push("/equipment-assignments");
    } catch (e) {
      toast.toast({
        title: "Could not create assignment.",
        description: e instanceof Error ? e.message : undefined,
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Assign Equipment</h1>

      {loadError != null ? (
        <p role="alert" className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {loadError}
        </p>
      ) : null}

      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-1" htmlFor="equipmentId">
            Equipment
          </label>
          <select
            id="equipmentId"
            className="border p-2 w-full"
            value={equipmentId}
            onChange={(e) => setEquipmentId(e.target.value)}
          >
            <option value="">Select equipment</option>
            {equipment.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name ?? `Equipment #${e.id}`} — {e.serialNumber ?? "no serial"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1" htmlFor="workerId">
            Assign to Worker
          </label>
          <select
            id="workerId"
            className="border p-2 w-full"
            value={workerId}
            onChange={(e) => {
              setWorkerId(e.target.value);
              setCompanyId("");
            }}
          >
            <option value="">None</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.firstName} {w.lastName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1" htmlFor="companyId">
            Assign to Company
          </label>
          <select
            id="companyId"
            className="border p-2 w-full"
            value={companyId}
            onChange={(e) => {
              setCompanyId(e.target.value);
              setWorkerId("");
            }}
          >
            <option value="">None</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={submitting || !equipmentId}
          className="px-4 py-2 bg-blue-600 text-white rounded w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Assigning…" : "Assign Equipment"}
        </button>
      </div>
    </div>
  );
}
