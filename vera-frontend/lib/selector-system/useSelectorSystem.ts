"use client";

import { useCallback, useEffect, useState } from "react";
import type { DashboardContent, SelectorState } from "./types";
import { DEFAULT_SELECTOR_STATE } from "./catalog";

/**
 * Client hook — auto-updates dashboard content whenever selector state changes.
 */
export function useSelectorSystem(
  initial: Partial<SelectorState> = DEFAULT_SELECTOR_STATE,
) {
  const [selectors, setSelectors] = useState<Partial<SelectorState>>(initial);
  const [dashboard, setDashboard] = useState<DashboardContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (next?: Partial<SelectorState>) => {
    setLoading(true);
    setError(null);
    const state = next ?? selectors;
    try {
      const q = new URLSearchParams();
      for (const [k, v] of Object.entries(state)) {
        if (v != null && v !== "") q.set(k, String(v));
      }
      const res = await fetch(`/api/v1/selector-system?${q}`);
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as DashboardContent;
      setDashboard(data);
      setSelectors(data.selectors);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [selectors]);

  useEffect(() => {
    void refresh(initial);
    // mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback(
    (patch: Partial<SelectorState>) => {
      const next = { ...selectors, ...patch };
      // Entity type change: clear subtype so server sanitizes to plane-safe default
      if (patch.entityType && patch.entityType !== selectors.entityType) {
        delete (next as { subtype?: string }).subtype;
      }
      setSelectors(next);
      void refresh(next);
    },
    [selectors, refresh],
  );

  return {
    selectors: dashboard?.selectors ?? (selectors as SelectorState),
    dashboard,
    filter: dashboard?.filter ?? null,
    loading,
    error,
    update,
    refresh,
  };
}
