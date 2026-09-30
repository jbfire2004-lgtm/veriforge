"use client";

import { useCallback, useEffect, useState } from "react";
import { usePmInspectionScope } from "@/hooks/usePmInspectionScope";
import {
  fetchPermitTypes,
  fetchPermits,
  type PermitTypeDefinition,
  type PmPermitRecord,
} from "@/lib/pm-permits";
import { apiLoadErrorMessage } from "@/lib/network-error-message";

export type PermitsTab = "active" | "pending" | "expired" | "templates" | "history";

export function usePmPermits(companyId: number, projectId: number, tab: PermitsTab) {
  const scope = usePmInspectionScope(companyId, projectId);
  const { session, tokenReady, authLoading, authenticated, sessionExpired } = scope;

  const [permits, setPermits] = useState<PmPermitRecord[]>([]);
  const [types, setTypes] = useState<PermitTypeDefinition[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    if (!tokenReady) return;
    setReady(false);
    setError(null);
    const ctx = { session };
    try {
      if (tab === "templates") {
        const res = await fetchPermitTypes(ctx);
        setTypes(res.types ?? []);
        setPermits([]);
      } else {
        const apiTab =
          tab === "pending" ? "pending" : tab === "active" ? "active" : tab;
        const res = await fetchPermits(projectId, companyId, apiTab, ctx);
        setPermits(res.permits ?? []);
      }
    } catch (e) {
      setError(apiLoadErrorMessage(e, "Could not load permits"));
    } finally {
      setReady(true);
    }
  }, [tab, projectId, companyId, session, tokenReady]);

  useEffect(() => {
    if (authLoading || sessionExpired) return;
    if (!authenticated || !tokenReady) return;
    void load();
  }, [authLoading, authenticated, tokenReady, sessionExpired, load]);

  return {
    ...scope,
    permits,
    types,
    error,
    ready,
    reload: load,
  };
}
