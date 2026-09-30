"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getSafetyObservation,
  type SafetyObservationDto,
} from "@/src/api/safety-observation";
import { unknownToErrorMessage } from "@/lib/core";

export function useSafetyObservationById(id?: number) {
  const [item, setItem] = useState<SafetyObservationDto | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) {
      setItem(null);
      setLoading(false);
      setError("Missing safety observation id.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getSafetyObservation(id);
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

