"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listCoreActionItems,
  type CoreActionItemDto,
  type ListCoreActionItemsParams,
} from "@/src/api/core-action-items";
import { unknownToErrorMessage } from "@/lib/core";

export type UseCoreActionItemsState = {
  items: CoreActionItemDto[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useCoreActionItems(
  params?: ListCoreActionItemsParams
): UseCoreActionItemsState {
  const [items, setItems] = useState<CoreActionItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listCoreActionItems(params);
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
    params?.coreMeetingRecordId,
    params?.coreDailyLogId,
    params?.status,
    params?.skip,
    params?.take,
  ]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { items, total, loading, error, refetch };
}
