"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listCoreSiteRisks,
  type CoreSiteRiskDto,
  type ListCoreSiteRisksParams,
} from "@/src/api/core-site-risk";
import { unknownToErrorMessage } from "@/lib/core";

export type UseCoreSiteRiskState = {
  items: CoreSiteRiskDto[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useCoreSiteRisk(
  params?: ListCoreSiteRisksParams
): UseCoreSiteRiskState {
  const [items, setItems] = useState<CoreSiteRiskDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listCoreSiteRisks(params);
      setItems(res.items);
      setTotal(res.total);
    } catch (e) {
      setError(unknownToErrorMessage(e));
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [
    params?.companyId,
    params?.siteId,
    params?.status,
    params?.category,
    params?.severity,
    params?.skip,
    params?.take,
  ]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { items, total, loading, error, refetch };
}
