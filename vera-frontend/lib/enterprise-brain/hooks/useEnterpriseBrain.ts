"use client";

import { useCallback, useState } from "react";
import type { EnterpriseBrainReport } from "@vera/enterprise-brain";
import { thinkEnterpriseBrain } from "../api";

export function useEnterpriseBrain(
  companyId?: number,
  projectId?: number,
  unionHallId?: number
) {
  const [report, setReport] = useState<EnterpriseBrainReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const think = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const r = await thinkEnterpriseBrain(companyId, projectId, unionHallId);
      setReport(r);
      return r;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enterprise brain failed");
    } finally {
      setLoading(false);
    }
  }, [companyId, projectId, unionHallId]);

  return { report, loading, error, think };
}
