"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessRepository = void 0;
const prisma_1 = require("../db/prisma");
function json(value) {
    return (value ?? {});
}
exports.accessRepository = {
    findAccessPoint(id, companyId) {
        return prisma_1.prisma.accessPoint.findFirst({ where: { id, companyId, active: true } });
    },
    upsertAccessPoint(data) {
        if (data.id) {
            return prisma_1.prisma.accessPoint.upsert({
                where: { id: data.id },
                create: {
                    id: data.id,
                    companyId: data.companyId,
                    projectId: data.projectId,
                    zoneId: data.zoneId,
                    name: data.name,
                    rules: json(data.rules),
                },
                update: {
                    projectId: data.projectId,
                    zoneId: data.zoneId,
                    name: data.name,
                    rules: json(data.rules),
                },
            });
        }
        return prisma_1.prisma.accessPoint.create({
            data: {
                companyId: data.companyId,
                projectId: data.projectId,
                zoneId: data.zoneId,
                name: data.name,
                rules: json(data.rules),
            },
        });
    },
    findActiveLockouts(companyId, projectId) {
        return prisma_1.prisma.emergencyLockout.findMany({
            where: {
                companyId,
                active: true,
                OR: [{ projectId: null }, ...(projectId ? [{ projectId }] : [])],
            },
        });
    },
    createAttempt(data) {
        return prisma_1.prisma.accessAttempt.create({ data });
    },
    findAttempt(id, companyId) {
        return prisma_1.prisma.accessAttempt.findFirst({
            where: { id, companyId },
            include: { overrides: true, accessPoint: true },
        });
    },
    createOverride(data) {
        return prisma_1.prisma.accessOverride.create({ data });
    },
    findActiveOverrideForWorker(workerId, accessPointId, now = new Date()) {
        return prisma_1.prisma.accessOverride.findFirst({
            where: {
                accessAttempt: { workerId, accessPointId },
                OR: [{ expiry: null }, { expiry: { gt: now } }],
            },
            orderBy: { approvedAt: 'desc' },
        });
    },
    listWorkerAttempts(workerId, companyId, limit = 20) {
        return prisma_1.prisma.accessAttempt.findMany({
            where: { workerId, companyId },
            orderBy: { timestamp: 'desc' },
            take: limit,
            include: { overrides: true },
        });
    },
    listEquipmentAttempts(equipmentId, companyId, limit = 20) {
        return prisma_1.prisma.accessAttempt.findMany({
            where: { equipmentId, companyId },
            orderBy: { timestamp: 'desc' },
            take: limit,
        });
    },
    countWorkerAttempts(workerId, companyId) {
        return prisma_1.prisma.accessAttempt.groupBy({
            by: ['result'],
            where: { workerId, companyId },
            _count: { result: true },
        });
    },
    countEquipmentAttempts(equipmentId, companyId) {
        return prisma_1.prisma.accessAttempt.groupBy({
            by: ['result'],
            where: { equipmentId, companyId },
            _count: { result: true },
        });
    },
    createEmergencyLockout(data) {
        return prisma_1.prisma.emergencyLockout.create({ data });
    },
};
