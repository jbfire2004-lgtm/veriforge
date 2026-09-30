"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchTrainingRecordVerification,
  parseTrainingRecordVerificationOptionsFromSearchParams,
  type TrainingRecordVerificationResult,
} from "@/lib/verification-core";
import { unknownToErrorMessage } from "@/lib/core";

export type UseTrainingRecordVerificationState = {
  data: TrainingRecordVerificationResult | null;
  error: string | null;
  loading: boolean;
  refetch: () => Promise<void>;
};

/**
 * Load structured training verification for a record id + serialized URL query
 * (same keys as `GET /api/v1/core/verification/training/:id`).
 * Pass `useSearchParams().toString()` from the client.
 */
export function useTrainingRecordVerification(
  recordId: number,
  /** Serialized query string from `useSearchParams().toString()` (stable across renders). */
  searchSerialized: string
): UseTrainingRecordVerificationState {
  const [data, setData] = useState<TrainingRecordVerificationResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setError(null);
    setLoading(true);
    if (!Number.isFinite(recordId) || recordId < 1) {
      setData(null);
      setError("Invalid training record id.");
      setLoading(false);
      return;
    }

    const { options, error: parseError } =
      parseTrainingRecordVerificationOptionsFromSearchParams(
        new URLSearchParams(searchSerialized)
      );
    if (parseError != null) {
      setData(null);
      setError(parseError);
      setLoading(false);
      return;
    }

    try {
      const json = await fetchTrainingRecordVerification(recordId, options);
      setData(json);
    } catch (e: unknown) {
      setData(null);
      setError(unknownToErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [recordId, searchSerialized]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, error, loading, refetch };
}
