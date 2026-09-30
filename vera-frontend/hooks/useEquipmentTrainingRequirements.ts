"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createEquipmentTrainingRequirement,
  deleteEquipmentTrainingRequirement,
  fetchEquipmentTrainingRequirementsByEquipment,
  type EquipmentTrainingRequirementRow,
} from "@/lib/api/equipment-training-requirements";
import {
  fetchCertifications,
  type CertificationSummary,
} from "@/lib/api/certifications";

export function useEquipmentTrainingRequirements(equipmentId: number) {
  const [rows, setRows] = useState<EquipmentTrainingRequirementRow[]>([]);
  const [certifications, setCertifications] = useState<CertificationSummary[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [requirementRows, certRows] = await Promise.all([
        fetchEquipmentTrainingRequirementsByEquipment(equipmentId),
        fetchCertifications(),
      ]);
      setRows(requirementRows);
      setCertifications(certRows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [equipmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const add = useCallback(
    async (certificationId: number) => {
      setError(null);
      try {
        const created = await createEquipmentTrainingRequirement({
          equipmentId,
          certificationId,
        });
        setRows((prev) => [...prev, created]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to add requirement");
        throw e;
      }
    },
    [equipmentId]
  );

  const remove = useCallback(async (id: number) => {
    setError(null);
    try {
      await deleteEquipmentTrainingRequirement(id);
      setRows((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove");
      throw e;
    }
  }, []);

  return {
    rows,
    certifications,
    loading,
    error,
    refresh: load,
    add,
    remove,
  };
}
