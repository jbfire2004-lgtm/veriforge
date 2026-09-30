import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { fetchWalletBundle, loadCachedBundle, type WalletBundle } from "../api/workerWallet";

const AUTO_SYNC_MS = 60_000;

export function useOfflineSync(workerId: number) {
  const [bundle, setBundle] = useState<WalletBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLastError(null);
    try {
      const live = await fetchWalletBundle(workerId);
      setBundle(live);
      setOnline(true);
    } catch (e) {
      const cached = await loadCachedBundle();
      setBundle(cached);
      setOnline(false);
      setLastError(e instanceof Error ? e.message : "Sync failed — showing cached wallet");
    } finally {
      setLoading(false);
    }
  }, [workerId]);

  useEffect(() => {
    void loadCachedBundle().then((c) => {
      if (c) setBundle(c);
      void refresh();
    });
  }, [refresh]);

  useEffect(() => {
    const timer = setInterval(() => void refresh(), AUTO_SYNC_MS);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [refresh]);

  return { bundle, loading, online, lastError, refresh };
}
