"use client";

import { useCallback, useState } from "react";
import type { InterplanetaryReport } from "@vera/interplanetary";
import { operateInterplanetary } from "../api";

export function useInterplanetary(companyId?: number) {
  const [report, setReport] = useState<InterplanetaryReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const operate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await operateInterplanetary(companyId);
      setReport(r);
      return r;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Interplanetary operations failed");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  return { report, loading, error, operate };
}
