"use client";

import { useCallback, useState } from "react";
import type { CivilizationReport } from "@vera/civilization";
import { governCivilization } from "../api";

export function useCivilization(companyId?: number) {
  const [report, setReport] = useState<CivilizationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const govern = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await governCivilization(companyId);
      setReport(r);
      return r;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Civilization governance failed");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  return { report, loading, error, govern };
}
