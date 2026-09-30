"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createSiteContact,
  deleteSiteContact,
  fetchSiteContacts,
  updateSiteContact,
} from "@/src/api/site-contacts";
import type { SiteContactDto, SiteContactsPaginatedDto } from "@/src/types/site-contact";

export interface UseSiteContactsOptions {
  pageSize?: number;
  siteId?: number;
  initialSearch?: string;
}

export function useSiteContacts(options: UseSiteContactsOptions = {}) {
  const pageSize = options.pageSize ?? 20;
  const [siteId, setSiteId] = useState<number | undefined>(options.siteId);
  const [search, setSearchState] = useState(options.initialSearch ?? "");
  const [page, setPage] = useState(1);
  const [payload, setPayload] = useState<SiteContactsPaginatedDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSiteContacts({
        page,
        limit: pageSize,
        siteId,
        search: search.trim() || undefined,
      });
      setPayload(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, siteId, search]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setSearch = useCallback((v: string) => {
    setSearchState(v);
    setPage(1);
  }, []);

  const create = useCallback(
    async (input: {
      siteId: number;
      fullName: string;
      email?: string;
      phone?: string;
      role?: string;
      isPrimary?: boolean;
    }) => {
      setMutating(true);
      setError(null);
      try {
        const row = await createSiteContact(input);
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
    async (id: number, patch: Parameters<typeof updateSiteContact>[1]) => {
      setMutating(true);
      setError(null);
      try {
        const row = await updateSiteContact(id, patch);
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
        await deleteSiteContact(id);
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
    data: payload?.data ?? ([] as SiteContactDto[]),
    total: payload?.total ?? 0,
    page,
    totalPages: payload?.totalPages ?? 1,
    pageSize,
    siteId,
    setSiteId: (id: number | undefined) => {
      setSiteId(id);
      setPage(1);
    },
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
