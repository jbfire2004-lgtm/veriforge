"use client";

import { useCallback, useState } from "react";
import type { IndustryEcosystemReport } from "@vera/industry-ecosystem";
import { orchestrateIndustryEcosystem } from "../api";

export function useIndustryEcosystem(companyId?: number) {
  const [report, setReport] = useState<IndustryEcosystemReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orchestrate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await orchestrateIndustryEcosystem(companyId);
      setReport(r);
      return r;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Industry ecosystem orchestration failed");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  return { report, loading, error, orchestrate };
}
