"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offlineRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../db/prisma");
exports.offlineRepository = {
    async registerDevice(deviceId, companyId, userId) {
        return prisma_1.prisma.offlineDevice.upsert({
            where: { id: deviceId },
            create: { id: deviceId, companyId, userId },
            update: { lastSyncAt: new Date() },
        });
    },
    async touchDevice(deviceId) {
        return prisma_1.prisma.offlineDevice.update({
            where: { id: deviceId },
            data: { lastSyncAt: new Date() },
        });
    },
    async getDevice(deviceId, companyId) {
        return prisma_1.prisma.offlineDevice.findFirst({ where: { id: deviceId, companyId } });
    },
    async audit(input) {
        return prisma_1.prisma.offlineAudit.create({
            data: {
                deviceId: input.deviceId,
                companyId: input.companyId,
                eventType: input.eventType,
                eventData: input.eventData,
            },
        });
    },
    findCache(deviceId, moduleType, recordId) {
        return prisma_1.prisma.offlineCache.findUnique({
            where: {
                deviceId_moduleType_recordId: { deviceId, moduleType, recordId },
            },
        });
    },
    upsertCache(input) {
        return prisma_1.prisma.offlineCache.upsert({
            where: {
                deviceId_moduleType_recordId: {
                    deviceId: input.deviceId,
                    moduleType: input.moduleType,
                    recordId: input.recordId,
                },
            },
            create: {
                deviceId: input.deviceId,
                companyId: input.companyId,
                moduleType: input.moduleType,
                recordId: input.recordId,
                payload: input.payload,
                lastModified: input.lastModified,
                syncStatus: input.syncStatus,
                clientVersion: input.clientVersion,
                errorMessage: input.errorMessage,
            },
            update: {
                payload: input.payload,
                lastModified: input.lastModified,
                syncStatus: input.syncStatus,
                clientVersion: input.clientVersion,
                errorMessage: input.errorMessage,
            },
        });
    },
    createConflict(input) {
        return prisma_1.prisma.offlineConflict.create({
            data: {
                deviceId: input.deviceId,
                companyId: input.companyId,
                moduleType: input.moduleType,
                recordId: input.recordId,
                localValue: input.localValue,
                serverValue: input.serverValue,
            },
        });
    },
    findConflict(id, companyId) {
        return prisma_1.prisma.offlineConflict.findFirst({ where: { id, companyId } });
    },
    resolveConflict(id, data) {
        return prisma_1.prisma.offlineConflict.update({
            where: { id },
            data: {
                resolvedValue: data.resolvedValue,
                resolvedBy: data.resolvedBy,
                resolvedAt: new Date(),
            },
        });
    },
    countOpenConflicts(deviceId) {
        return prisma_1.prisma.offlineConflict.count({
            where: { deviceId, resolvedAt: null },
        });
    },
    listOpenConflicts(deviceId, companyId) {
        return prisma_1.prisma.offlineConflict.findMany({
            where: { deviceId, companyId, resolvedAt: null },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    },
    listDeviceCache(deviceId, companyId, since) {
        return prisma_1.prisma.offlineCache.findMany({
            where: {
                deviceId,
                companyId,
                ...(since ? { lastModified: { gte: since } } : {}),
            },
            orderBy: { lastModified: 'desc' },
            take: 200,
        });
    },
    listPendingCache(limit) {
        return prisma_1.prisma.offlineCache.findMany({
            where: { syncStatus: client_1.OfflineSyncStatus.pending_sync },
            orderBy: { lastModified: 'asc' },
            take: limit,
        });
    },
};
