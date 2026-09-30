"use client";

import { useCallback, useEffect, useState } from "react";
import { getCoreDailyLog, type CoreDailyLogDto } from "@/src/api/core-daily-log";
import { unknownToErrorMessage } from "@/lib/core";
import { useVeraAuthOrHook } from "@/contexts/VeraAuthContext";
import {
  isMissingAuthTokenError,
  missingAuthTokenMessage,
} from "@/lib/core/auth-token-errors";

export function useCoreDailyLogById(id?: number) {
  const { tokenReady, sessionExpired, sessionRefreshing, authLoading } =
    useVeraAuthOrHook();
  const [item, setItem] = useState<CoreDailyLogDto | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) {
      setItem(null);
      setLoading(false);
      setError("Missing daily log id.");
      return;
    }
    if (!tokenReady) {
      setItem(null);
      setLoading(authLoading || sessionRefreshing);
      setError(
        sessionExpired || (!authLoading && !sessionRefreshing)
          ? missingAuthTokenMessage("this daily log")
          : null,
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setItem(await getCoreDailyLog(id));
    } catch (e) {
      setError(
        isMissingAuthTokenError(e)
          ? missingAuthTokenMessage("this daily log")
          : unknownToErrorMessage(e),
      );
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [id, tokenReady, sessionExpired, sessionRefreshing, authLoading]);

  useEffect(() => {
    if (authLoading || sessionRefreshing) {
      setLoading(true);
      return;
    }
    void refetch();
  }, [refetch, authLoading, sessionRefreshing]);

  return { item, loading, error, refetch, tokenReady };
}
