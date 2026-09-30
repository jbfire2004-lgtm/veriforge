"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permitRepository = void 0;
const prisma_1 = require("../db/prisma");
const permitInclude = {
    approvals: { orderBy: { approvedAt: 'desc' } },
    safetyRequirements: { orderBy: { checkedAt: 'desc' } },
};
exports.permitRepository = {
    create(data) {
        return prisma_1.prisma.workPermit.create({ data, include: permitInclude });
    },
    findById(id, companyId) {
        return prisma_1.prisma.workPermit.findFirst({
            where: { id, companyId },
            include: permitInclude,
        });
    },
    update(id, companyId, data) {
        return prisma_1.prisma.workPermit.updateMany({ where: { id, companyId }, data });
    },
    addApproval(data) {
        return prisma_1.prisma.permitApproval.create({ data });
    },
    upsertSafetyRequirement(data) {
        return prisma_1.prisma.permitSafetyRequirement.upsert({
            where: {
                permitId_requirementType: {
                    permitId: data.permitId,
                    requirementType: data.requirementType,
                },
            },
            create: {
                permitId: data.permitId,
                requirementType: data.requirementType,
                linkedId: data.linkedId,
                satisfied: data.satisfied,
                metadata: data.metadata ?? {},
            },
            update: {
                linkedId: data.linkedId,
                satisfied: data.satisfied,
                metadata: data.metadata ?? {},
                checkedAt: new Date(),
            },
        });
    },
    findOfflineSync(deviceId, clientSyncId) {
        return prisma_1.prisma.permitOfflineSync.findUnique({
            where: { deviceId_clientSyncId: { deviceId, clientSyncId } },
        });
    },
    upsertOfflineSync(data) {
        return prisma_1.prisma.permitOfflineSync.upsert({
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
