"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offlineService = void 0;
const client_1 = require("@prisma/client");
const offline_repository_1 = require("../models/offline.repository");
const sync_engine_1 = require("../engines/sync.engine");
const conflict_resolution_engine_1 = require("../engines/conflict-resolution.engine");
const errors_1 = require("../utils/errors");
exports.offlineService = {
    assertCompanyAccess(tokenCompanyId, requestedCompanyId) {
        if (tokenCompanyId !== requestedCompanyId) {
            throw new errors_1.ForbiddenError('Cross-company access denied');
        }
    },
    async sync(input) {
        await offline_repository_1.offlineRepository.registerDevice(input.deviceId, input.companyId, input.userId);
        const openConflicts = await offline_repository_1.offlineRepository.countOpenConflicts(input.deviceId);
        if (openConflicts > 0 && input.actions.length === 0) {
            throw new errors_1.BadRequestError('Unresolved conflicts must be resolved before sync completes');
        }
        await offline_repository_1.offlineRepository.audit({
            deviceId: input.deviceId,
            companyId: input.companyId,
            eventType: 'sync_batch',
            eventData: { batchId: input.batchId, actionCount: input.actions.length },
        });
        const results = [];
        let synced = 0;
        let conflicts = 0;
        let failed = 0;
        for (const action of input.actions) {
            const result = await sync_engine_1.syncEngine.processAction({
                deviceId: input.deviceId,
                companyId: input.companyId,
                userId: input.userId,
                action,
            });
            results.push(result);
            if (result.ok)
                synced++;
            else if (result.workflowState === 'conflict')
                conflicts++;
            else
                failed++;
        }
        await offline_repository_1.offlineRepository.touchDevice(input.deviceId);
        await offline_repository_1.offlineRepository.audit({
            deviceId: input.deviceId,
            companyId: input.companyId,
            eventType: 'sync_batch_complete',
            eventData: { synced, conflicts, failed, batchId: input.batchId },
        });
        return {
            deviceId: input.deviceId,
            batchId: input.batchId,
            synced,
            conflicts,
            failed,
            results,
            canCompleteSync: conflicts === 0 && failed === 0,
        };
    },
    async resolveConflict(input) {
        const conflict = await offline_repository_1.offlineRepository.findConflict(input.conflictId, input.companyId);
        if (!conflict)
            throw new errors_1.NotFoundError('Conflict not found');
        if (conflict.resolvedAt)
            return conflict;
        const resolvedValue = conflict_resolution_engine_1.conflictResolutionEngine.resolve({
            strategy: input.strategy ?? 'prefer_local',
            localValue: conflict.localValue,
            serverValue: conflict.serverValue,
            merge: input.resolvedValue,
        });
        const updated = await offline_repository_1.offlineRepository.resolveConflict(conflict.id, {
            resolvedValue,
            resolvedBy: input.userId,
        });
        await offline_repository_1.offlineRepository.upsertCache({
            deviceId: conflict.deviceId,
            companyId: conflict.companyId,
            moduleType: conflict.moduleType,
            recordId: conflict.recordId,
            payload: resolvedValue,
            lastModified: new Date(),
            syncStatus: client_1.OfflineSyncStatus.resolved,
        });
        if (input.retrySync !== false) {
            await sync_engine_1.syncEngine.processAction({
                deviceId: conflict.deviceId,
                companyId: conflict.companyId,
                userId: input.userId,
                action: {
                    type: conflict.moduleType,
                    recordId: conflict.recordId,
                    payload: resolvedValue,
                },
            });
        }
        await offline_repository_1.offlineRepository.audit({
            deviceId: conflict.deviceId,
            companyId: conflict.companyId,
            eventType: 'conflict_resolved',
            eventData: {
                conflictId: conflict.id,
                strategy: input.strategy ?? 'prefer_local',
            },
        });
        return updated;
    },
    async getDeviceStatus(deviceId, companyId, since) {
        const device = await offline_repository_1.offlineRepository.getDevice(deviceId, companyId);
        if (!device)
            throw new errors_1.NotFoundError('Device not registered');
        const [cache, openConflicts] = await Promise.all([
            offline_repository_1.offlineRepository.listDeviceCache(deviceId, companyId, since),
            offline_repository_1.offlineRepository.listOpenConflicts(deviceId, companyId),
        ]);
        const counts = cache.reduce((acc, row) => {
            acc[row.syncStatus] = (acc[row.syncStatus] ?? 0) + 1;
            return acc;
        }, {});
        return {
            deviceId,
            companyId,
            registeredAt: device.registeredAt.toISOString(),
            lastSyncAt: device.lastSyncAt?.toISOString() ?? null,
            queue: cache.map((c) => ({
                id: c.id,
                moduleType: c.moduleType,
                recordId: c.recordId,
                workflowState: c.syncStatus,
                lastModified: c.lastModified.toISOString(),
                errorMessage: c.errorMessage,
            })),
            counts,
            openConflicts,
            delta: since
                ? cache.map((c) => ({
                    moduleType: c.moduleType,
                    recordId: c.recordId,
                    payload: c.payload,
                    lastModified: c.lastModified.toISOString(),
                    syncStatus: c.syncStatus,
                }))
                : undefined,
            canCompleteSync: openConflicts.length === 0,
        };
    },
};
