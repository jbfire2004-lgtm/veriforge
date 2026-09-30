"use client";

import { useEffect, useState } from "react";
import { fetchWorkerCredentials } from "./api";
import { CredentialSection } from "./CredentialSection";
import type { WorkerCredentialsResponse } from "./types";

const EMPTY_DATA: WorkerCredentialsResponse = {
  trainingCredentials: [],
  workflowCredentials: [],
  equipmentCredentials: [],
};

export function BlockchainCredentialsTab({ workerId }: { workerId: string }) {
  const [data, setData] = useState<WorkerCredentialsResponse>(EMPTY_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setIsLoading(true);
    setError(null);

    void fetchWorkerCredentials(workerId, controller.signal)
      .then((response) => {
        if (!active) return;
        setData(response);
      })
      .catch((err: unknown) => {
        if (!active) return;
        const message = err instanceof Error ? err.message : "Unable to load blockchain credentials.";
        setError(message);
        setData(EMPTY_DATA);
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [workerId]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Loading blockchain credentials...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CredentialSection title="Training" credentials={data.trainingCredentials} />
      <CredentialSection title="Workflows" credentials={data.workflowCredentials} />
      <CredentialSection title="Equipment" credentials={data.equipmentCredentials} />
    </div>
  );
}
