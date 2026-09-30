"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteCompanyTrainingRequirement,
  fetchCompanyTrainingRequirements,
  replaceCompanyTrainingRequirements,
  updateCompanyTrainingRequirement,
  type CompanyTrainingRequirementRow,
} from "@/lib/api/training-requirements";

export function useCompanyTrainingRequirements(companyId: number) {
  const [rows, setRows] = useState<CompanyTrainingRequirementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const r = await fetchCompanyTrainingRequirements(companyId);
      setRows(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void load();
  }, [load]);

  const add = useCallback(
    async (courseName: string, expiresInDays: number) => {
      setError(null);
      setSaving(true);
      try {
        const next: { courseName: string; expiresInDays: number }[] = [
          ...rows.map((x) => ({
            courseName: x.courseName,
            expiresInDays: x.expiresInDays,
          })),
          { courseName, expiresInDays },
        ];
        await replaceCompanyTrainingRequirements(companyId, next);
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [companyId, rows, load]
  );

  const update = useCallback(
    async (
      id: number,
      data: Partial<{ courseName: string; expiresInDays: number }>
    ) => {
      setError(null);
      try {
        const updated = await updateCompanyTrainingRequirement(id, data);
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update");
        throw e;
      }
    },
    []
  );

  const remove = useCallback(async (id: number) => {
    setError(null);
    try {
      await deleteCompanyTrainingRequirement(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
      throw e;
    }
  }, []);

  return { rows, loading, saving, error, refresh: load, add, update, remove };
}
