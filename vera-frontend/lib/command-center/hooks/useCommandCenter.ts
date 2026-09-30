"use client";

import { useCallback, useState } from "react";
import type { CommandCenterReport } from "@vera/command-center";
import { refreshCommandCenter } from "../api";

export function useCommandCenter(
  companyId?: number,
  projectId?: number,
  unionHallId?: number
) {
  const [report, setReport] = useState<CommandCenterReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const r = await refreshCommandCenter(companyId, projectId, unionHallId);
      setReport(r);
      return r;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Command center refresh failed");
    } finally {
      setLoading(false);
    }
  }, [companyId, projectId, unionHallId]);

  return { report, loading, error, refresh };
}
