"use client";

import { useCallback, useEffect, useState } from "react";
import { getCoreActionItem, type CoreActionItemDto } from "@/src/api/core-action-items";
import { unknownToErrorMessage } from "@/lib/core";

export function useCoreActionItemById(id?: string) {
  const [item, setItem] = useState<CoreActionItemDto | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) {
      setItem(null);
      setLoading(false);
      setError("Missing action item id.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getCoreActionItem(id);
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

