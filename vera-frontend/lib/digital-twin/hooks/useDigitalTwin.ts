"use client";

import { useCallback, useEffect, useState } from "react";
import type { DigitalTwin, TwinDashboardBundle, TwinType } from "@vera/digital-twin";
import {
  fetchTwin,
  fetchTwinDashboard,
  fetchTwinTimeline,
  hydrateTwins,
} from "../api";

export function useTwinHydration(companyId?: number) {
  const [twins, setTwins] = useState<DigitalTwin[]>([]);
  const [loading, setLoading] = useState(false);

  const hydrate = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const list = await hydrateTwins(companyId);
      setTwins(list);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return { twins, loading, hydrate };
}

export function useTwin(type: TwinType, id: string, enabled = true) {
  const [twin, setTwin] = useState<DigitalTwin | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !id) return;
    setLoading(true);
    fetchTwin(type, id)
      .then(setTwin)
      .finally(() => setLoading(false));
  }, [type, id, enabled]);

  return { twin, loading };
}

export function useTwinTimeline(type: TwinType, id: string) {
  const [timeline, setTimeline] = useState<Awaited<ReturnType<typeof fetchTwinTimeline>>>([]);

  useEffect(() => {
    if (!id) return;
    void fetchTwinTimeline(type, id).then(setTimeline);
  }, [type, id]);

  return timeline;
}

export function useTwinDashboard() {
  const [dashboard, setDashboard] = useState<TwinDashboardBundle | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setDashboard(await fetchTwinDashboard());
    } finally {
      setLoading(false);
    }
  }, []);

  return { dashboard, loading, refresh };
}
