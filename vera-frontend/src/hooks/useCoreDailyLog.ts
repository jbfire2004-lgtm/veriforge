"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCoreDailyLogSummary,
  listCoreDailyLogs,
  type CoreDailyLogDto,
  type CoreDailyLogSummary,
  type CoreDailyLogSummaryParams,
  type ListCoreDailyLogsParams,
} from "@/src/api/core-daily-log";
import { unknownToErrorMessage } from "@/lib/core";
import { useVeraAuthOrHook } from "@/contexts/VeraAuthContext";
import {
  isMissingAuthTokenError,
  missingAuthTokenMessage,
} from "@/lib/core/auth-token-errors";

export type UseCoreDailyLogState = {
  items: CoreDailyLogDto[];
  total: number;
  loading: boolean;
  error: string | null;
  tokenReady: boolean;
  refetch: () => Promise<void>;
};

export function useCoreDailyLog(
  params?: ListCoreDailyLogsParams,
): UseCoreDailyLogState {
  const { tokenReady, sessionExpired, sessionRefreshing, authLoading } =
    useVeraAuthOrHook();
  const [items, setItems] = useState<CoreDailyLogDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!tokenReady) {
      setLoading(true);
      setError(
        sessionExpired
          ? missingAuthTokenMessage("daily logs")
          : authLoading || sessionRefreshing
            ? null
            : missingAuthTokenMessage("daily logs"),
      );
      if (sessionExpired || (!authLoading && !sessionRefreshing)) {
        setLoading(false);
      }
      setItems([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await listCoreDailyLogs(params);
      setItems(res.items);
      setTotal(res.total);
    } catch (e) {
      if (isMissingAuthTokenError(e)) {
        setError(missingAuthTokenMessage("daily logs"));
      } else {
        setError(unknownToErrorMessage(e));
      }
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [
    tokenReady,
    sessionExpired,
    sessionRefreshing,
    authLoading,
    params?.companyId,
    params?.siteId,
    params?.shift,
    params?.skip,
    params?.take,
  ]);

  useEffect(() => {
    if (authLoading || sessionRefreshing) {
      setLoading(true);
      return;
    }
    void refetch();
  }, [refetch, authLoading, sessionRefreshing]);

  return { items, total, loading, error, tokenReady, refetch };
}

export type UseCoreDailyLogSummaryState = {
  summary: CoreDailyLogSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * GET /api/v1/core-daily-logs/summary — counts by shift with optional company, site, logDate range.
 */
export function useCoreDailyLogSummary(
  params?: CoreDailyLogSummaryParams,
): UseCoreDailyLogSummaryState {
  const { tokenReady, sessionExpired, sessionRefreshing, authLoading } =
    useVeraAuthOrHook();
  const [summary, setSummary] = useState<CoreDailyLogSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!tokenReady) {
      setLoading(!(sessionExpired || (!authLoading && !sessionRefreshing)));
      setError(
        sessionExpired || (!authLoading && !sessionRefreshing)
          ? missingAuthTokenMessage("daily log summary")
          : null,
      );
      setSummary(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getCoreDailyLogSummary(params);
      setSummary(res);
    } catch (e) {
      setError(
        isMissingAuthTokenError(e)
          ? missingAuthTokenMessage("daily log summary")
          : unknownToErrorMessage(e),
      );
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [
    tokenReady,
    sessionExpired,
    sessionRefreshing,
    authLoading,
    params?.companyId,
    params?.siteId,
    params?.logDateFrom,
    params?.logDateTo,
  ]);

  useEffect(() => {
    if (authLoading || sessionRefreshing) {
      setLoading(true);
      return;
    }
    void refetch();
  }, [refetch, authLoading, sessionRefreshing]);

  return { summary, loading, error, refetch };
}
