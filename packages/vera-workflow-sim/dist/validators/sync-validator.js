"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncValidator = void 0;
class SyncValidator {
    validateOfflineTransition(event, ctx) {
        const issues = [];
        const needsOffline = event.type.includes("offline") || event.type.startsWith("sync.");
        if (needsOffline && !ctx.offline && event.type.includes("offline")) {
            issues.push({
                code: "OFFLINE_MODE_REQUIRED",
                message: `Event ${event.type} requires offline mode in context`,
                severity: "error",
                validator: "SyncValidator",
            });
        }
        if (ctx.offline && ctx.clientVersion != null && ctx.serverVersion != null) {
            if (ctx.clientVersion < ctx.serverVersion) {
                issues.push({
                    code: "VERSION_STALE",
                    message: `Client version ${ctx.clientVersion} behind server ${ctx.serverVersion}`,
                    severity: "warn",
                    validator: "SyncValidator",
                });
            }
        }
        return issues;
    }
    validateQueueProcessing(events) {
        const syncEvents = events.filter((e) => e.type.startsWith("sync."));
        if (syncEvents.length === 0)
            return [];
        const ordered = syncEvents.every((e, i) => i === 0 || (e.at ?? "") >= (syncEvents[i - 1]?.at ?? ""));
        if (!ordered) {
            return [
                {
                    code: "SYNC_ORDER_VIOLATION",
                    message: "Sync queue events are not in chronological order",
                    severity: "warn",
                    validator: "SyncValidator",
                },
            ];
        }
        return [];
    }
    validateDelta(ctx) {
        if (!ctx.offline)
            return [];
        if (ctx.clientVersion === undefined) {
            return [
                {
                    code: "VERSION_MISSING",
                    message: "Offline sync requires clientVersion for delta updates",
                    severity: "warn",
                    validator: "SyncValidator",
                },
            ];
        }
        return [];
    }
}
exports.SyncValidator = SyncValidator;
//# sourceMappingURL=sync-validator.js.map