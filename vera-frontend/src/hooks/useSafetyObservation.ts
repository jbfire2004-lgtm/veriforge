"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listSafetyObservations,
  type ListSafetyObservationsParams,
  type SafetyObservationDto,
} from "@/src/api/safety-observation";
import { unknownToErrorMessage } from "@/lib/core";

export type UseSafetyObservationState = {
  items: SafetyObservationDto[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/** List + refetch for safety observations (filters via `params`). */
export function useSafetyObservation(
  params?: ListSafetyObservationsParams
): UseSafetyObservationState {
  const [items, setItems] = useState<SafetyObservationDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listSafetyObservations(params);
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
    params?.severity,
    params?.skip,
    params?.take,
  ]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { items, total, loading, error, refetch };
}
