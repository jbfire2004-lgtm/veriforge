"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchWeatherSettings,
  updateWeatherSettings,
} from "@/lib/weather-alerts-api";
import { HubSurfaceCard } from "./HubSurfaceCard";

export function HubWeatherSettings() {
  const [loading, setLoading] = useState(true);
  const [severe, setSevere] = useState(true);
  const [wallet, setWallet] = useState(true);

  useEffect(() => {
    fetchWeatherSettings()
      .then((s) => {
        setSevere(s.weatherNotificationsEnabled);
        setWallet(s.weatherWalletDisplayEnabled);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async (patch: {
    weatherNotificationsEnabled?: boolean;
    weatherWalletDisplayEnabled?: boolean;
  }) => {
    try {
      const next = await updateWeatherSettings(patch);
      setSevere(next.weatherNotificationsEnabled);
      setWallet(next.weatherWalletDisplayEnabled);
    } catch {
      /* ignore */
    }
  }, []);

  if (loading) {
    return (
      <div className="h-40 animate-pulse rounded-2xl border border-[#2A2E33]/10 bg-slate-50" />
    );
  }

  return (
    <HubSurfaceCard accentBar="from-[#1e4a7a] to-[#2F85CC]" surface="from-[#dbeafe]/40 via-white to-white">
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#64748b]">
            Notifications
          </p>
          <h3 className="mt-1 text-base font-bold text-[#2A2E33]">Weather alert preferences</h3>
          <p className="mt-1 text-sm text-[#5a6b7c]">
            Choose how Vera delivers severe weather alerts and where they appear.
          </p>
        </div>
        <div className="space-y-3 text-sm text-[#4b5563]">
          <label className="flex items-center justify-between gap-4 rounded-xl border border-[#2A2E33]/8 bg-white/80 px-4 py-3">
            <span>Severe weather alerts (push, email, in-app)</span>
            <input
              type="checkbox"
              checked={severe}
              onChange={(e) => {
                const v = e.target.checked;
                setSevere(v);
                void save({ weatherNotificationsEnabled: v, showWeatherAlerts: v });
              }}
              className="h-4 w-4"
            />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-[#2A2E33]/8 bg-white/80 px-4 py-3">
            <span>Show weather alerts in Worker Wallet</span>
            <input
              type="checkbox"
              checked={wallet}
              onChange={(e) => {
                const v = e.target.checked;
                setWallet(v);
                void save({ weatherWalletDisplayEnabled: v });
              }}
              className="h-4 w-4"
            />
          </label>
        </div>
      </div>
    </HubSurfaceCard>
  );
}
