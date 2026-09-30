"use client";

import { useCallback, useState } from "react";
import type { AutonomousSafetyReport } from "@vera/autonomous-safety";
import { analyzeSafety } from "../api";

export function useAutonomousSafety(companyId?: number, projectId?: number) {
  const [report, setReport] = useState<AutonomousSafetyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const r = await analyzeSafety(companyId, projectId);
      setReport(r);
      return r;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Safety analysis failed");
    } finally {
      setLoading(false);
    }
  }, [companyId, projectId]);

  return { report, loading, error, analyze };
}
