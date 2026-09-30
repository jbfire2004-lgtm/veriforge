"use client";

import { useCallback, useState } from "react";
import type { EnterpriseAutomationReport } from "@vera/enterprise-automation";
import { orchestrateEnterprise } from "../api";

export function useEnterpriseAutomation(
  companyId?: number,
  projectId?: number,
  unionHallId?: number
) {
  const [report, setReport] = useState<EnterpriseAutomationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orchestrate = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const r = await orchestrateEnterprise(companyId, projectId, unionHallId);
      setReport(r);
      return r;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enterprise automation failed");
    } finally {
      setLoading(false);
    }
  }, [companyId, projectId, unionHallId]);

  return { report, loading, error, orchestrate };
}
