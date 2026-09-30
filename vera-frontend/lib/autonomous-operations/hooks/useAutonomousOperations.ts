"use client";

import { useCallback, useState } from "react";
import type { AutonomousOperationsReport } from "@vera/autonomous-operations";
import { runAutonomousOperations } from "../api";

export function useAutonomousOperations(
  companyId?: number,
  projectId?: number,
  unionHallId?: number
) {
  const [report, setReport] = useState<AutonomousOperationsReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const r = await runAutonomousOperations(companyId, projectId, unionHallId);
      setReport(r);
      return r;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Autonomous operations failed");
    } finally {
      setLoading(false);
    }
  }, [companyId, projectId, unionHallId]);

  return { report, loading, error, run };
}
