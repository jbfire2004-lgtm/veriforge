"use client";

import { useCallback, useEffect, useState } from "react";
import { getCoreSiteRisk, type CoreSiteRiskDto } from "@/src/api/core-site-risk";
import { unknownToErrorMessage } from "@/lib/core";

export function useCoreSiteRiskById(id?: number) {
  const [item, setItem] = useState<CoreSiteRiskDto | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) {
      setItem(null);
      setLoading(false);
      setError("Missing site risk id.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getCoreSiteRisk(id);
      setItem(res);
    } catch (e) {
      setError(unknownToErrorMessage(e));
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { item, loading, error, refetch };
}

