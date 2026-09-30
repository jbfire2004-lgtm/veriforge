"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DASHBOARD_REFRESH_INTERVAL_MS } from "@/lib/dashboard/widgets-api";

type DashboardRealtimeContextValue = {
  lastUpdated: Date | null;
  refresh: () => void;
};

const DashboardRealtimeContext = React.createContext<DashboardRealtimeContextValue | null>(
  null
);

export type DashboardRealtimeProviderProps = {
  children: React.ReactNode;
  /** Polling interval; set 0 to disable auto-refresh */
  intervalMs?: number;
};

/**
 * Soft real-time updates via router refresh (§6).
 * Revalidates server components on an interval without websockets.
 */
export function DashboardRealtimeProvider({
  children,
  intervalMs = DASHBOARD_REFRESH_INTERVAL_MS,
}: DashboardRealtimeProviderProps) {
  const router = useRouter();
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  const refresh = React.useCallback(() => {
    router.refresh();
    setLastUpdated(new Date());
  }, [router]);

  React.useEffect(() => {
    if (intervalMs <= 0) return;
    const id = window.setInterval(refresh, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, refresh]);

  React.useEffect(() => {
    setLastUpdated(new Date());
  }, []);

  return (
    <DashboardRealtimeContext.Provider value={{ lastUpdated, refresh }}>
      {children}
    </DashboardRealtimeContext.Provider>
  );
}

export function useDashboardRealtime() {
  const ctx = React.useContext(DashboardRealtimeContext);
  if (!ctx) {
    throw new Error("useDashboardRealtime must be used within DashboardRealtimeProvider");
  }
  return ctx;
}
