"use client";

import { useCallback, useState } from "react";
import type { GlobalNetworkReport } from "@vera/global-network";
import { analyzeGlobalNetwork } from "../api";

export function useGlobalNetwork(companyId?: number) {
  const [report, setReport] = useState<GlobalNetworkReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await analyzeGlobalNetwork(companyId);
      setReport(r);
      return r;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Global network analysis failed");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  return { report, loading, error, analyze };
}
