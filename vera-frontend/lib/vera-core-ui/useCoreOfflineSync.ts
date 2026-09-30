"use client";

import * as React from "react";
import { useOptionalVeraCoreUI } from "./store";

type OfflineSyncState = {
  online: boolean;
  pendingBatches: number;
  lastSyncAt: string | null;
};

/**
 * Tracks browser online/offline state and drives Vera Core UI sync indicators.
 * Pair with field delta sync or wallet auto-sync on reconnect.
 */
export function useCoreOfflineSync(options?: {
  onReconnect?: () => void | Promise<void>;
  pollMs?: number;
}) {
  const coreUi = useOptionalVeraCoreUI();
  const failureStreakRef = React.useRef(0);
  const AUTO_RETRY_LIMIT = 3;
  const [state, setState] = React.useState<OfflineSyncState>({
    online: typeof navigator !== "undefined" ? navigator.onLine : true,
    pendingBatches: 0,
    lastSyncAt: null,
  });

  const sync = React.useCallback(async () => {
    if (!coreUi) return;
    coreUi.setSyncStatus("syncing");
    try {
      await options?.onReconnect?.();
      failureStreakRef.current = 0;
      coreUi.markSynced();
      setState((s) => ({ ...s, pendingBatches: 0, lastSyncAt: new Date().toISOString() }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error ?? "");
      // Token/session hydration races are transient; avoid noisy sync-error loops.
      if (message.includes("Missing auth token")) {
        coreUi.setSyncStatus("idle");
        return;
      }
      failureStreakRef.current += 1;
      coreUi.setSyncStatus("error");
    }
  }, [coreUi, options]);

  React.useEffect(() => {
    const goOnline = () => {
      setState((s) => ({ ...s, online: true }));
      coreUi?.setSyncStatus("syncing");
      void sync();
    };
    const goOffline = () => {
      setState((s) => ({ ...s, online: false }));
      coreUi?.setSyncStatus("offline");
    };

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [coreUi, sync]);

  React.useEffect(() => {
    const ms = options?.pollMs ?? 120_000;
    if (!state.online) return;
    const id = window.setInterval(() => {
      if (failureStreakRef.current >= AUTO_RETRY_LIMIT) return;
      void sync();
    }, ms);
    return () => window.clearInterval(id);
  }, [state.online, sync, options?.pollMs]);

  return {
    ...state,
    sync,
    queueBatch: () => setState((s) => ({ ...s, pendingBatches: s.pendingBatches + 1 })),
  };
}
