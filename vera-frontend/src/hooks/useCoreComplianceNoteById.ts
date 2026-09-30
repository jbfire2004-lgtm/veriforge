"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCoreComplianceNote,
  type CoreComplianceNoteDto,
} from "@/src/api/core-compliance-note";
import { unknownToErrorMessage } from "@/lib/core";

export function useCoreComplianceNoteById(id?: number) {
  const [item, setItem] = useState<CoreComplianceNoteDto | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) {
      setItem(null);
      setLoading(false);
      setError("Missing compliance note id.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getCoreComplianceNote(id);
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

