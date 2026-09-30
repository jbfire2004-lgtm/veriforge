"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listCoreComplianceNotes,
  type CoreComplianceNoteDto,
  type ListCoreComplianceNotesParams,
} from "@/src/api/core-compliance-note";
import { unknownToErrorMessage } from "@/lib/core";

export type UseCoreComplianceNoteState = {
  items: CoreComplianceNoteDto[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useCoreComplianceNote(
  params?: ListCoreComplianceNotesParams
): UseCoreComplianceNoteState {
  const [items, setItems] = useState<CoreComplianceNoteDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listCoreComplianceNotes(params);
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
    params?.skip,
    params?.take,
  ]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { items, total, loading, error, refetch };
}
