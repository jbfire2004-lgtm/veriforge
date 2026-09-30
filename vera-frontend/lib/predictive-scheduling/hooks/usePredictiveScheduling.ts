"use client";

import { useCallback, useState } from "react";
import type { PredictiveSchedulingReport } from "@vera/predictive-scheduling";
import { optimizeScheduling } from "../api";

export function usePredictiveScheduling(
  companyId?: number,
  projectId?: number,
  unionHallId?: number
) {
  const [report, setReport] = useState<PredictiveSchedulingReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimize = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const r = await optimizeScheduling(companyId, projectId, unionHallId);
      setReport(r);
      return r;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scheduling optimization failed");
    } finally {
      setLoading(false);
    }
  }, [companyId, projectId, unionHallId]);

  return { report, loading, error, optimize };
}
