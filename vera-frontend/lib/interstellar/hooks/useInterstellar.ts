"use client";

import { useCallback, useState } from "react";
import type { InterstellarReport } from "@vera/interstellar";
import { expandInterstellar } from "../api";

export function useInterstellar(companyId?: number) {
  const [report, setReport] = useState<InterstellarReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expand = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await expandInterstellar(companyId);
      setReport(r);
      return r;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Interstellar expansion failed");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  return { report, loading, error, expand };
}
