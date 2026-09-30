"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "next-auth";
import {
  fetchWorkerTrainingFromCore,
  type WorkerTrainingHydration,
} from "@/lib/worker-training";
import { apiLoadErrorMessage } from "@/lib/network-error-message";

type Options = {
  workerId?: number | null;
  projectId?: number;
  requiredTraining?: string[];
  roleType?: string;
  session?: Session | null;
  tokenReady?: boolean;
  enabled?: boolean;
};

export function useWorkerTrainingHydration({
  workerId,
  projectId,
  requiredTraining,
  roleType,
  session,
  tokenReady = true,
  enabled = true,
}: Options) {
  const [data, setData] = useState<WorkerTrainingHydration | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled || !tokenReady || !workerId) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const row = await fetchWorkerTrainingFromCore(workerId, {
        projectId,
        requiredTraining,
        roleType,
        session,
      });
      setData(row);
    } catch (e) {
      setError(apiLoadErrorMessage(e, "Could not load worker training from Core"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [
    enabled,
    tokenReady,
    workerId,
    projectId,
    requiredTraining?.join(","),
    roleType,
    session?.accessToken,
  ]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}
