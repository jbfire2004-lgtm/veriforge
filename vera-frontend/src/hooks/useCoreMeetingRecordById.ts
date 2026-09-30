"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCoreMeetingRecord,
  type CoreMeetingRecordDto,
} from "@/src/api/core-meeting-record";
import { unknownToErrorMessage } from "@/lib/core";

export function useCoreMeetingRecordById(id?: number) {
  const [item, setItem] = useState<CoreMeetingRecordDto | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) {
      setItem(null);
      setLoading(false);
      setError("Missing meeting record id.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setItem(await getCoreMeetingRecord(id));
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

