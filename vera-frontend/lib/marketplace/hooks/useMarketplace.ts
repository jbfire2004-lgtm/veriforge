"use client";

import { useCallback, useState } from "react";
import type { MarketplaceReport } from "@vera/marketplace";
import { runMarketplace } from "../api";

export function useMarketplace(companyId?: number) {
  const [report, setReport] = useState<MarketplaceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await runMarketplace(companyId);
      setReport(r);
      return r;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Marketplace run failed");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  return { report, loading, error, run };
}
