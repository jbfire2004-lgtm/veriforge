import type { WorkerCredentialsResponse } from "./types";

export async function fetchWorkerCredentials(
  workerId: string,
  signal?: AbortSignal
): Promise<WorkerCredentialsResponse> {
  const response = await fetch(`/worker/${encodeURIComponent(workerId)}/credentials`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load credentials (${response.status})`);
  }

  return (await response.json()) as WorkerCredentialsResponse;
}
