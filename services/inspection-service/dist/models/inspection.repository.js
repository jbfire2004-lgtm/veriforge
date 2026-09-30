"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectionRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../db/prisma");
const inspectionInclude = {
    findings: { orderBy: { createdAt: 'desc' } },
};
exports.inspectionRepository = {
    create(data) {
        return prisma_1.prisma.inspection.create({
            data,
            include: inspectionInclude,
        });
    },
    findById(id, companyId) {
        return prisma_1.prisma.inspection.findFirst({
            where: { id, companyId, deletedAt: null },
            include: inspectionInclude,
        });
    },
    list(filters) {
        const where = {
            companyId: filters.companyId,
            deletedAt: null,
        };
        if (filters.projectId)
            where.projectId = filters.projectId;
        if (filters.workerId)
            where.workerId = filters.workerId;
        if (filters.equipmentId)
            where.equipmentId = filters.equipmentId;
        if (filters.status)
            where.status = filters.status;
        return prisma_1.prisma.inspection.findMany({
            where,
            include: inspectionInclude,
            orderBy: { createdAt: 'desc' },
            take: filters.limit ?? 100,
        });
    },
    update(id, companyId, data) {
        return prisma_1.prisma.inspection.updateMany({
            where: { id, companyId, deletedAt: null },
            data,
        });
    },
    softDelete(id, companyId) {
        return prisma_1.prisma.inspection.updateMany({
            where: { id, companyId, deletedAt: null },
            data: { deletedAt: new Date(), status: client_1.InspectionStatus.closed },
        });
    },
    replaceFindings(inspectionId, findings) {
        return prisma_1.prisma.$transaction(async (tx) => {
            await tx.inspectionFinding.deleteMany({ where: { inspectionId } });
            if (findings.length === 0)
                return [];
            await tx.inspectionFinding.createMany({
                data: findings.map((f) => ({
                    inspectionId,
                    itemKey: f.itemKey,
                    findingType: f.findingType,
                    severity: f.severity,
                    description: f.description,
                    photoUrl: f.photoUrl,
                    hazardId: f.hazardId,
                    controlId: f.controlId,
                    correctiveActionId: f.correctiveActionId,
                    metadata: f.metadata ?? {},
                })),
            });
            return tx.inspectionFinding.findMany({
                where: { inspectionId },
                orderBy: { createdAt: 'desc' },
            });
        });
    },
    findOfflineSync(deviceId, clientSyncId) {
        return prisma_1.prisma.inspectionOfflineSync.findUnique({
            where: { deviceId_clientSyncId: { deviceId, clientSyncId } },
        });
    },
    upsertOfflineSync(data) {
        return prisma_1.prisma.inspectionOfflineSync.upsert({
            where: {
                deviceId_clientSyncId: {
                    deviceId: data.deviceId,
                    clientSyncId: data.clientSyncId,
                },
            },
            create: {
                companyId: data.companyId,
                deviceId: data.deviceId,
                clientSyncId: data.clientSyncId,
                action: data.action,
                payload: data.payload,
                status: data.status,
                result: data.result,
                syncedAt: data.status === 'synced' ? new Date() : undefined,
            },
            update: {
                status: data.status,
                result: data.result,
                syncedAt: data.status === 'synced' ? new Date() : undefined,
            },
        });
    },
    reload(id, companyId) {
        return this.findById(id, companyId);
    },
};
