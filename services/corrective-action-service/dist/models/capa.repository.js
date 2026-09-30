"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capaRepository = void 0;
const prisma_1 = require("../db/prisma");
const capaInclude = {
    assignments: { orderBy: { assignedAt: 'desc' } },
    escalations: { orderBy: { triggeredAt: 'desc' } },
    verifications: { orderBy: { verifiedAt: 'desc' } },
    attachments: { orderBy: { createdAt: 'desc' } },
    moduleLinks: true,
};
exports.capaRepository = {
    create(data) {
        return prisma_1.prisma.correctiveAction.create({
            data,
            include: capaInclude,
        });
    },
    findById(id, companyId) {
        return prisma_1.prisma.correctiveAction.findFirst({
            where: { id, companyId },
            include: capaInclude,
        });
    },
    update(id, companyId, data) {
        return prisma_1.prisma.correctiveAction.updateMany({
            where: { id, companyId },
            data,
        });
    },
    addAssignment(data) {
        return prisma_1.prisma.correctiveActionAssignment.create({ data });
    },
    addEscalation(data) {
        return prisma_1.prisma.correctiveActionEscalation.create({ data });
    },
    addVerification(data) {
        return prisma_1.prisma.correctiveActionVerification.create({ data });
    },
    addAttachment(data) {
        return prisma_1.prisma.correctiveActionAttachment.create({ data });
    },
    addModuleLink(data) {
        return prisma_1.prisma.correctiveActionModuleLink.create({ data });
    },
    findOfflineSync(deviceId, clientSyncId) {
        return prisma_1.prisma.correctiveActionOfflineSync.findUnique({
            where: { deviceId_clientSyncId: { deviceId, clientSyncId } },
        });
    },
    upsertOfflineSync(data) {
        return prisma_1.prisma.correctiveActionOfflineSync.upsert({
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
