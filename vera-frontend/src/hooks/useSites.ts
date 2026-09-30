"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createSite,
  deleteSite,
  fetchSites,
  type SiteDto,
  type SitesPaginatedDto,
  updateSite,
} from "@/src/api/sites";

export interface UseSitesOptions {
  pageSize?: number;
  initialSearch?: string;
}

export interface UseSitesResult {
  data: SiteDto[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  search: string;
  setSearch: (v: string) => void;
  setPage: (p: number) => void;
  loading: boolean;
  mutating: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (input: {
    name: string;
    code?: string;
    region?: string;
    active?: boolean;
  }) => Promise<SiteDto>;
  update: (
    id: number,
    patch: Partial<{
      name: string;
      code: string | null;
      region: string | null;
      active: boolean;
    }>
  ) => Promise<SiteDto>;
  remove: (id: number) => Promise<void>;
}

export function useSites(options: UseSitesOptions = {}): UseSitesResult {
  const pageSize = options.pageSize ?? 20;
  const [search, setSearchState] = useState(options.initialSearch ?? "");
  const [page, setPage] = useState(1);
  const [payload, setPayload] = useState<SitesPaginatedDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSites({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
      });
      setPayload(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setSearch = useCallback((v: string) => {
    setSearchState(v);
    setPage(1);
  }, []);

  const create = useCallback(
    async (input: {
      name: string;
      code?: string;
      region?: string;
      active?: boolean;
    }) => {
      setMutating(true);
      setError(null);
      try {
        const row = await createSite(input);
        await refresh();
        return row;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        throw e;
      } finally {
        setMutating(false);
      }
    },
    [refresh]
  );

  const update = useCallback(
    async (
      id: number,
      patch: Partial<{
        name: string;
        code: string | null;
        region: string | null;
        active: boolean;
      }>
    ) => {
      setMutating(true);
      setError(null);
      try {
        const row = await updateSite(id, patch);
        await refresh();
        return row;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        throw e;
      } finally {
        setMutating(false);
      }
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: number) => {
      setMutating(true);
      setError(null);
      try {
        await deleteSite(id);
        await refresh();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        throw e;
      } finally {
        setMutating(false);
      }
    },
    [refresh]
  );

  return {
    data: payload?.data ?? [],
    total: payload?.total ?? 0,
    page,
    totalPages: payload?.totalPages ?? 1,
    pageSize,
    search,
    setSearch,
    setPage,
    loading,
    mutating,
    error,
    refresh,
    create,
    update,
    remove,
  };
}
