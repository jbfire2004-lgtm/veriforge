import type {
  ConflictRecord,
  ConflictResolutionMode,
  SyncActionType,
  SyncQueueItem,
} from "./types";

export type ConflictContext = {
  action: SyncQueueItem;
  serverState?: Record<string, unknown>;
};

export type ConflictResult =
  | { ok: true; proceed: boolean; mode: ConflictResolutionMode }
  | { ok: false; conflict: ConflictRecord };

function conflictId(): string {
  return `conflict_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Conflict resolution rules (§5).
 */
export function evaluateConflict(ctx: ConflictContext): ConflictResult {
  const { action, serverState } = ctx;
  const p = action.payload;

  switch (action.type) {
    case "project.assignWorker":
    case "project.assignEquipment": {
      const projectStatus = serverState?.projectStatus as string | undefined;
      if (projectStatus === "CLOSED" || projectStatus === "COMPLETED") {
        return block(
          action,
          "project.closed",
          "Project was closed while you were offline. Assignment was not applied.",
          "user"
        );
      }
      return allow("auto");
    }

    case "equipment.link":
    case "project.assignEquipment": {
      const lockedOut = serverState?.lockedOut === true;
      if (lockedOut && action.type === "project.assignEquipment") {
        return block(
          action,
          "equipment.lockout",
          "Equipment is locked out on the server. Offline assignment blocked.",
          "user"
        );
      }
      return allow("auto");
    }

    case "worker.link": {
      const workerRemoved = serverState?.workerActive === false;
      if (workerRemoved) {
        return block(
          action,
          "worker.removed",
          "Worker was removed while offline. Review before syncing.",
          "user"
        );
      }
      return allow("auto");
    }

    case "inspection.submit": {
      const serverLocked = serverState?.lockedOut === true;
      const clientPassed = p.passed === true;
      if (serverLocked && clientPassed) {
        return block(
          action,
          "inspection.lockout_merge",
          "Equipment already locked online. Inspection needs review.",
          "admin"
        );
      }
      return allow("auto");
    }

    case "training.upload": {
      const workerChanged = serverState?.workerId != null && serverState.workerId !== p.workerId;
      if (workerChanged) {
        return block(
          action,
          "training.worker_mismatch",
          "Worker record changed. Re-attach certificate before sync.",
          "user"
        );
      }
      return allow("auto");
    }

    case "safetyForm.submit": {
      const serverAt = serverState?.serverUpdatedAt as string | undefined;
      const clientAt = p.clientTimestamp as string | undefined;
      if (serverAt && clientAt && new Date(serverAt) > new Date(clientAt)) {
        return block(
          action,
          "safetyForm.server_newer",
          "This form was updated on the server while you were offline.",
          "user",
        );
      }
      return allow("auto");
    }

    case "safetyFormV2.submit": {
      const serverAt = serverState?.updatedAt as string | undefined;
      const clientAt = p.clientTimestamp as string | undefined;
      const serverVersion = serverState?.clientVersion as number | undefined;
      const localVersion = p.clientVersion as number | undefined;
      if (
        serverAt &&
        clientAt &&
        new Date(serverAt) > new Date(clientAt) &&
        serverVersion != null &&
        localVersion != null &&
        serverVersion > localVersion
      ) {
        return block(
          action,
          "safetyFormV2.server_newer",
          "This safety form was updated on the server while you were offline. Your local changes were preserved for review.",
          "user",
        );
      }
      return allow("auto");
    }

    default:
      return allow("auto");
  }
}

function allow(mode: ConflictResolutionMode): ConflictResult {
  return { ok: true, proceed: true, mode };
}

function block(
  action: SyncQueueItem,
  rule: string,
  message: string,
  resolution: ConflictResolutionMode
): ConflictResult {
  const conflict: ConflictRecord = {
    id: conflictId(),
    queueItemId: action.id,
    entityType: action.type,
    entityId: String(action.payload.entityId ?? action.id),
    rule,
    message,
    clientSnapshot: action.payload,
    resolution,
    resolved: false,
  };
  return { ok: false, conflict };
}

export function shouldAutoRetry(item: SyncQueueItem): boolean {
  return item.attempts < 5;
}

export function retryDelayMs(attempts: number): number {
  return Math.min(60_000, 2_000 * 2 ** attempts);
}
