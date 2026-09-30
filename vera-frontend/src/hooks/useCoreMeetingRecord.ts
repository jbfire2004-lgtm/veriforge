"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCoreMeetingRecordSummary,
  listCoreMeetingRecords,
  type CoreMeetingRecordDto,
  type CoreMeetingRecordSummary,
  type CoreMeetingRecordSummaryParams,
  type ListCoreMeetingRecordsParams,
} from "@/src/api/core-meeting-record";
import { unknownToErrorMessage } from "@/lib/core";

export type UseCoreMeetingRecordState = {
  items: CoreMeetingRecordDto[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * List core meeting records with optional filters; exposes loading / error for tables.
 */
export function useCoreMeetingRecord(
  params?: ListCoreMeetingRecordsParams
): UseCoreMeetingRecordState {
  const [items, setItems] = useState<CoreMeetingRecordDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listCoreMeetingRecords(params);
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
    params?.meetingType,
    params?.skip,
    params?.take,
  ]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { items, total, loading, error, refetch };
}

export type UseCoreMeetingRecordSummaryState = {
  summary: CoreMeetingRecordSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * Fetch GET /core-meeting-records/summary with optional filters (company, site, heldAt range).
 */
export function useCoreMeetingRecordSummary(
  params?: CoreMeetingRecordSummaryParams
): UseCoreMeetingRecordSummaryState {
  const [summary, setSummary] = useState<CoreMeetingRecordSummary | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCoreMeetingRecordSummary(params);
      setSummary(res);
    } catch (e) {
      setError(unknownToErrorMessage(e));
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [params?.companyId, params?.siteId, params?.heldFrom, params?.heldTo]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { summary, loading, error, refetch };
}
