"use client";

import { useCallback, useEffect, useState } from "react";
import type { LocalCacheStore } from "@/lib/field/cache-store";
import {
  fetchWorkerWalletBundle,
  type WorkerWalletBundle,
} from "./wallet-api";

const AUTO_SYNC_MS = 60_000;

export type WorkerWalletSyncState = {
  bundle: WorkerWalletBundle | null;
  syncing: boolean;
  online: boolean;
  lastError: string | null;
  lastSyncedAt: string | null;
  refresh: () => Promise<void>;
};

/**
 * Pulls the worker-wallet offline bundle when online and caches it in field IndexedDB.
 */
export function useWorkerWalletAutoSync(
  workerId: number | null,
  cache?: LocalCacheStore | null,
): WorkerWalletSyncState {
  const [bundle, setBundle] = useState<WorkerWalletBundle | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (workerId == null || workerId <= 0) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setOnline(false);
      if (cache) {
        const cached = await cache.get<WorkerWalletBundle>(
          "workerWalletBundle",
          workerId,
        );
        if (cached?.data) setBundle(cached.data);
      }
      return;
    }

    setSyncing(true);
    setLastError(null);
    try {
      const live = await fetchWorkerWalletBundle(workerId);
      setBundle(live);
      setOnline(true);
      setLastSyncedAt(live.syncedAt);
      if (cache) {
        await cache.put("workerWalletBundle", workerId, live);
      }
    } catch (e) {
      setOnline(false);
      setLastError(
        e instanceof Error ? e.message : "Wallet sync failed — using cache if available",
      );
      if (cache) {
        const cached = await cache.get<WorkerWalletBundle>(
          "workerWalletBundle",
          workerId,
        );
        if (cached?.data) setBundle(cached.data);
      }
    } finally {
      setSyncing(false);
    }
  }, [workerId, cache]);

  useEffect(() => {
    if (workerId == null) return;
    void (async () => {
      if (cache) {
        const cached = await cache.get<WorkerWalletBundle>(
          "workerWalletBundle",
          workerId,
        );
        if (cached?.data) setBundle(cached.data);
      }
      await refresh();
    })();
  }, [workerId, cache, refresh]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onOnline = () => {
      setOnline(true);
      void refresh();
    };
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    const timer = setInterval(() => void refresh(), AUTO_SYNC_MS);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      clearInterval(timer);
    };
  }, [refresh]);

  return { bundle, syncing, online, lastError, lastSyncedAt, refresh };
}
