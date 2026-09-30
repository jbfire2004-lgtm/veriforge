"use client";

import { useCallback, useEffect, useState } from "react";
import type { IntelligenceBundle, NlpResponse } from "@vera/intelligence";
import { askVera, fetchIntelligenceBundle, type IntelligenceQuery } from "../api";

export function useIntelligenceBundle(query: IntelligenceQuery, enabled = true) {
  const [bundle, setBundle] = useState<IntelligenceBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIntelligenceBundle(query);
      setBundle(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load intelligence");
    } finally {
      setLoading(false);
    }
  }, [enabled, query.companyId, query.projectId, query.workerId, query.equipmentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { bundle, loading, error, refresh };
}

export function useAskVera(companyId?: number) {
  const [answer, setAnswer] = useState<NlpResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = useCallback(
    async (question: string) => {
      setLoading(true);
      try {
        const res = await askVera(question, companyId);
        setAnswer(res);
        return res;
      } finally {
        setLoading(false);
      }
    },
    [companyId]
  );

  return { answer, loading, ask };
}
