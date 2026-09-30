"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  clearFieldCryptoSession,
  ensureFieldCryptoKey,
  LocalCacheStore,
  preloadFieldCache,
  subscribeConnectivity,
  subscribeForeground,
  SyncEngine,
  SyncQueue,
  registerOfflineServiceWorker,
  requestBackgroundSync,
  getOfflineDeviceId,
  setOfflineScope,
  deriveSyncEngineStatus,
  type FieldModeState,
  type SyncEngineStatus,
} from "@/lib/field";

type FieldModeContextValue = FieldModeState & {
  cache: LocalCacheStore | null;
  queue: SyncQueue;
  syncEngine: SyncEngine;
  fieldModeActive: boolean;
  setFieldModeManual: (enabled: boolean | null) => void;
  syncNow: () => Promise<void>;
  preload: (companyId?: number, projectId?: number, workerId?: number) => Promise<void>;
  ready: boolean;
};

const FieldModeContext = React.createContext<FieldModeContextValue | null>(null);

const MANUAL_KEY = "vera:field:manual";

export function FieldModeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [isOnline, setIsOnline] = React.useState(true);
  const [cache, setCache] = React.useState<LocalCacheStore | null>(null);
  const [ready, setReady] = React.useState(false);
  const [pendingCount, setPendingCount] = React.useState(0);
  const [failedCount, setFailedCount] = React.useState(0);
  const [syncing, setSyncing] = React.useState(false);
  const [lastSyncAt, setLastSyncAt] = React.useState<string | null>(null);
  const [lastSyncError, setLastSyncError] = React.useState<string | null>(null);
  const [fieldModeManual, setFieldModeManualState] = React.useState<boolean | null>(null);

  const queueRef = React.useRef(new SyncQueue());
  const syncEngineRef = React.useRef(
    new SyncEngine({
      onStart: () => {
        setSyncing(true);
        setLastSyncError(null);
      },
      onComplete: (synced, failed) => {
        setSyncing(false);
        if (synced > 0 || failed === 0) setLastSyncAt(new Date().toISOString());
        if (failed > 0) {
          setLastSyncError(`${failed} item(s) failed to sync`);
        } else {
          setLastSyncError(null);
        }
        void refreshCounts();
      },
    })
  );

  const refreshCounts = React.useCallback(async () => {
    const q = queueRef.current;
    setPendingCount(await q.pendingCount());
    setFailedCount(await q.failedCount());
  }, []);

  React.useEffect(() => {
    const stored = localStorage.getItem(MANUAL_KEY);
    if (stored === "on") setFieldModeManualState(true);
    if (stored === "off") setFieldModeManualState(false);
  }, []);

  React.useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    return subscribeConnectivity(
      () => {
        setIsOnline(true);
        void syncEngineRef.current.syncAll("connectivity", cache);
      },
      () => setIsOnline(false),
    );
  }, [cache]);

  React.useEffect(() => {
    return subscribeForeground(() => {
      if (navigator.onLine) void syncEngineRef.current.syncAll("foreground", cache);
    });
  }, [cache]);

  React.useEffect(() => {
    if (cache && ready) {
      syncEngineRef.current.startBackgroundSync(cache);
      return () => syncEngineRef.current.stopBackgroundSync();
    }
  }, [cache, ready]);

  React.useEffect(() => {
    registerOfflineServiceWorker();

    function onSwMessage(event: MessageEvent) {
      if (event.data?.type === "VERA_OFFLINE_SYNC" && navigator.onLine) {
        void syncEngineRef.current.syncAll("connectivity", cache);
      }
    }

    navigator.serviceWorker?.addEventListener("message", onSwMessage);
    return () => navigator.serviceWorker?.removeEventListener("message", onSwMessage);
  }, [cache]);

  React.useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!session?.user) {
        setCache(null);
        setReady(true);
        return;
      }

      const secret =
        session.user.email ?? session.user.name ?? "vera-field-session";

      try {
        const key = await ensureFieldCryptoKey(String(secret));
        const store = await LocalCacheStore.create(key);
        if (!cancelled) {
          setCache(store);
          setReady(true);
          await refreshCounts();
        }
      } catch {
        if (!cancelled) setReady(true);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [session, refreshCounts]);

  React.useEffect(() => {
    if (!session?.user) clearFieldCryptoSession();
  }, [session]);

  const fieldModeActive =
    fieldModeManual === true || (fieldModeManual === null && !isOnline);

  const setFieldModeManual = React.useCallback((enabled: boolean | null) => {
    setFieldModeManualState(enabled);
    if (enabled === true) localStorage.setItem(MANUAL_KEY, "on");
    else if (enabled === false) localStorage.setItem(MANUAL_KEY, "off");
    else localStorage.removeItem(MANUAL_KEY);
  }, []);

  const syncNow = React.useCallback(async () => {
    requestBackgroundSync();
    await syncEngineRef.current.syncAll("manual", cache);
    await refreshCounts();
  }, [refreshCounts, cache]);

  const preload = React.useCallback(
    async (companyId?: number, projectId?: number, workerId?: number) => {
      if (!cache) return;
      if (companyId != null) setOfflineScope({ companyId, projectId });
      await preloadFieldCache(cache, { companyId, projectId, workerId });
    },
    [cache],
  );

  const syncStatus: SyncEngineStatus = deriveSyncEngineStatus({
    syncing,
    failedCount,
  });

  const value: FieldModeContextValue = {
    isOnline,
    fieldModeEnabled: fieldModeActive,
    fieldModeManual,
    lastSyncAt,
    pendingCount,
    failedCount,
    syncing,
    syncStatus,
    lastSyncError,
    cache,
    queue: queueRef.current,
    syncEngine: syncEngineRef.current,
    fieldModeActive,
    setFieldModeManual,
    syncNow,
    preload,
    ready,
  };

  return (
    <FieldModeContext.Provider value={value}>{children}</FieldModeContext.Provider>
  );
}

export function useFieldMode(): FieldModeContextValue {
  const ctx = React.useContext(FieldModeContext);
  if (!ctx) {
    throw new Error("useFieldMode must be used within FieldModeProvider");
  }
  return ctx;
}

/** Safe for PM forms when field provider is absent. */
export function useOptionalFieldMode(): FieldModeContextValue | null {
  return React.useContext(FieldModeContext);
}
