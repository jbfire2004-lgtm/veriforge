"use client";

import * as React from "react";
import type { ComplianceState } from "./compliance";

export type SyncVisualStatus = "idle" | "syncing" | "synced" | "offline" | "error";

export type VeraCoreUIState = {
  syncStatus: SyncVisualStatus;
  lastSyncedAt: string | null;
  complianceFilter: ComplianceState | "all";
  linkedWorkerIds: number[];
};

type VeraCoreUIActions = {
  setSyncStatus: (status: SyncVisualStatus) => void;
  markSynced: (at?: string) => void;
  setComplianceFilter: (filter: ComplianceState | "all") => void;
  linkWorker: (workerId: number) => void;
  unlinkWorker: (workerId: number) => void;
  resetLinkedWorkers: () => void;
};

export type VeraCoreUIContextValue = VeraCoreUIState & VeraCoreUIActions;

const VeraCoreUIContext = React.createContext<VeraCoreUIContextValue | null>(null);

const initialState: VeraCoreUIState = {
  syncStatus: "idle",
  lastSyncedAt: null,
  complianceFilter: "all",
  linkedWorkerIds: [],
};

export function VeraCoreUIProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<VeraCoreUIState>(initialState);

  const value = React.useMemo<VeraCoreUIContextValue>(
    () => ({
      ...state,
      setSyncStatus: (syncStatus) => setState((s) => ({ ...s, syncStatus })),
      markSynced: (at) =>
        setState((s) => ({
          ...s,
          syncStatus: "synced",
          lastSyncedAt: at ?? new Date().toISOString(),
        })),
      setComplianceFilter: (complianceFilter) =>
        setState((s) => ({ ...s, complianceFilter })),
      linkWorker: (workerId) =>
        setState((s) =>
          s.linkedWorkerIds.includes(workerId)
            ? s
            : { ...s, linkedWorkerIds: [...s.linkedWorkerIds, workerId] },
        ),
      unlinkWorker: (workerId) =>
        setState((s) => ({
          ...s,
          linkedWorkerIds: s.linkedWorkerIds.filter((id) => id !== workerId),
        })),
      resetLinkedWorkers: () => setState((s) => ({ ...s, linkedWorkerIds: [] })),
    }),
    [state],
  );

  return (
    <VeraCoreUIContext.Provider value={value}>{children}</VeraCoreUIContext.Provider>
  );
}

export function useVeraCoreUI(): VeraCoreUIContextValue {
  const ctx = React.useContext(VeraCoreUIContext);
  if (!ctx) {
    throw new Error("useVeraCoreUI must be used within VeraCoreUIProvider");
  }
  return ctx;
}

export function useOptionalVeraCoreUI(): VeraCoreUIContextValue | null {
  return React.useContext(VeraCoreUIContext);
}
