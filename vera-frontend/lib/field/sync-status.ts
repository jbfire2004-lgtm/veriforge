import type { SyncEngineStatus } from "./types";

/** Derive unified sync engine status from field mode counters. */
export function deriveSyncEngineStatus(input: {
  syncing: boolean;
  failedCount: number;
}): SyncEngineStatus {
  if (input.syncing) return "SYNCING";
  if (input.failedCount > 0) return "ERROR";
  return "IDLE";
}
