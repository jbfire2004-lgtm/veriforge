"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incidentRepository = void 0;
const prisma_1 = require("../db/prisma");
const notDeleted = { deletedAt: null };
const incidentInclude = {
    witnesses: { where: notDeleted, orderBy: { createdAt: 'desc' } },
    investigations: { where: notDeleted, orderBy: { createdAt: 'desc' } },
    correctiveActionLinks: { orderBy: { createdAt: 'desc' } },
};
exports.incidentRepository = {
    async nextIncidentNumber(companyId) {
        const count = await prisma_1.prisma.incident.count({ where: { companyId, ...notDeleted } });
        const year = new Date().getFullYear();
        return `INC-${year}-${String(count + 1).padStart(5, '0')}`;
    },
    create(data) {
        return prisma_1.prisma.incident.create({ data, include: incidentInclude });
    },
    findById(id, companyId) {
        return prisma_1.prisma.incident.findFirst({
            where: { id, companyId, ...notDeleted },
            include: incidentInclude,
        });
    },
    list(params) {
        const where = {
            companyId: params.companyId,
            ...notDeleted,
        };
        if (params.projectId)
            where.projectId = params.projectId;
        if (params.status)
            where.status = params.status;
        if (params.severity)
            where.severity = params.severity;
        return prisma_1.prisma.incident.findMany({
            where,
            include: incidentInclude,
            orderBy: { occurredAt: 'desc' },
            take: params.limit ?? 50,
            skip: params.offset ?? 0,
        });
    },
    update(id, companyId, data) {
        return prisma_1.prisma.incident.updateMany({ where: { id, companyId, ...notDeleted }, data });
    },
    softDelete(id, companyId) {
        return prisma_1.prisma.incident.updateMany({
            where: { id, companyId, ...notDeleted },
            data: { deletedAt: new Date() },
        });
    },
    addWitness(data) {
        return prisma_1.prisma.incidentWitness.create({ data });
    },
    addInvestigation(data) {
        return prisma_1.prisma.incidentInvestigation.create({ data });
    },
    addCorrectiveActionLink(data) {
        return prisma_1.prisma.incidentCorrectiveActionLink.create({ data });
    },
    findOfflineSync(deviceId, clientSyncId) {
        return prisma_1.prisma.incidentOfflineSync.findUnique({
            where: { deviceId_clientSyncId: { deviceId, clientSyncId } },
        });
    },
    upsertOfflineSync(data) {
        return prisma_1.prisma.incidentOfflineSync.upsert({
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
