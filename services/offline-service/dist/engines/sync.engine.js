"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncEngine = void 0;
const crypto_1 = require("crypto");
const client_1 = require("@prisma/client");
const offline_repository_1 = require("../models/offline.repository");
const validation_engine_1 = require("./validation.engine");
const conflict_resolution_engine_1 = require("./conflict-resolution.engine");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
function recordIdFor(action) {
    return (action.recordId ??
        String(action.payload.clientSyncId ?? action.payload.id ?? (0, crypto_1.randomUUID)()));
}
async function applyToModule(moduleType, recordId, payload, companyId) {
    if (!env_1.env.moduleApplyUrl) {
        return { ok: true, serverValue: payload };
    }
    try {
        const res = await fetch(env_1.env.moduleApplyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ moduleType, recordId, payload, companyId }),
            signal: AbortSignal.timeout(15_000),
        });
        const body = (await res.json());
        if (!res.ok) {
            return { ok: false, error: body.error ?? `Module apply failed (${res.status})` };
        }
        return { ok: true, serverValue: body.serverValue ?? payload };
    }
    catch (err) {
        return {
            ok: false,
            error: err instanceof Error ? err.message : 'Module apply unreachable',
        };
    }
}
exports.syncEngine = {
    async processAction(input) {
        const { deviceId, companyId, action } = input;
        const moduleType = action.type;
        const recordId = recordIdFor(action);
        const validationErrors = await validation_engine_1.validationEngine.validateWithHook(moduleType, action.payload);
        if (validationErrors.length > 0) {
            await offline_repository_1.offlineRepository.upsertCache({
                deviceId,
                companyId,
                moduleType,
                recordId,
                payload: action.payload,
                lastModified: action.lastModified ? new Date(action.lastModified) : new Date(),
                syncStatus: client_1.OfflineSyncStatus.conflict,
                clientVersion: action.clientVersion,
                errorMessage: validationErrors.join('; '),
            });
            return {
                type: moduleType,
                recordId,
                ok: false,
                workflowState: 'conflict',
                error: validationErrors.join('; '),
            };
        }
        const existing = await offline_repository_1.offlineRepository.findCache(deviceId, moduleType, recordId);
        if (existing &&
            action.clientVersion != null &&
            existing.clientVersion != null &&
            action.clientVersion < existing.clientVersion) {
            const conflict = await offline_repository_1.offlineRepository.createConflict({
                deviceId,
                companyId,
                moduleType,
                recordId,
                localValue: action.payload,
                serverValue: existing.payload ?? {},
            });
            await offline_repository_1.offlineRepository.upsertCache({
                deviceId,
                companyId,
                moduleType,
                recordId,
                payload: action.payload,
                lastModified: new Date(),
                syncStatus: client_1.OfflineSyncStatus.conflict,
                clientVersion: action.clientVersion,
                errorMessage: 'Version conflict with server cache',
            });
            return {
                type: moduleType,
                recordId,
                ok: false,
                workflowState: 'conflict',
                conflictId: conflict.id,
                error: 'Version conflict with server cache',
            };
        }
        await offline_repository_1.offlineRepository.upsertCache({
            deviceId,
            companyId,
            moduleType,
            recordId,
            payload: action.payload,
            lastModified: action.lastModified ? new Date(action.lastModified) : new Date(),
            syncStatus: client_1.OfflineSyncStatus.syncing,
            clientVersion: action.clientVersion,
        });
        const apply = await applyToModule(moduleType, recordId, action.payload, companyId);
        if (!apply.ok) {
            const isConflict = conflict_resolution_engine_1.conflictResolutionEngine.isConflictError(apply.error);
            if (isConflict) {
                const conflict = await offline_repository_1.offlineRepository.createConflict({
                    deviceId,
                    companyId,
                    moduleType,
                    recordId,
                    localValue: action.payload,
                    serverValue: existing
                        ? existing.payload
                        : {},
                });
                await offline_repository_1.offlineRepository.upsertCache({
                    deviceId,
                    companyId,
                    moduleType,
                    recordId,
                    payload: action.payload,
                    lastModified: new Date(),
                    syncStatus: client_1.OfflineSyncStatus.conflict,
                    clientVersion: action.clientVersion,
                    errorMessage: apply.error,
                });
                return {
                    type: moduleType,
                    recordId,
                    ok: false,
                    workflowState: 'conflict',
                    conflictId: conflict.id,
                    error: apply.error,
                };
            }
            const retryable = env_1.env.moduleApplyUrl &&
                /unreachable|timeout|network|ECONNREFUSED/i.test(apply.error ?? '');
            await offline_repository_1.offlineRepository.upsertCache({
                deviceId,
                companyId,
                moduleType,
                recordId,
                payload: action.payload,
                lastModified: new Date(),
                syncStatus: retryable ? client_1.OfflineSyncStatus.pending_sync : client_1.OfflineSyncStatus.failed,
                clientVersion: action.clientVersion,
                errorMessage: apply.error,
            });
            return {
                type: moduleType,
                recordId,
                ok: false,
                workflowState: retryable ? 'pending_sync' : 'failed',
                error: apply.error,
            };
        }
        await offline_repository_1.offlineRepository.upsertCache({
            deviceId,
            companyId,
            moduleType,
            recordId,
            payload: apply.serverValue ?? action.payload,
            lastModified: new Date(),
            syncStatus: client_1.OfflineSyncStatus.synced,
            clientVersion: action.clientVersion,
        });
        return { type: moduleType, recordId, ok: true, workflowState: 'synced' };
    },
    async processPendingBatch(limit) {
        const pending = await offline_repository_1.offlineRepository.listPendingCache(limit);
        let processed = 0;
        let synced = 0;
        let failed = 0;
        for (const row of pending) {
            processed++;
            const result = await this.processAction({
                deviceId: row.deviceId,
                companyId: row.companyId,
                userId: 'system-worker',
                action: {
                    type: row.moduleType,
                    recordId: row.recordId,
                    payload: row.payload,
                    clientVersion: row.clientVersion ?? undefined,
                },
            });
            if (result.ok)
                synced++;
            else
                failed++;
        }
        if (processed > 0) {
            logger_1.logger.info('background sync batch complete', { processed, synced, failed });
        }
        return { processed, synced, failed };
    },
};
